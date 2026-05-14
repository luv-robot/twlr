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

export function canonicalCharacterId(id: string): string {
  const withoutPrefix = id
    .trim()
    .replace(/^character_/i, "")
    .replace(/^char_/i, "");
  const slug = slugifyIdPart(withoutPrefix.replace(/([a-z])([A-Z])/g, "$1_$2"));
  const firstToken = slug.split("_").filter(Boolean)[0];

  return firstToken ? `char_${firstToken}` : "char_unknown";
}

export function padNumber(value: number, length = 3): string {
  return String(value).padStart(length, "0");
}
