import test from "node:test";
import assert from "node:assert/strict";
import { monsterHitPoints } from "./odc.mjs";

test("calcula PV como DV vezes cinco mais o bônus", () => {
  assert.equal(monsterHitPoints({ hd: "4", hpBonus: "2", hp: "" }), 22);
});

test("aceita DV e bônus com vírgula decimal", () => {
  assert.equal(monsterHitPoints({ hd: "2,5", hpBonus: "1,5" }), 14);
});

test("mantém PV manual quando os dados de vida não são numéricos", () => {
  assert.equal(monsterHitPoints({ hd: "4d8", hp: "19" }), "19");
});

test("retorna zero em vez de tratar PV zero como vazio", () => {
  assert.equal(monsterHitPoints({ hd: "1", hpBonus: "-5" }), 0);
});
