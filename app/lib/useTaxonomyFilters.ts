"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Opts = {
  defaultHideEmpty?: boolean;
  /** když true, bude se specialty/domain propisovat do URL (?sp=...&dom=...) */
  syncToUrl?: boolean;
};

function setUrlParam(url: URL, key: string, value: string) {
  if (!value) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
}

export function useTaxonomyFilters(opts: Opts = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const init = useMemo(() => {
    return {
      sp: searchParams?.get("sp") ?? "",
      dom: searchParams?.get("dom") ?? "",
    };
  }, [searchParams]);

  const [query, setQuery] = useState("");
  
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(t);
  }, [query]);

const q = useMemo(() => debouncedQuery.trim().toLowerCase(), [debouncedQuery]);
const [onlyPublished, setOnlyPublished] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);

  // mainly Home/Read (topics view)
  const [hideEmpty, setHideEmpty] = useState(opts.defaultHideEmpty ?? true);

  const [specialtyId, setSpecialtyId] = useState<string>(init.sp);
  const [domainId, setDomainId] = useState<string>(init.dom);

  // když přijdeme na stránku s URL parametry, nastav je (ať funguje refresh/navigace)
  useEffect(() => {
    setSpecialtyId(init.sp);
    setDomainId(init.dom);
    // nechceme přepisovat query/checkboxy z URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init.sp, init.dom]);

  // volitelně sync do URL (shareable link)
  useEffect(() => {
    if (!opts.syncToUrl) return;
    const url = new URL(window.location.href);
    setUrlParam(url, "sp", specialtyId);
    setUrlParam(url, "dom", domainId);
    router.replace(`${pathname}?${url.searchParams.toString()}`, { scroll: false });
  }, [specialtyId, domainId, opts.syncToUrl, pathname, router]);

  const resetFilters = () => {
    setQuery("");
    setOnlyPublished(false);
    setOnlyFav(false);
    setSpecialtyId("");
    setDomainId("");
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
  };
}
