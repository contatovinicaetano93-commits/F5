export const MAX_XML_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_CSV_UPLOAD_BYTES = 2 * 1024 * 1024;

export function assertUploadSize(
  file: File,
  maxBytes: number,
  label: string,
): string | null {
  if (file.size > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
    return `${label} excede o limite de ${maxMb} MB`;
  }
  return null;
}
