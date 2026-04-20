/**
 * P12.1 — Browser-side image preprocessing for OCR stability.
 * Uses Canvas API to enhance contrast and resize images.
 */

export async function preprocessImage(imgSource: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Max dimension check for Gemini Vision efficiency
      const MAX_DIM = 1600;
      if (width > height) {
        if (width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Could not get context");

      // Draw original
      ctx.drawImage(img, 0, 0, width, height);

      // Simple contrast enhancement
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const contrast = 1.2; // Increase contrast by 20%
      const intercept = 128 * (1 - contrast);

      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * contrast + intercept;     // R
        data[i + 1] = data[i + 1] * contrast + intercept; // G
        data[i + 2] = data[i + 2] * contrast + intercept; // B
      }
      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = imgSource;
  });
}
