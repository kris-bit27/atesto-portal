"use client";

type Props = {
  state: "idle" | "saving" | "saved" | "error";
  errorText?: string;
};

export default function SaveStatusBadge({ state, errorText }: Props) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs";

  if (state === "saving") {
    return (
      <span className={`${base} border-yellow-500/40 bg-yellow-500/10 text-yellow-200`}>
        <span className="h-2 w-2 rounded-full bg-yellow-300" />
        Saving…
      </span>
    );
  }

  if (state === "saved") {
    return (
      <span className={`${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-200`}>
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
        Saved
      </span>
    );
  }

  if (state === "error") {
    return (
      <span
        className={`${base} border-red-500/40 bg-red-500/10 text-red-200`}
        title={errorText ?? "Save failed"}
      >
        <span className="h-2 w-2 rounded-full bg-red-300" />
        Error saving
      </span>
    );
  }

  return (
    <span className={`${base} border-zinc-700 bg-zinc-900 text-zinc-300`}>
      <span className="h-2 w-2 rounded-full bg-zinc-500" />
      Idle
    </span>
  );
}
