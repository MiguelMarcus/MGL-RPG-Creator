"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CreationLibrary from "../components/odc/CreationLibrary";
import { useODC } from "../state/ODCProvider";
import { categories } from "../../back/odc.mjs";

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { entries, query, setQuery, openEntry, setActive } = useODC();
  const requestedCategory = searchParams.get("categoria");
  const active = categories.some(category => category.id === requestedCategory) ? requestedCategory : "todos";

  useEffect(() => {
    setActive(active);
  }, [active, setActive]);

  return <CreationLibrary
    entries={entries}
    active={active}
    query={query}
    onQueryChange={setQuery}
    onCreate={() => router.push("/criar")}
    onView={item => openEntry(item, "/visualizar")}
    onEdit={item => openEntry(item)}
  />;
}
