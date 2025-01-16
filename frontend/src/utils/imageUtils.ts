import { saveAs } from 'file-saver';

export const convertWebpToPngAndDownload = async (webpUrl: string, filename: string) => {
  try {
    // Create a new image element
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS

    // Create a promise to handle image loading
    const imageLoadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
    });

    // Set image source and wait for it to load
    img.src = webpUrl;
    await imageLoadPromise;

    // Create canvas and draw image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Draw image to canvas
    ctx.drawImage(img, 0, 0);

    // Convert to PNG and download
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}.png`);
      }
    }, 'image/png');

  } catch (error) {
    console.error('Error converting image:', error);
    throw error;
  }
};

export const isWebPSupported = () => {
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    // was able or not to get WebP representation
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};
