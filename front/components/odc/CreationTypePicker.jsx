import { categories } from "../../../back/odc.mjs";

const descriptions = {
  monstros: "Criaturas, encontros, ataques e tesouros.",
  racas: "Características, habilidades e personalidade de uma raça.",
  classes: "Classes, especializações, progressão e habilidades.",
  equipamentos: "Armas, armaduras, itens e propriedades.",
  magias: "Magias, círculos, alcance e duração.",
};

export default function CreationTypePicker({ onChoose, onCancel }) {
  return <main className="creation-type-page">
    <header className="creation-type-heading">
      <div><span className="eyebrow">NOVA CRIAÇÃO</span><h1>O que vamos criar?</h1><p>Escolha um tipo para abrir o formulário certo.</p></div>
      <button type="button" className="outline-button" onClick={onCancel}>Voltar à biblioteca</button>
    </header>
    <div className="creation-type-grid">
      {categories.map(category => <button type="button" className="creation-type-card" key={category.id} onClick={() => onChoose(category.id)}>
        <span className="creation-type-icon" aria-hidden="true">{category.icon}</span>
        <span className="creation-type-copy"><strong>{category.label}</strong><small>{descriptions[category.id]}</small></span>
        <span className="creation-type-arrow" aria-hidden="true">→</span>
      </button>)}
    </div>
  </main>;
}
