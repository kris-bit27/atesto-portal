"use client";

import { useEffect, useMemo, useState } from "react";

type Opts = {
  defaultHideEmpty?: boolean;
  defaultOnlyPublished?: boolean;
  /** když true, bude se specialty/domain propisovat do URL (?sp=...&dom=...) */
  syncToUrl?: boolean;
};

function setUrlParam(url: URL, key: string, value: string) {
  if (!value) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
}

export function useTaxonomyFilters(opts: Opts = {}) {
  const [query, setQuery] = useState("");

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  const q = useMemo(() => debouncedQuery.trim().toLowerCase(), [debouncedQuery]);
  const [onlyPublished, setOnlyPublished] = useState(Boolean(opts.defaultOnlyPublished));
  const [onlyFav, setOnlyFav] = useState(false);

  // mainly Home/Read (topics view)
  const [hideEmpty, setHideEmpty] = useState(opts.defaultHideEmpty ?? true);

  const [specialtyId, setSpecialtyId] = useState<string>("");
  const [domainId, setDomainId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  // když přijdeme na stránku s URL parametry, nastav je (ať funguje refresh/navigace)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sp = new URLSearchParams(window.location.search).get("sp") ?? "";
      const dom = new URLSearchParams(window.location.search).get("dom") ?? "";
      const cat = new URLSearchParams(window.location.search).get("cat") ?? "";
      const sub = new URLSearchParams(window.location.search).get("sub") ?? "";
      setSpecialtyId(sp);
      setDomainId(dom);
      setCategoryId(cat);
      setSubcategoryId(sub);
    } catch {
      setSpecialtyId("");
      setDomainId("");
      setCategoryId("");
      setSubcategoryId("");
    }
    // nechceme přepisovat query/checkboxy z URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // volitelně sync do URL (shareable link)
  useEffect(() => {
    if (!opts.syncToUrl) return;
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    setUrlParam(url, "sp", specialtyId);
    setUrlParam(url, "dom", domainId);
    setUrlParam(url, "cat", categoryId);
    setUrlParam(url, "sub", subcategoryId);
    const next = `${url.pathname}?${url.searchParams.toString()}`;
    window.history.replaceState(null, "", next);
  }, [specialtyId, domainId, categoryId, subcategoryId, opts.syncToUrl]);

  const resetFilters = () => {
    setQuery("");
    setOnlyPublished(Boolean(opts.defaultOnlyPublished));
    setOnlyFav(false);
    setSpecialtyId("");
    setDomainId("");
    setCategoryId("");
    setSubcategoryId("");
    setHideEmpty(opts.defaultHideEmpty ?? true);
  };

  return {
    resetFilters,

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

    categoryId,
    setCategoryId,

    subcategoryId,
    setSubcategoryId,
  };
}
