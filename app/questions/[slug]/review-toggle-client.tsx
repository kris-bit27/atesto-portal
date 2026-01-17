"use client";

import { useEffect, useState } from "react";
import { addToReview, removeFromReview, isInReview } from "@/app/lib/srs";

export default function ReviewToggleClient({ slug }: { slug: string }) {
  const [inReview, setInReview] = useState(false);

  useEffect(() => {
    setInReview(isInReview(slug));
    const onUpdate = () => setInReview(isInReview(slug));
    window.addEventListener("atesto-srs-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("atesto-srs-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [slug]);

  return (
    <button
      type="button"
      className={inReview ? "atesto-btn atesto-btn-primary" : "atesto-btn"}
      onClick={() => {
        if (inReview) removeFromReview(slug);
        else addToReview(slug);
        setInReview(!inReview);
      }}
    >
      {inReview ? "V review ✓" : "Přidat do review"}
    </button>
  );
}
