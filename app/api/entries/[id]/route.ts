import { getEntry, removeEntry, updateEntry } from "../../../../server/entry-repository";
import { creationTypes, type CreationEntry } from "../../../../front/types/entry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ id: string }> };

function validEntry(value: unknown): value is CreationEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entry = value as Partial<CreationEntry>;
  return typeof entry.id === "string" && typeof entry.name === "string" && entry.name.trim().length > 0 && creationTypes.includes(entry.type as CreationEntry["type"]);
}

export async function GET(_: Request, { params }: RouteContext) {
  const entry = await getEntry((await params).id);
  return entry ? Response.json(entry) : Response.json({ message: "Criação não encontrada." }, { status: 404 });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const payload = await request.json().catch(() => null);
  if (!validEntry(payload)) return Response.json({ message: "A criação enviada é inválida." }, { status: 400 });
  const entry = await updateEntry((await params).id, payload);
  return entry ? Response.json(entry) : Response.json({ message: "Criação não encontrada." }, { status: 404 });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const removed = await removeEntry((await params).id);
  return removed ? new Response(null, { status: 204 }) : Response.json({ message: "Criação não encontrada." }, { status: 404 });
}
