/**
 * Turns the recap SVG into a PNG entirely in the browser.
 *
 * The card is pure SVG (no foreignObject, no web fonts), so it can be
 * serialised, loaded as an image, and drawn onto a canvas — which is what makes
 * this possible without pulling in html-to-image or a headless renderer.
 */

const SCALE = 2;

async function svgToBlob(svg: SVGSVGElement, width: number, height: number): Promise<Blob> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  const source = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not rasterise the card'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * SCALE;
    canvas.height = height * SCALE;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable in this browser');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image'))),
        'image/png',
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadCard(svg: SVGSVGElement, filename: string, width: number, height: number) {
  const blob = await svgToBlob(svg, width, height);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/** True when this browser can hand the PNG to the OS share sheet. */
export function canShareImage() {
  return typeof navigator !== 'undefined' && 'canShare' in navigator && 'share' in navigator;
}

/** Returns false when sharing is unsupported or the user dismissed the sheet. */
export async function shareCard(
  svg: SVGSVGElement,
  filename: string,
  width: number,
  height: number,
  text: string,
) {
  const blob = await svgToBlob(svg, width, height);
  const file = new File([blob], filename, { type: 'image/png' });

  if (!navigator.canShare?.({ files: [file] })) return false;

  try {
    await navigator.share({ files: [file], text });
    return true;
  } catch (error) {
    // AbortError just means the share sheet was dismissed.
    if (error instanceof Error && error.name === 'AbortError') return false;
    throw error;
  }
}
