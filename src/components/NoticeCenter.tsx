import { useEffect } from "react";

export type NoticeTone = "error" | "info" | "success" | "undo" | "warning";

export interface AppNotice {
  actionLabel?: string;
  id: number;
  message: string;
  onAction?: () => void;
  tone: NoticeTone;
}

interface NoticeCenterProps {
  notice: AppNotice | null;
  onDismiss: () => void;
  reducedMotion: boolean;
}

export function NoticeCenter({ notice, onDismiss, reducedMotion }: NoticeCenterProps) {
  useEffect(() => {
    if (!notice || notice.tone === "undo" || notice.tone === "error") {
      return;
    }
    const timer = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(timer);
  }, [notice, onDismiss]);

  if (!notice) {
    return null;
  }

  const assertive = notice.tone === "error";
  return (
    <div
      aria-atomic="true"
      aria-live={assertive ? "assertive" : "polite"}
      className={`notice-center notice-${notice.tone}${reducedMotion ? " reduced-motion" : ""}`}
      role={assertive ? "alert" : "status"}
    >
      <span className="notice-symbol" aria-hidden="true">{getNoticeSymbol(notice.tone)}</span>
      <span>{notice.message}</span>
      {notice.actionLabel && notice.onAction ? (
        <button
          type="button"
          onClick={() => {
            notice.onAction?.();
            onDismiss();
          }}
        >
          {notice.actionLabel}
        </button>
      ) : null}
      <button aria-label="Dismiss notification" className="notice-dismiss" type="button" onClick={onDismiss}>×</button>
    </div>
  );
}

function getNoticeSymbol(tone: NoticeTone) {
  if (tone === "error") return "!";
  if (tone === "warning") return "△";
  if (tone === "success") return "✓";
  if (tone === "undo") return "↺";
  return "i";
}
