export type Locale = "en" | "zh-CN";

export type MessageKey =
  | "chapter.create"
  | "chapter.creating"
  | "chapter.listTitle"
  | "part.actOne"
  | "project.create"
  | "project.creating"
  | "project.localWorkspace"
  | "project.open"
  | "project.opening"
  | "proposal.cancel"
  | "proposal.edit"
  | "proposal.evidence"
  | "proposal.rejecting"
  | "proposal.save"
  | "proposal.accepting"
  | "snapshot.saving"
  | "studioCoordinator.checkAffectedChapters"
  | "studioCoordinator.checkingAffectedChapters"
  | "studioCoordinator.projectStatus"
  | "studioCoordinator.title"
  | "studioCoordinator.nextUsefulActions"
  | "studioCoordinator.pendingUpdates"
  | "studioCoordinator.durableEvents"
  | "studioCoordinator.revisionCheck"
  | "studioCoordinator.contextProjection"
  | "studioCoordinator.projectedState"
  | "studioCoordinator.openWritersRoom"
  | "studioCoordinator.openingWritersRoom"
  | "skill.characterSheet"
  | "skill.foreshadowTracker"
  | "skill.outlineBuilder"
  | "skill.timelineCompiler"
  | "skill.runningCharacterSheet"
  | "skill.runningForeshadowTracker"
  | "skill.runningOutlineBuilder"
  | "skill.runningTimelineCompiler"
  | "writersRoom.keepAsRecord"
  | "writersRoom.backToManuscript"
  | "writersRoom.linkedChapter"
  | "writersRoom.meetingCompleted"
  | "writersRoom.meetingInProgress"
  | "writersRoom.meetingRecord"
  | "writersRoom.notesSaved"
  | "writersRoom.participants"
  | "writersRoom.saveSelectedNotes"
  | "writersRoom.savingSelectedNotes"
  | "writersRoom.title"
  | "proposal.accept"
  | "proposal.reject"
  | "snapshot.save";

export const defaultLocale: Locale = "en";

const messages: Record<Locale, Record<MessageKey, string>> = {
  en: {
    "chapter.create": "Create chapter",
    "chapter.creating": "...",
    "chapter.listTitle": "Chapters",
    "part.actOne": "Act I",
    "project.create": "Create",
    "project.creating": "Creating...",
    "project.localWorkspace": "Local workspace",
    "project.open": "Open",
    "project.opening": "Opening...",
    "proposal.accepting": "Accepting...",
    "studioCoordinator.title": "Studio Coordinator",
    "studioCoordinator.nextUsefulActions": "Next useful actions",
    "studioCoordinator.checkAffectedChapters": "Check affected chapters",
    "studioCoordinator.checkingAffectedChapters": "Checking affected chapters...",
    "studioCoordinator.projectStatus": "Project status",
    "studioCoordinator.pendingUpdates": "Pending updates",
    "studioCoordinator.durableEvents": "Durable events",
    "studioCoordinator.revisionCheck": "Revision check",
    "studioCoordinator.contextProjection": "Context projection",
    "studioCoordinator.projectedState": "Projected state",
    "studioCoordinator.openWritersRoom": "Open Writers' Room",
    "studioCoordinator.openingWritersRoom": "Opening Writers' Room...",
    "skill.characterSheet": "Character Sheet",
    "skill.foreshadowTracker": "Foreshadow Tracker",
    "skill.outlineBuilder": "Outline Builder",
    "skill.timelineCompiler": "Timeline Compiler",
    "skill.runningCharacterSheet": "Running Character Sheet...",
    "skill.runningForeshadowTracker": "Running Foreshadow Tracker...",
    "skill.runningOutlineBuilder": "Running Outline Builder...",
    "skill.runningTimelineCompiler": "Running Timeline Compiler...",
    "writersRoom.keepAsRecord": "Keep as meeting record",
    "writersRoom.backToManuscript": "Back to manuscript",
    "writersRoom.linkedChapter": "linked chapter",
    "writersRoom.meetingCompleted": "Meeting completed",
    "writersRoom.meetingInProgress": "Meeting in progress",
    "writersRoom.meetingRecord": "Assistant meeting record",
    "writersRoom.notesSaved": "Notes saved to project memory",
    "writersRoom.participants": "participants",
    "writersRoom.saveSelectedNotes": "Save selected notes",
    "writersRoom.savingSelectedNotes": "Saving selected notes...",
    "writersRoom.title": "Writers' Room",
    "proposal.accept": "Accept",
    "proposal.cancel": "Cancel",
    "proposal.edit": "Edit",
    "proposal.evidence": "Evidence",
    "proposal.reject": "Reject",
    "proposal.rejecting": "Rejecting...",
    "proposal.save": "Save",
    "snapshot.save": "Save Snapshot",
    "snapshot.saving": "Saving...",
  },
  "zh-CN": {
    "chapter.create": "创建章节",
    "chapter.creating": "...",
    "chapter.listTitle": "章节",
    "part.actOne": "第一幕",
    "project.create": "创建",
    "project.creating": "创建中...",
    "project.localWorkspace": "本地工作区",
    "project.open": "打开",
    "project.opening": "打开中...",
    "proposal.accepting": "接受中...",
    "studioCoordinator.title": "创作室协调员",
    "studioCoordinator.nextUsefulActions": "下一步可执行事项",
    "studioCoordinator.checkAffectedChapters": "检查受影响章节",
    "studioCoordinator.checkingAffectedChapters": "正在检查受影响章节...",
    "studioCoordinator.projectStatus": "项目状态",
    "studioCoordinator.pendingUpdates": "待处理更新",
    "studioCoordinator.durableEvents": "持久事件",
    "studioCoordinator.revisionCheck": "修订检查",
    "studioCoordinator.contextProjection": "上下文投影",
    "studioCoordinator.projectedState": "投影状态",
    "studioCoordinator.openWritersRoom": "打开创作会议室",
    "studioCoordinator.openingWritersRoom": "正在打开创作会议室...",
    "skill.characterSheet": "角色卡",
    "skill.foreshadowTracker": "伏笔追踪",
    "skill.outlineBuilder": "大纲构建",
    "skill.timelineCompiler": "时间线编译",
    "skill.runningCharacterSheet": "正在生成角色卡...",
    "skill.runningForeshadowTracker": "正在追踪伏笔...",
    "skill.runningOutlineBuilder": "正在构建大纲...",
    "skill.runningTimelineCompiler": "正在编译时间线...",
    "writersRoom.keepAsRecord": "保留为会议纪要",
    "writersRoom.backToManuscript": "返回正文",
    "writersRoom.linkedChapter": "关联章节",
    "writersRoom.meetingCompleted": "会议已完成",
    "writersRoom.meetingInProgress": "会议进行中",
    "writersRoom.meetingRecord": "助理会议纪要",
    "writersRoom.notesSaved": "纪要已保存到项目记忆",
    "writersRoom.participants": "位参会者",
    "writersRoom.saveSelectedNotes": "保存选中纪要",
    "writersRoom.savingSelectedNotes": "正在保存纪要...",
    "writersRoom.title": "创作会议室",
    "proposal.accept": "接受",
    "proposal.cancel": "取消",
    "proposal.edit": "编辑",
    "proposal.evidence": "依据",
    "proposal.reject": "拒绝",
    "proposal.rejecting": "拒绝中...",
    "proposal.save": "保存",
    "snapshot.save": "保存快照",
    "snapshot.saving": "保存中...",
  },
};

export function t(key: MessageKey, locale: Locale = defaultLocale): string {
  return messages[locale][key] ?? messages[defaultLocale][key];
}
