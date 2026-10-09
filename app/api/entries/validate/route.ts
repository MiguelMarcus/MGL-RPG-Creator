import { creationTypes, type CreationEntry } from "../../../../front/types/entry";

export const runtime = "nodejs";

function isEntry(value: unknown): value is CreationEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === "string" && typeof entry.name === "string" && typeof entry.type === "string";
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ valid: false, message: "Envie uma criação em formato JSON válido." }, { status: 400 });
  }

  if (!isEntry(payload)) {
    return Response.json({ valid: false, message: "A criação enviada está incompleta." }, { status: 400 });
  }

  if (!payload.name.trim()) {
    return Response.json({ valid: false, message: "Informe um nome para a criação." }, { status: 422 });
  }

  if (!creationTypes.includes(payload.type)) {
    return Response.json({ valid: false, message: "O tipo da criação é inválido." }, { status: 422 });
  }

  return Response.json({ valid: true });
}
