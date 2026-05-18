const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
  if (file.size < 300 * 1024) return file;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
    bitmap.close();
    return file;
  }

  if (width > height) {
    height = Math.round((height / width) * MAX_WIDTH);
    width = MAX_WIDTH;
  } else {
    width = Math.round((width / height) * MAX_HEIGHT);
    height = MAX_HEIGHT;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("canvas toBlob failed"));
    }, "image/jpeg", QUALITY);
  });

  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}
