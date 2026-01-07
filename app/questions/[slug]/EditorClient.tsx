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
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<Status>(initialStatus || "DRAFT");
  const [contentHtml, setContentHtml] = useState(initialHtml || "");

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | undefined>(undefined);

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
        status,
        contentHtml,
      }),
    [title, status, contentHtml]
  );

  async function doSave(next?: { status?: Status }) {
    setSaveState("saving");
    setSaveError(undefined);

    const nextStatus = next?.status ?? status;

    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          status: nextStatus,
          contentHtml,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Save failed (${res.status})`);

      setStatus(nextStatus);
      lastSavedRef.current = snapshot;
      setSaveState("saved");
    } catch (e: any) {
      setSaveState("error");
      setSaveError(String(e?.message ?? e));
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
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            onClick={() => doSave()}
          >
            Uložit
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            onClick={() => doSave({ status: "DRAFT" })}
          >
            Nastavit DRAFT
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            onClick={() => doSave({ status: "PUBLISHED" })}
          >
            Publish
          </button>
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
