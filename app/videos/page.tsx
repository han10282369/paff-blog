import type { Metadata } from "next";
import { ArrowUpRight, Video } from "lucide-react";
import { getDbSiteConfig } from "@/app/lib/site-config-db";

export const metadata: Metadata = { title: "视频" };

type VideoEntry = {
  bvid: `BV${string}`;
  title: string;
  description?: string;
};

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const config = await getDbSiteConfig();
  let videos: VideoEntry[] = [];
  try {
    const saved: unknown = JSON.parse(config.videoEntries || "[]");
    if (Array.isArray(saved)) {
      videos = saved.filter((entry): entry is VideoEntry =>
        !!entry && typeof entry === "object" &&
        typeof entry.bvid === "string" && /^BV[a-zA-Z0-9]{10}$/.test(entry.bvid) &&
        typeof entry.title === "string" && !!entry.title.trim() &&
        (entry.description === undefined || typeof entry.description === "string")
      );
    }
  } catch {
    videos = [];
  }
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-12">
      <header className="mb-6 flex items-center gap-3 md:mb-10">
        <Video aria-hidden="true" className="size-6 text-sky-500 md:size-7" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 md:text-3xl">
          视频专区
        </h1>
      </header>
      {videos.length === 0 ? (
        <p className="border-y border-slate-300/50 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          暂无视频
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {videos.map(({ bvid, title, description }) => (
            <article key={bvid}>
              <iframe
                className="aspect-video w-full rounded-lg bg-slate-900"
                title={title}
                src={`https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&autoplay=0`}
                loading="lazy"
                allowFullScreen
              />
              <h2 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">
                <a
                  href={`https://www.bilibili.com/video/${encodeURIComponent(bvid)}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-sky-500"
                >
                  {title}
                  <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                </a>
              </h2>
              {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
