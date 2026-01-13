"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

/**
 * Shared taxonomy filters for Home/Read/Search.
 * - query (string)
 * - onlyPublished (bool)
 * - onlyFav (bool)
 * - hideEmpty (bool)  // mainly Home/Read topics view
 * - specialtyId/domainId (string)
 */

function setUrlParam(url: URL, key: string, value: string) {
  if (!value) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
}
export function useTaxonomyFilters(opts?: { defaultHideEmpty?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const q = useMemo(() => query.trim().toLowerCase(), [query]);

  const [onlyPublished, setOnlyPublished] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(opts?.defaultHideEmpty ?? true);  // init from URL (?sp=...&dom=...)
  const initSp = searchParams.get("sp") ?? "";
  const initDom = searchParams.get("dom") ?? "";



  const [specialtyId, setSpecialtyId] = useState<string>(initSp);
const [domainId, setDomainId] = useState<string>(initDom);
return {
    resetFilters: () => { setQuery(""); setSpecialtyId(""); setDomainId(""); },
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
