/**
 * Read a File into a base64 string, stripping the "data:...;base64," prefix
 * so the raw base64 can be sent to APIs that expect it (e.g. the Anthropic
 * messages API for document/image sources).
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
