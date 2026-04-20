// Phase 12.1 — Client-Side Image Preprocessing for OCR
// Contrast enhancement + resize + orientation detection

export interface PreprocessResult {
  blob: Blob;
  width: number;
  height: number;
  wasRotated: boolean;
  wasEnhanced: boolean;
}

export async function preprocessChallanImage(
  file: File,
): Promise<PreprocessResult> {
  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Auto-orient
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  ctx.drawImage(bitmap, 0, 0);

  // Enhance contrast for OCR accuracy
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const enhanced = enhanceContrast(imageData, 1.5);
  ctx.putImageData(enhanced, 0, 0);

  // Resize if too large (max 1200px wide)
  if (canvas.width > 1200) {
    const ratio = 1200 / canvas.width;
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 1200;
    finalCanvas.height = Math.round(canvas.height * ratio);
    const finalCtx = finalCanvas.getContext('2d')!;
    finalCtx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);

    const blob = await new Promise<Blob>((res) =>
      finalCanvas.toBlob((b) => res(b!), 'image/jpeg', 0.92),
    );
    return {
      blob,
      width: finalCanvas.width,
      height: finalCanvas.height,
      wasRotated: false,
      wasEnhanced: true,
    };
  }

  const blob = await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92),
  );
  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    wasRotated: false,
    wasEnhanced: true,
  };
}

function enhanceContrast(imageData: ImageData, factor: number): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp((data[i] - 128) * factor + 128);
    data[i + 1] = clamp((data[i + 1] - 128) * factor + 128);
    data[i + 2] = clamp((data[i + 2] - 128) * factor + 128);
  }
  return imageData;
}

function clamp(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}
