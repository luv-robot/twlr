export interface ChapterListItem {
  id: string;
  title: string;
  meta: string;
  state: "saved" | "active" | "review";
}

export interface DemoChapter extends ChapterListItem {
  body: string;
  content: string;
  filePath: string | null;
}

export interface CoordinatorStatusItem {
  count: string;
  label: string;
  tone: "proposal" | "warning" | "risk";
}

export const demoChapters: DemoChapter[] = [
  {
    id: "01",
    title: "Rain at the South Gate",
    meta: "2.1k",
    state: "saved",
    content: "",
    filePath: null,
    body: [
      "The rain at the south gate came down so hard that the old city seemed to lose its edges.",
      "Mira kept her hood low and counted the watchmen by their lanterns. Three at the gatehouse, one under the broken awning, and no one near the archive road.",
    ].join("\n\n"),
  },
  {
    id: "02",
    title: "The False Receipt",
    meta: "1.8k",
    state: "saved",
    content: "",
    filePath: null,
    body: [
      "The receipt should have carried the seal of the North Office.",
      "Instead it bore a red mark from a shop that had burned down nine years earlier.",
    ].join("\n\n"),
  },
  {
    id: "03",
    title: "A Name Removed",
    meta: "2.4k",
    state: "active",
    content: "",
    filePath: null,
    body: [
      "Mira noticed the receipt before anyone else did. The paper was old, but the ink had the faint wet shine of something written in a hurry.",
      "Outside the archive window, the south gate bells started again. Three slow notes, then silence. It was the kind of silence that made every drawer in the room feel watched.",
      "Shen Yao stood near the door with his hands folded behind his back. He did not ask what she had found. That was the first thing that made her afraid.",
      "The name had not been erased. It had been replaced. Whoever changed the record wanted the lie to look older than the truth.",
    ].join("\n\n"),
  },
  {
    id: "04",
    title: "The Lantern Room",
    meta: "Draft",
    state: "review",
    content: "",
    filePath: null,
    body: [
      "The lantern room had no windows, only mirrors.",
      "Each flame showed a different version of the same corridor, and one of them showed Mira arriving too late.",
    ].join("\n\n"),
  },
];

export const demoCoordinatorItems: CoordinatorStatusItem[] = [
  { count: "3", label: "pending updates", tone: "proposal" },
  { count: "2", label: "unresolved threads", tone: "warning" },
  { count: "1", label: "possible timeline issue", tone: "risk" },
];
