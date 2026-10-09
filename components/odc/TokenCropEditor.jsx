"use client";

import { useEffect, useRef, useState } from "react";

const centered = { zoom: 1, x: 0, y: 0 };

export default function TokenCropEditor({ source, color, initialCrop, onClose, onApply }) {
  const [crop, setCrop] = useState({ ...centered, ...(initialCrop || {}) });
  const [working, setWorking] = useState(false);
  const [stageSize, setStageSize] = useState(360);
  const stageRef = useRef(null);
  const dialogRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => setStageSize(stage.getBoundingClientRect().width));
    observer.observe(stage);
    setStageSize(stage.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const startDrag = event => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, cropX: crop.x || 0, cropY: crop.y || 0 };
  };

  const moveImage = event => {
    if (!dragRef.current || !stageRef.current) return;
    const scale = 512 / stageRef.current.getBoundingClientRect().width;
    setCrop(current => ({ ...current, x: dragRef.current.cropX + (event.clientX - dragRef.current.x) * scale, y: dragRef.current.cropY + (event.clientY - dragRef.current.y) * scale }));
  };

  const apply = async () => {
    setWorking(true);
    try { await onApply(crop); } finally { setWorking(false); }
  };

  return <div className="token-crop-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => { if (event.key === "Escape") onClose(); }}>
    <section ref={dialogRef} className="token-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="token-crop-title" tabIndex={-1}>
      <header className="token-crop-header"><div><h2 id="token-crop-title">Ajustar token principal</h2><p>Arraste a imagem para mudar o recorte.</p></div><button type="button" className="crop-close" onClick={onClose} aria-label="Fechar">×</button></header>
      <div ref={stageRef} className="token-crop-stage" style={{ "--token-frame": color }} onPointerDown={startDrag} onPointerMove={moveImage} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }}>
        <img src={source} alt="Recorte da imagem do token" draggable="false" style={{ transform: `translate(calc(-50% + ${(crop.x || 0) * stageSize / 512}px), calc(-50% + ${(crop.y || 0) * stageSize / 512}px)) scale(${crop.zoom || 1})` }} />
      </div>
      <div className="token-crop-controls"><label htmlFor="token-zoom">Zoom <span>{Number(crop.zoom || 1).toFixed(1)}×</span></label><input id="token-zoom" type="range" min="1" max="3" step="0.05" value={crop.zoom || 1} onChange={event => setCrop(current => ({ ...current, zoom: Number(event.target.value) }))} /><button type="button" className="text-action" onClick={() => setCrop(centered)}>Centralizar</button></div>
      <footer className="token-crop-footer"><button type="button" className="outline-button" onClick={onClose}>Cancelar</button><button type="button" className="save-button" onClick={apply} disabled={working}>{working ? "Aplicando…" : "Aplicar recorte"}</button></footer>
    </section>
  </div>;
}
