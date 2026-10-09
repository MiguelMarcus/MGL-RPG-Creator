"use client";

import { useRouter } from "next/navigation";
import CreationLibrary from "../components/odc/CreationLibrary";
import { useODC } from "../state/ODCProvider";

export default function LibraryPage() {
  const router = useRouter();
  const { entries, active, query, setQuery, openEntry } = useODC();

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
