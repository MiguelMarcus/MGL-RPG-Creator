"use client";

import { useRouter } from "next/navigation";
import CreationTypePicker from "../components/odc/CreationTypePicker";
import { useODC } from "../state/ODCProvider";

export default function CreatePage() {
  const router = useRouter();
  const { startCreation } = useODC();
  return <CreationTypePicker onChoose={startCreation} onCancel={() => router.push("/")} />;
}
