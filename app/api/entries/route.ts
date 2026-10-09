import { createEntry, listEntries } from "../../../server/entry-repository";
import { creationTypes, type CreationEntry } from "../../../front/types/entry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validateEntry(value: unknown): { entry?: CreationEntry; message?: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { message: "Envie uma criação em formato JSON válido." };
  const entry = value as Partial<CreationEntry>;
  if (typeof entry.id !== "string" || typeof entry.name !== "string" || typeof entry.type !== "string") return { message: "A criação enviada está incompleta." };
  if (!entry.name.trim()) return { message: "Informe um nome para a criação." };
  if (!creationTypes.includes(entry.type as CreationEntry["type"])) return { message: "O tipo da criação é inválido." };
  return { entry: entry as CreationEntry };
}

export async function GET() {
  return Response.json(await listEntries());
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const result = validateEntry(payload);
  if (!result.entry) return Response.json({ message: result.message }, { status: 400 });
  const entry = await createEntry(result.entry);
  if (!entry) return Response.json({ message: "Já existe uma criação com este identificador." }, { status: 409 });
  return Response.json(entry, { status: 201 });
}
