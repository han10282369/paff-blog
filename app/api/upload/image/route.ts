import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { uploadFile, deleteFile, cleanUrlPath, generateFileName } from "@/app/lib/r2";
import sharp from "sharp";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const payload = await getCurrentUser(request);
    const userId = parseInt(payload.sub as string);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "缺少文件" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "文件大小超过 10MB 限制" }, { status: 400 });
    }

    const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1];
    const filename = generateFileName(ext);
    const key = `uploads/${filename}`;

    const buffer = await file.arrayBuffer();

    // Small personal libraries can store compressed images with their existing
    // avatar, cover or photo record when object storage is not configured.
    if (!process.env.R2_PUBLIC_URL) {
      try {
        const image = sharp(Buffer.from(buffer), { animated: true, limitInputPixels: 40_000_000 }).rotate();
        const metadata = await image.metadata();
        const encoded = await image
          .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 76 })
          .toBuffer();
        if (encoded.length > 512 * 1024) {
          return NextResponse.json({ error: "图片压缩后仍过大，请缩小图片后重试" }, { status: 413 });
        }
        return NextResponse.json({
          url: `data:image/webp;base64,${encoded.toString("base64")}`,
          orientation: (metadata.autoOrient?.width ?? metadata.width ?? 0) >= (metadata.autoOrient?.height ?? metadata.height ?? 0) ? "landscape" : "portrait",
        });
      } catch {
        return NextResponse.json({ error: "无法读取图片，请上传有效的 JPG、PNG、WebP 或 GIF" }, { status: 400 });
      }
    }

    // 简易方向检测（Cloudflare 不支持 sharp 原生模块）
    const orientation = "landscape";
    // 后续可通过 Cloudflare Images 的 metadata 获取，这里默认 landscape

    const imageUrl = await uploadFile(key, buffer, file.type);

    return NextResponse.json({
      url: imageUrl,
      orientation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "上传失败";
    if (message === "未登录" || message === "无效的令牌") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    console.error("Upload image error:", err);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    const userId = parseInt(payload.sub as string);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
    }

    if (url.startsWith("data:image/webp;base64,")) {
      return NextResponse.json({ code: 0, message: "删除成功" });
    }

    const key = cleanUrlPath(url);
    if (key.includes("..") || key.includes("\\")) {
      return NextResponse.json({ error: "非法文件名" }, { status: 400 });
    }

    await deleteFile(key);
    return NextResponse.json({ code: 0, message: "删除成功" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "删除失败";
    console.error("Delete image error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
