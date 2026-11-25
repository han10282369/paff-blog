/** Compress personal blog images locally and save the returned URL with content. */
export async function prepareInlineImage(file: File): Promise<{ url: string; orientation: string }> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    throw new Error("请选择 JPG、PNG、WebP 或 GIF 图片");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("图片不能超过 10MB");
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const { naturalWidth: width, naturalHeight: height } = image;
    if (width * height > 40_000_000) throw new Error("图片分辨率过高，请缩小后重试");
    const orientation = width >= height ? "landscape" : "portrait";
    let blob: Blob = file;
    if (file.type !== "image/gif") {
      const scale = Math.min(1, 1280 / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("浏览器无法处理图片");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(result => result ? resolve(result) : reject(new Error("图片压缩失败")), "image/webp", 0.76);
      });
    }
    if (blob.size > 512 * 1024) throw new Error("图片处理后超过 512KB，请缩小图片或动图后重试");
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("读取图片失败"));
      reader.readAsDataURL(blob);
    });
    return { url, orientation };
  } finally {
    URL.revokeObjectURL(source);
  }
}
