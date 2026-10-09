export const categories = [
  { id: "monstros", label: "Monstros", icon: "◈", count: 12 },
  { id: "racas", label: "Raças", icon: "♙", count: 4 },
  { id: "classes", label: "Classes", icon: "⚔", count: 8 },
  { id: "equipamentos", label: "Equipamentos", icon: "⬡", count: 16 },
  { id: "magias", label: "Magias", icon: "✳", count: 9 },
];

export const sample = {
  id: "brugo-bufante", importId: "brugo-bufante", type: "monstros", name: "Brugo ou Bufante",
  subtitle: "Pesados e incansáveis, sustentam a vida no norte com sua força, couro, gordura e carne resistente.",
  concept: "Animal", size: "Grande", alignment: "Neutro", xp: 125,
  habitats: ["Planícies", "Montanhas", "Geleiras"], hd: "4", hpBonus: "4", hp: "24", ac: "14", jp: "6", morale: "8", movement: "9",
  attacks: [{ count: "1", name: "Chifres", bonus: "+5", damage: "1d8", extra: "+3", effect: "" }],
  encounterQuantity: "2d6", lairEncounterQuantity: "4d6", lairTreasure: "",
  createToken: false, tokenFrameColor: "#133DD8", tokenImage: "", imageVariants: [], tokenVariants: [],
  description: "Os Brugos, chamados de Bufantes pelos povos do Além-Norte, são grandes bovinos cobertos por uma pelagem espessa e irregular. Um adulto possui corpo largo, pescoço curto e uma cabeça pesada protegida por uma placa óssea. Dois chifres grossos crescem nas laterais do crânio, curvando-se para a frente.\n\nSuas pernas curtas e musculosas terminam em cascos largos e divididos, capazes de distribuir seu peso sobre a neve. Essa adaptação permite que atravessem áreas onde cavalos, carroças e homens afundariam rapidamente.\n\nO nome popular vem da respiração forte e ruidosa. No frio, cada expiração produz uma grande nuvem de vapor, e uma manada pode ser percebida à distância pelo som grave e repetitivo de dezenas de animais respirando juntos.\n\nBrugos vivem em manadas conduzidas por fêmeas mais velhas. Revolvem a neve com chifres e cascos para alcançar raízes, líquens e vegetação congelada. Quando criados desde jovens, tornam-se animais de tração, carga e montaria.",
  combat: "Brugos não são predadores e evitam confrontos desnecessários. Diante de uma ameaça, os adultos cercam os filhotes, abaixam a cabeça e emitem bufos profundos antes de atacar.", finalDescription: "",
  image: "", treasure: "", updated: "há 2 min", raceTraits: "", raceAbilities: "", languages: "", infravision: "",
  abilities: [], classSpells: [], classHitDie: "", highLevelHpBonus: "", primeAttribute: "", requirements: "", baProgression: "", jpProgression: "", xpProgression: "", raceRestrictions: "", alignmentRestrictions: "", weaponRestrictions: "", armorRestrictions: "", magicItemRestrictions: "", equipmentType: "", price: "", weight: "", damage: "", properties: "",
  spellLevel: "", school: "arcane", range: "", duration: "", components: "", target: "", jp: "", reverse: false,
};

export function blankEntry(type = "monstros") {
  const id = crypto.randomUUID();
  return { ...sample, id, importId: `odc-${id.slice(0, 8)}`, type, name: "", subtitle: "", description: "", combat: "", finalDescription: "", image: "", createToken: type === "monstros", tokenFrameColor: "#133DD8", tokenImage: "", imageVariants: [], tokenVariants: [], attacks: [], abilities: [], classSpells: [] };
}

const slug = (value) => String(value || "item").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
const allowedRichTags = new Set(["p", "br", "h1", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "hr", "strong", "b", "em", "i", "s", "strike", "code", "pre", "u", "a", "sup", "sub"]);
export function richTextHTML(value) {
  const source = String(value || "").trim();
  if (!source) return "";
  if (!/<(?:p|br|h[1-6]|ul|ol|li|blockquote|hr|strong|b|em|i|s|strike|code|pre|u|a|sup|sub)(?:\s|\/?>)/i.test(source)) {
    return source.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`).join("");
  }
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (tag, rawName) => {
      const name = rawName.toLowerCase();
      if (!allowedRichTags.has(name)) return "";
      if (name === "a" && !tag.startsWith("</")) {
        const href = tag.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
        const safeHref = /^(https?:\/\/|mailto:|#|\/)/i.test(href.trim()) ? href.replace(/&/g, "&amp;").replace(/"/g, "&quot;") : "";
        return safeHref ? `<a href="${safeHref}" rel="noopener noreferrer">` : "<a>";
      }
      return tag.startsWith("</") ? `</${name}>` : `<${name}>`;
    });
}
const html = (text) => richTextHTML(text);
const fullDescriptionHTML = (entry) => [
  ["Descrição (Início)", entry.description],
  ["Descrição (Habilidades de Combate)", entry.combat],
  ["Descrição (Final)", entry.finalDescription],
].filter(([, value]) => String(value || "").trim()).map(([title, value]) => `<h2>${title}</h2>${html(value)}`).join("");
const list = (value) => String(value || "").split(",").map(v => v.trim()).filter(Boolean);
const progression = (value) => String(value || "").split(",").map(v => v.trim()).filter(v => v !== "").map(v => Number(v)).filter(Number.isFinite);
const itemId = (entry) => slug(entry.importId || entry.id || entry.name);
const abilityId = (ability, index) => slug(ability.id || `${ability.name || "habilidade"}-${index + 1}`);
const spellSystem = (spell) => ({
  arcane: spell.school === "arcane" ? String(spell.spellLevel || "null") : "null",
  divine: spell.school === "divine" ? String(spell.spellLevel || "null") : "null",
  necromancer: spell.school === "necromancer" ? String(spell.spellLevel || "null") : "null",
  illusionist: spell.school === "illusionist" ? String(spell.spellLevel || "null") : "null",
  range: spell.range || "", duration: spell.duration || "", jp: spell.jp || "", reverse: Boolean(spell.reverse),
});

export function toFoundryJSON(entry) {
  const base = { id: itemId(entry), name: entry.name || "Sem nome", img: entry.image || "icons/svg/mystery-man.svg", flavor: html(entry.subtitle), description: fullDescriptionHTML(entry) };
  if (entry.type === "racas") return { races: [{ ...base,
    system: { movement: Number(entry.movement) || 0, infravision: Number(entry.infravision) || 0, alignment_tendency: ({ Ordeiro: "order", Neutro: "neutral", Caótico: "chaos" })[entry.alignment] || "neutral" },
    abilities: (entry.abilities || []).filter(a => a.name || a.description).map((a, i) => ({ id: abilityId(a, i), name: a.name || "Habilidade", description: html(a.description) })),
  }] };
  if (entry.type === "classes") {
    const ba = progression(entry.baProgression), jp = progression(entry.jpProgression), xp = progression(entry.xpProgression);
    const levels = {};
    for (let i = 0; i < Math.max(ba.length, jp.length, xp.length); i++) {
      levels[String(i + 1)] = { ...(ba[i] !== undefined ? { ba: ba[i] } : {}), ...(jp[i] !== undefined ? { jp: jp[i] } : {}), ...(i > 0 && xp[i] !== undefined ? { xp: xp[i] } : {}) };
    }
    const toAbility = (a, i) => ({ id: abilityId(a, i), ...(Number(a.level) > 0 ? { level: Number(a.level) } : {}), name: a.name || "Habilidade", description: html(a.description) });
    return { classes: [{ ...base,
      system: { hp: Number(entry.classHitDie) || 0, high_level_hp_bonus: Number(entry.highLevelHpBonus) || 0, levels,
        restrictions: { alignments: list(entry.alignmentRestrictions), races: list(entry.raceRestrictions) },
        equipment_restrictions: { weapons: entry.weaponRestrictions || "", armors: entry.armorRestrictions || "", magic_items: entry.magicItemRestrictions || "" } },
      abilities: (entry.abilities || []).filter(a => a.name || a.description).map(toAbility),
      spells: (entry.classSpells || []).filter(s => s.name || s.description).map((s, i) => ({ id: abilityId(s, i), name: s.name || "Magia", description: html(s.description), system: spellSystem(s) })),
    }] };
  }
  if (entry.type === "magias") return { spells: [{ id: itemId(entry), name: entry.name || "Sem nome", description: fullDescriptionHTML(entry), system: spellSystem(entry) }] };
  return { [entry.type]: [{ ...base, system: { ...entry } }] };
}
