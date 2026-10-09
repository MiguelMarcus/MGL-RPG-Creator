export const creationTypes = ["monstros", "racas", "classes", "equipamentos", "magias"] as const;
export type CreationType = (typeof creationTypes)[number];
export type Attack = { id: string; count: string; name: string; bonus: string; weapon: boolean; damage: string; extra: string; effect: string };
export type Ability = { id: string; name: string; description: string; level?: string };
export type ClassSpell = { id: string; name: string; description: string; school: string; spellLevel: string; range: string; duration: string; jp: string; reverse: boolean };
export type ClassLevel = { id?: string; level: string; xp: string; hp: string; ba: string; jp: string };
export type ImageVariant = { id: string; name: string; image: string };
export type TokenCrop = { zoom: number; x: number; y: number };

export interface CreationEntry {
  id: string;
  importId: string;
  type: CreationType;
  name: string;
  subtitle: string;
  image: string;
  description: string;
  combat: string;
  finalDescription: string;
  descriptionFont: string;
  updated: string;
  created?: string;
  habitats: string[];
  attacks: Attack[];
  abilities: Ability[];
  classSpells: ClassSpell[];
  classLevels: ClassLevel[];
  imageVariants: ImageVariant[];
  tokenVariants: ImageVariant[];
  tokenCrop: TokenCrop;
  [campo: string]: unknown;
}
