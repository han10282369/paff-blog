"use client";

import { useEffect, useRef, useState } from "react";

const reactions = [
  {
    src: "/mascot/blue-fat-fish-react-wave.webm",
    line: "PAFF 的小站今天也有新访客啦。",
  },
  {
    src: "/mascot/blue-fat-fish-eat-rice.webm",
    line: "今天吃白饭，省下来的 token 留给 PAFF。",
  },
  {
    src: "/mascot/blue-fat-fish-eat-token.webm",
    line: "余额见底啦，来点 token 加餐？",
  },
  {
    src: "/mascot/blue-fat-fish-outfit-tryon.webm",
    line: "试了套新衣服，你觉得怎么样？",
  },
  {
    src: "/mascot/blue-fat-fish-react-happy.webm",
    line: "嘿嘿，看到你我就开心。",
  },
  {
    src: "/mascot/blue-fat-fish-react-tickle.webm",
    line: "痒痒的，别挠啦。",
  },
  {
    src: "/mascot/blue-fat-fish-react-tsundere.webm",
    line: "才、才不是特意等你呢。",
  },
];

const idleLine = "在 PAFF 的小站里慢慢逛吧。";

export default function Live2D() {
  const [offset, setOffset] = useState(() => {
    if (typeof window === "undefined") return { right: 0, bottom: 0 };
    try {
      const saved = localStorage.getItem("paff-fish-position");
      if (saved) {
        const position = JSON.parse(saved) as { right?: number; bottom?: number };
        return {
          right: Math.max(0, Number(position.right) || 0),
          bottom: Math.max(0, Number(position.bottom) || 0),
        };
      }
    } catch {
      return { right: 0, bottom: 0 };
    }
    return { right: 0, bottom: 0 };
  });
  const [message, setMessage] = useState("");
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startRight: 0,
    startBottom: 0,
    moved: false,
  });
  const lastReaction = useRef(-1);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  function reactToTap() {
    const index = (lastReaction.current + 1) % reactions.length;
    lastReaction.current = index;
    setActiveClip(reactions[index].src);
    setMessage(reactions[index].line);
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    drag.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startRight: window.innerWidth - bounds.right,
      startBottom: window.innerHeight - bounds.bottom,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePet(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture.active) return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (!gesture.moved && Math.hypot(deltaX, deltaY) < 6) return;
    gesture.moved = true;

    const bounds = event.currentTarget.getBoundingClientRect();
    const next = {
      right: Math.max(0, Math.min(window.innerWidth - bounds.width, gesture.startRight - deltaX)),
      bottom: Math.max(0, Math.min(window.innerHeight - bounds.height, gesture.startBottom - deltaY)),
    };
    setOffset(next);
  }

  function finishDrag() {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (!drag.current.moved) return;
    try {
      localStorage.setItem("paff-fish-position", JSON.stringify(offset));
    } catch {
      // Keep dragging usable when browser storage is unavailable.
    }
    window.setTimeout(() => {
      drag.current.moved = false;
    }, 0);
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (drag.current.moved) return;
    if (event.detail > 1) {
      setOffset({ right: 0, bottom: 0 });
      setMessage(idleLine);
      try {
        localStorage.removeItem("paff-fish-position");
      } catch {
        // The home position still resets for this visit.
      }
      return;
    }
    reactToTap();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    reactToTap();
  }

  return (
    <div
      aria-label="蓝色大肥鱼桌宠"
      className="fixed z-40 hidden w-[min(38vw,420px)] cursor-grab touch-none select-none md:block active:cursor-grabbing"
      onClick={handleClick}
      onDoubleClick={() => {
        setOffset({ right: 0, bottom: 0 });
        setMessage(idleLine);
        try {
          localStorage.removeItem("paff-fish-position");
        } catch {
          // The home position still resets for this visit.
        }
      }}
      onKeyDown={handleKeyDown}
      onPointerCancel={finishDrag}
      onPointerDown={startDrag}
      onPointerMove={movePet}
      onPointerUp={finishDrag}
      role="button"
      style={{ right: offset.right, bottom: offset.bottom }}
      tabIndex={0}
    >
      {message && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute bottom-[82%] right-[12%] max-w-[250px] rounded-xl border border-white/15 bg-slate-900/90 px-4 py-2 text-sm leading-6 text-white shadow-lg backdrop-blur"
        >
          {message}
        </div>
      )}
      <video
        autoPlay
        className="block h-auto w-full"
        draggable={false}
        key={activeClip ?? "idle"}
        loop={!activeClip}
        muted
        onEnded={() => setActiveClip(null)}
        playsInline
        preload="metadata"
        src={activeClip ?? "/mascot/blue-fat-fish-idle.webm"}
      />
    </div>
  );
}
