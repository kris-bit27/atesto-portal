"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import RichTextEditorClientOnly from "@/app/components/editor/RichTextEditorClientOnly";
import SaveStatusBadge from "@/app/components/SaveStatusBadge";

type Status = "DRAFT" | "PUBLISHED";

type Props = {
  slug: string;
  initialTitle: string;
  initialStatus: Status;
  initialHtml: string;
};

export default function EditorClient({
  slug,
  initialTitle,
  initialStatus,
  initialHtml,
}: Props) {
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<Status>(initialStatus || "DRAFT");
  const [contentHtml, setContentHtml] = useState(initialHtml || "");

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const [publishState, setPublishState] = useState<"" | "saving" | "saved" | "error">("");
  const [publishError, setPublishError] = useState<string | undefined>(undefined);

  const timerRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    setTitle(initialTitle);
    setStatus((initialStatus as Status) || "DRAFT");
    setContentHtml(initialHtml || "");

    const snap = JSON.stringify({
      title: initialTitle ?? "",
      status: (initialStatus as Status) ?? "DRAFT",
      contentHtml: initialHtml ?? "",
    });
    lastSavedRef.current = snap;
    hydratedRef.current = true;
    setSaveState("saved");
  }, [initialTitle, initialStatus, initialHtml]);

  const snapshot = useMemo(
    () =>
      JSON.stringify({
        title,
        contentHtml,
      }),
    [title, contentHtml]
  );

  async function doSave() {
    setSaveState("saving");
    setSaveError(undefined);

    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          contentHtml,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Save failed (${res.status})`);

      lastSavedRef.current = snapshot;
      setSaveState("saved");
    } catch (e: any) {
      setSaveState("error");
      setSaveError(String(e?.message ?? e));
    }
  }

  async function updateStatus(nextStatus: Status) {
    if (!adminKey) return;
    setPublishState("saving");
    setPublishError(undefined);
    try {
      const qs = adminKey ? `?key=${encodeURIComponent(adminKey)}` : "";
      const res = await fetch(`/api/admin/question/${encodeURIComponent(slug)}${qs}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Update failed (${res.status})`);
      setStatus(nextStatus);
      setPublishState("saved");
      setTimeout(() => setPublishState(""), 1200);
    } catch (e: any) {
      setPublishState("error");
      setPublishError(String(e?.message ?? e));
      setTimeout(() => setPublishState(""), 2000);
    }
  }

  // AUTOSAVE (debounce)
  useEffect(() => {
    if (!hydratedRef.current) return;

    if (snapshot === lastSavedRef.current) {
      if (saveState !== "error") setSaveState("saved");
      return;
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    setSaveState("saving");
    setSaveError(undefined);

    timerRef.current = window.setTimeout(() => {
      void doSave();
    }, 800);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  return (
    <main className="mx-auto max-w-4xl p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/read/${slug}`} className="underline opacity-90">
            ← Zpět na čtení
          </Link>

          <span className="opacity-80 text-sm">
            Status: <b>{status}</b>
          </span>

          <SaveStatusBadge state={saveState} errorText={saveError} />
          {publishState === "saving" ? <span className="opacity-80 text-sm">Updating…</span> : null}
          {publishState === "saved" ? <span className="opacity-80 text-sm">Updated</span> : null}
          {publishState === "error" ? (
            <span className="text-sm text-red-300">Update failed{publishError ? ` (${publishError})` : ""}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            onClick={() => doSave()}
          >
            Uložit
          </button>
          {adminKey ? (
            <>
              <button
                type="button"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                disabled={publishState === "saving"}
                onClick={() => updateStatus("DRAFT")}
              >
                Unpublish
              </button>
              <button
                type="button"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                disabled={publishState === "saving"}
                onClick={() => updateStatus("PUBLISHED")}
              >
                Publish
              </button>
            </>
          ) : null}
        </div>
      </div>

      <input
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-base"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Název otázky…"
      />

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        <RichTextEditorClientOnly value={contentHtml} onChange={setContentHtml} />
      </div>

      {saveState === "error" ? (
        <p className="text-sm text-red-300">
          Uložení selhalo. {saveError ? `(${saveError})` : ""}
        </p>
      ) : null}
    </main>
  );
}
