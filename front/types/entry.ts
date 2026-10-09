export const creationTypes = ["monstros", "racas", "classes", "equipamentos", "magias"] as const;

export type CreationType = (typeof creationTypes)[number];

export type CreationEntry = {
  id: string;
  type: CreationType;
  name: string;
  [campo: string]: unknown;
};
