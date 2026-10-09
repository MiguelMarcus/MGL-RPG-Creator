export function renderTokenPNG(source, color, crop = {}) {
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
      const scale = Math.max((radius * 2) / image.width, (radius * 2) / image.height) * Math.max(1, Number(crop.zoom) || 1);
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (size - width) / 2 + (Number(crop.x) || 0);
      const y = (size - height) / 2 + (Number(crop.y) || 0);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, x, y, width, height);
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
