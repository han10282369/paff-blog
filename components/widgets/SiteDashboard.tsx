"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/siteConfig";
import { useConfigValue } from "@/components/providers/SiteConfigProvider";

export default function SiteDashboard() {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [uptimeStr, setUptimeStr] = useState("");
  const buildDate = useConfigValue("buildDate", siteConfig.buildDate);
  const startDate = new Date(buildDate || "2026-06-16T00:00:00").getTime();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-GB", {
          hourCycle: "h23",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDateStr(now.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "long",
      }));

      if (!Number.isFinite(startDate)) {
        setUptimeStr("建站日期待设置");
        return;
      }
      const diff = Math.max(0, now.getTime() - startDate);
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const minutes = Math.floor((diff / 60000) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setUptimeStr(`${days}天 ${hours}时${minutes}分${seconds}秒`);
    };

    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, [startDate]);

  return (
    <section
      aria-label="数字时钟与建站时长"
      className="flex min-h-[180px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-white/40 bg-white/40 px-3 py-7 shadow-xl backdrop-blur-md transition-colors duration-700 dark:border-white/10 dark:bg-slate-800/50 md:min-h-[220px]"
    >
      <div className="flex w-full flex-col items-center gap-3">
        <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-slate-900 px-3 py-4 shadow-inner dark:bg-black">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          <time className="relative whitespace-nowrap font-mono text-5xl font-black leading-none tracking-wider text-white tabular-nums">
            {timeStr || "--:--"}
          </time>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/50" />
        </div>
        <p className="text-center text-xs font-medium text-slate-700 tabular-nums dark:text-slate-200">
          {dateStr || "正在读取日期…"}
        </p>
      </div>
      <div className="flex flex-col items-center gap-2 text-center text-xs leading-5 text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-500" />
          系统已稳定运行
        </span>
        <span className="font-semibold text-indigo-600 tabular-nums dark:text-indigo-400">
          {uptimeStr || "正在计算…"}
        </span>
      </div>
    </section>
  );
}
