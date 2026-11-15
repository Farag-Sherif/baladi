/**
 * Baladi 3D Product Preloader & Global Asset State Manager
 * Coordinates preloading of 3D pouch packaging textures and GLTF models.
 */

export const POUCH_3D_TEXTURES = [
  '/brand/3d/cat-ar-front.png',
  '/brand/3d/cat-ar-back.png',
  '/brand/3d/cat-en-front.png',
  '/brand/3d/cat-en-back.png',
  '/brand/3d/dog-ar-front.png',
  '/brand/3d/dog-ar-back.png',
  '/brand/3d/dog-en-front.png',
  '/brand/3d/dog-en-back.png',
] as const;

export const POUCH_3D_MODELS = [
  '/brand/baladi_pouch_cat.glb',
  '/brand/baladi_pouch_dog.glb',
] as const;

export const HERO_BRAND_IMAGES = [
  '/brand/pouch-duo.png',
  '/brand/pouch-cats.png',
  '/brand/pouch-dogs.png',
] as const;

let is3DGloballyLoaded = false;

export function getIs3DPreloaded(): boolean {
  return is3DGloballyLoaded;
}

export function setIs3DPreloaded(value: boolean): void {
  is3DGloballyLoaded = value;
}

/**
 * Prefetches 3D product textures and brand pack images into the browser cache
 */
export function prefetch3DAssets(): void {
  if (typeof window === 'undefined') return;

  POUCH_3D_TEXTURES.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  HERO_BRAND_IMAGES.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}
