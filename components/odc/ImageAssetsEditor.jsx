"use client";

import { useState } from "react";
import Field from "./Field";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) return reject(new Error("Use uma imagem PNG, JPEG ou WEBP."));
    if (file.size > MAX_IMAGE_SIZE) return reject(new Error("A imagem deve ter até 5 MB."));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function makeToken(source, color) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Seu navegador não conseguiu criar o token."));
      const inset = 23;
      const radius = (size - inset * 2) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
      ctx.clip();
      const scale = Math.max((radius * 2) / image.width, (radius * 2) / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = /^#[\da-f]{6}$/i.test(color || "") ? color : "#133DD8";
      ctx.lineWidth = inset;
      ctx.stroke();
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Não foi possível abrir a imagem escolhida."));
    image.src = source;
  });
}

function saveImage(data, fileName) {
  const link = document.createElement("a");
  link.href = data;
  link.download = fileName;
  link.click();
}

function slug(value) {
  return String(value || "token").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "token";
}

export default function ImageAssetsEditor({ entry, onChange, isMonster = false }) {
  const [error, setError] = useState("");
  const update = (key, value) => onChange({ ...entry, [key]: value });
  const variants = entry.imageVariants || [];
  const tokenVariants = entry.tokenVariants || [];
  const sources = [{ id: "main", label: entry.name || "Imagem principal", image: entry.image }, ...variants.map((variant, index) => ({ id: variant.id, label: variant.name || `Variante ${index + 1}`, image: variant.image }))];

  const uploadPrimary = async file => {
    try { setError(""); onChange({ ...entry, image: await readImage(file), tokenImage: "", tokenVariants: tokenVariants.map(variant => variant.source === "main" ? { ...variant, image: "" } : variant) }); }
    catch (error) { setError(error.message); }
  };

  const uploadVariant = async (id, file) => {
    try {
      setError("");
      const image = await readImage(file);
      onChange({ ...entry, imageVariants: variants.map(item => item.id === id ? { ...item, image } : item), tokenVariants: tokenVariants.map(item => item.source === id ? { ...item, image: "" } : item) });
    } catch (error) { setError(error.message); }
  };

  const addImageVariant = () => update("imageVariants", [...variants, { id: makeId(), name: `Variante ${variants.length + 1}`, image: "" }]);
  const updateImageVariant = (id, key, value) => update("imageVariants", variants.map(item => item.id === id ? { ...item, [key]: value } : item));
  const removeImageVariant = id => {
    onChange({ ...entry, imageVariants: variants.filter(item => item.id !== id), tokenVariants: tokenVariants.filter(item => item.source !== id) });
  };

  const addTokenVariant = () => update("tokenVariants", [...tokenVariants, { id: makeId(), name: `Token ${tokenVariants.length + 1}`, source: "main", frameColor: entry.tokenFrameColor || "#133DD8", image: "" }]);
  const updateTokenVariant = (id, key, value) => update("tokenVariants", tokenVariants.map(item => item.id === id ? { ...item, [key]: value, ...(["source", "frameColor"].includes(key) ? { image: "" } : {}) } : item));
  const removeTokenVariant = id => update("tokenVariants", tokenVariants.filter(item => item.id !== id));

  const generateTokens = async () => {
    try {
      setError("");
      const mainToken = entry.image ? await makeToken(entry.image, entry.tokenFrameColor) : "";
      const generatedVariants = await Promise.all(tokenVariants.map(async variant => {
        const source = sources.find(item => item.id === variant.source)?.image;
        return { ...variant, image: source ? await makeToken(source, variant.frameColor || entry.tokenFrameColor) : "" };
      }));
      onChange({ ...entry, tokenImage: mainToken, tokenVariants: generatedVariants });
    } catch (error) { setError(error.message); }
  };

  const generateVariant = async variant => {
    const source = sources.find(item => item.id === variant.source)?.image;
    if (!source) { setError("Adicione uma imagem de origem antes de gerar este token."); return; }
    try { setError(""); updateTokenVariant(variant.id, "image", await makeToken(source, variant.frameColor || entry.tokenFrameColor)); }
    catch (error) { setError(error.message); }
  };
  const canGenerate = Boolean(entry.image || tokenVariants.some(variant => sources.find(source => source.id === variant.source)?.image));

  return <div className="image-assets-editor">
    {error && <p className="asset-error" role="alert">{error}</p>}
    <Field label="Imagem principal" help="PNG, JPEG ou WEBP · até 5 MB" className="span-three image-field">
      <div className="image-upload">
        {entry.image ? <img src={entry.image} alt="Prévia da imagem principal" /> : <span className="image-placeholder">＋</span>}
        <div><strong>{entry.image ? "Imagem principal" : "Nenhuma imagem selecionada"}</strong><small>Essa imagem aparece na ficha.</small><label className="upload-button">{entry.image ? "Trocar imagem" : "Escolher imagem"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) uploadPrimary(file); event.target.value = ""; }} /></label></div>
        {entry.image && <button type="button" className="text-action" onClick={() => onChange({ ...entry, image: "", tokenImage: "", tokenVariants: tokenVariants.map(variant => variant.source === "main" ? { ...variant, image: "" } : variant) })}>Remover</button>}
      </div>
    </Field>

    <div className="asset-list">
      <div className="asset-list-heading"><div><strong>Variantes de imagem</strong><small>Outras aparências para esta criação.</small></div><button type="button" className="outline-button" onClick={addImageVariant}>＋ Adicionar imagem</button></div>
      {variants.map((variant, index) => <div className="asset-row" key={variant.id}>
        <div className="asset-thumb">{variant.image ? <img src={variant.image} alt={`Prévia da ${variant.name || `variante ${index + 1}`}`} /> : <span>＋</span>}</div>
        <div className="asset-row-fields"><Field label="Nome da variante"><input value={variant.name || ""} onChange={event => updateImageVariant(variant.id, "name", event.target.value)} placeholder={`Variante ${index + 1}`} /></Field><label className="upload-button">{variant.image ? "Trocar imagem" : "Escolher imagem"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) uploadVariant(variant.id, file); event.target.value = ""; }} /></label></div>
        <button type="button" className="asset-remove" aria-label={`Remover ${variant.name || "variante"}`} onClick={() => removeImageVariant(variant.id)}>Remover</button>
      </div>)}
      {variants.length === 0 && <p className="asset-empty">Sem variantes de imagem.</p>}
    </div>

    {isMonster && <div className="token-assets">
      <div className="token-heading"><div><strong>Token</strong><small>Gere um token circular em PNG para usar no Foundry.</small></div><label className="toggle-field"><input type="checkbox" checked={Boolean(entry.createToken)} onChange={event => update("createToken", event.target.checked)} /><span>Criar token</span></label></div>
      {entry.createToken && <>
        <div className="token-settings"><label className="color-field"><span>Cor da moldura</span><input type="color" value={entry.tokenFrameColor || "#133DD8"} onChange={event => onChange({ ...entry, tokenFrameColor: event.target.value, tokenImage: "", tokenVariants: tokenVariants.map(variant => ({ ...variant, image: "" })) })} /></label><button type="button" className="save-button" disabled={!canGenerate} onClick={generateTokens}>Gerar tokens</button></div>
        <div className="token-variant-heading"><div><strong>Variantes de token</strong><small>Escolha uma imagem e uma cor para cada token.</small></div><button type="button" className="outline-button" onClick={addTokenVariant}>＋ Adicionar variante</button></div>
        {tokenVariants.map((variant, index) => <div className="token-variant-row" key={variant.id}>
          <div className="token-thumb">{variant.image ? <img src={variant.image} alt={`Token ${variant.name || index + 1}`} /> : <span>◯</span>}</div>
          <div className="token-variant-fields"><Field label="Nome"><input value={variant.name || ""} onChange={event => updateTokenVariant(variant.id, "name", event.target.value)} placeholder={`Token ${index + 1}`} /></Field><Field label="Imagem de origem"><select value={variant.source || "main"} onChange={event => updateTokenVariant(variant.id, "source", event.target.value)}>{sources.map(source => <option key={source.id} value={source.id}>{source.label}</option>)}</select></Field><label className="color-field"><span>Moldura</span><input type="color" value={variant.frameColor || entry.tokenFrameColor || "#133DD8"} onChange={event => updateTokenVariant(variant.id, "frameColor", event.target.value)} /></label></div>
          <div className="token-variant-actions"><button type="button" className="outline-button" onClick={() => generateVariant(variant)}>Gerar</button>{variant.image && <button type="button" className="text-action" onClick={() => saveImage(variant.image, `${slug(variant.name)}.png`)}>Baixar PNG</button>}<button type="button" className="asset-remove" onClick={() => removeTokenVariant(variant.id)}>Remover</button></div>
        </div>)}
        {entry.tokenImage && <div className="main-token-result"><img src={entry.tokenImage} alt="Token principal gerado" /><span>Token principal</span><button type="button" className="text-action" onClick={() => saveImage(entry.tokenImage, `${slug(entry.name)}-token.png`)}>Baixar PNG</button></div>}
      </>}
    </div>}
  </div>;
}
