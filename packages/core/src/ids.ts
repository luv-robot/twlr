export function slugifyIdPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

export function makeProjectId(title: string): string {
  const slug = slugifyIdPart(title) || "untitled";
  return `project_${slug}`;
}

export function padNumber(value: number, length = 3): string {
  return String(value).padStart(length, "0");
}
