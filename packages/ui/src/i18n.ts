export type Locale = "en" | "zh-CN";

export type MessageKey =
  | "studioCoordinator.title"
  | "studioCoordinator.nextUsefulActions"
  | "writersRoom.title"
  | "proposal.accept"
  | "proposal.reject"
  | "snapshot.save";

export const defaultLocale: Locale = "en";

const messages: Record<Locale, Record<MessageKey, string>> = {
  en: {
    "studioCoordinator.title": "Studio Coordinator",
    "studioCoordinator.nextUsefulActions": "Next useful actions",
    "writersRoom.title": "Writers' Room",
    "proposal.accept": "Accept",
    "proposal.reject": "Reject",
    "snapshot.save": "Save Snapshot",
  },
  "zh-CN": {
    "studioCoordinator.title": "创作室协调员",
    "studioCoordinator.nextUsefulActions": "下一步可执行事项",
    "writersRoom.title": "创作会议室",
    "proposal.accept": "接受",
    "proposal.reject": "拒绝",
    "snapshot.save": "保存快照",
  },
};

export function t(key: MessageKey, locale: Locale = defaultLocale): string {
  return messages[locale][key] ?? messages[defaultLocale][key];
}
