"use client";

import { useMemo, useState } from "react";

/**
 * Shared taxonomy filters for Home/Read/Search.
 * - query (string)
 * - onlyPublished (bool)
 * - onlyFav (bool)
 * - hideEmpty (bool)  // mainly Home/Read topics view
 * - specialtyId/domainId (string)
 */
export function useTaxonomyFilters(opts?: { defaultHideEmpty?: boolean }) {
  const [query, setQuery] = useState("");
  const q = useMemo(() => query.trim().toLowerCase(), [query]);

  const [onlyPublished, setOnlyPublished] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(opts?.defaultHideEmpty ?? true);

  const [specialtyId, setSpecialtyId] = useState<string>("");
  const [domainId, setDomainId] = useState<string>("");

  return {
    query,
    setQuery,
    q,

    onlyPublished,
    setOnlyPublished,

    onlyFav,
    setOnlyFav,

    hideEmpty,
    setHideEmpty,

    specialtyId,
    setSpecialtyId,

    domainId,
    setDomainId,
  };
}
