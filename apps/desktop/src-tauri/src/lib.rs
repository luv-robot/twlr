use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Component, Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Deserialize)]
struct CreateProjectRequest {
    project_path: String,
    title: String,
    kind: String,
    language: Option<String>,
    created_at: Option<String>,
}

#[derive(Debug, Deserialize)]
struct WriteChapterRequest {
    project_path: String,
    file_path: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct CreateChapterRequest {
    project_path: String,
    title: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AppendProjectRecordsRequest {
    project_path: String,
    records: Vec<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct SaveSnapshotRequest {
    project_path: String,
    message: Option<String>,
}

#[derive(Debug, Deserialize)]
struct WriteProjectJsonRequest {
    project_path: String,
    value: serde_json::Value,
}

#[derive(Debug, Serialize)]
struct ProjectSummary {
    project_path: String,
    project_id: String,
    title: String,
    kind: String,
    chapter_count: usize,
    git_initialized: bool,
}

#[derive(Debug, Serialize)]
struct ChapterSummary {
    chapter_id: String,
    title: String,
    order: u32,
    status: String,
    word_count: usize,
    file_path: String,
    updated_at: Option<String>,
}

#[derive(Debug, Serialize)]
struct ChapterContent {
    summary: ChapterSummary,
    content: String,
}

#[derive(Debug, Serialize)]
struct SnapshotSummary {
    snapshot_id: String,
    message: String,
    changed_files: usize,
}

#[derive(Debug, Serialize)]
struct SnapshotStatus {
    changed_files: usize,
    changed_chapters: usize,
    changed_state_files: usize,
    has_snapshot: bool,
}

#[tauri::command]
fn create_project(request: CreateProjectRequest) -> Result<ProjectSummary, String> {
    let project_path = PathBuf::from(&request.project_path);
    fs::create_dir_all(&project_path).map_err(|error| format!("Failed to create project directory: {error}"))?;
    let title = request.title.clone();
    let kind = request.kind.clone();
    let language = request.language.clone().unwrap_or_else(|| "en".to_string());

    for directory in [
        "manuscript",
        "state",
        "events",
        "proposals",
        "meetings",
        "notes",
        "assets",
        "cache",
    ] {
        fs::create_dir_all(project_path.join(directory))
            .map_err(|error| format!("Failed to create {directory}: {error}"))?;
    }

    let now = request.created_at.clone().unwrap_or_else(current_timestamp);
    let project_id = make_project_id(&request.title);
    write_if_missing(
        &project_path.join("twlr.project.json"),
        &serde_json::to_string_pretty(&json!({
            "schema_version": 1,
            "project_id": project_id,
            "title": title.clone(),
            "kind": kind.clone(),
            "language": language.clone(),
            "created_at": now.clone(),
            "updated_at": now.clone(),
            "settings": {
                "default_chapter_directory": "manuscript",
                "snapshot_mode": "manual",
                "developer_mode": false
            }
        }))
        .map_err(|error| format!("Failed to serialize project manifest: {error}"))?,
    )?;

    write_if_missing(&project_path.join(".gitignore"), "cache/\n*.sqlite\n.DS_Store\n")?;
    write_if_missing(
        &project_path.join("manuscript/chapter-001.md"),
        &format!(
            "---\nid: chapter_001\ntitle: Untitled Chapter\norder: 1\nstatus: draft\nword_count: 0\ncreated_at: {now}\nupdated_at: {now}\n---\n\n# Untitled Chapter\n\n"
        ),
    )?;
    write_json_if_missing(
        &project_path.join("state/work.json"),
        json!({
            "schema_version": 1,
            "work_id": "work_main",
            "title": title,
            "genre": [],
            "format": kind,
            "current_phase": "draft",
            "main_plot_status": "not_started",
            "active_chapter_id": "chapter_001",
            "last_main_plot_update_at": null,
            "tags": []
        }),
    )?;
    write_json_if_missing(&project_path.join("state/characters.json"), json!({"schema_version": 1, "characters": []}))?;
    write_json_if_missing(
        &project_path.join("state/relationships.json"),
        json!({"schema_version": 1, "relationships": []}),
    )?;
    write_json_if_missing(
        &project_path.join("state/timeline.json"),
        json!({"schema_version": 1, "timeline_events": []}),
    )?;
    write_json_if_missing(
        &project_path.join("state/open_loops.json"),
        json!({"schema_version": 1, "open_loops": []}),
    )?;
    write_json_if_missing(&project_path.join("state/themes.json"), json!({"schema_version": 1, "themes": []}))?;
    write_json_if_missing(
        &project_path.join("state/world_rules.json"),
        json!({"schema_version": 1, "world_rules": []}),
    )?;
    write_if_missing(&project_path.join("events/narrative_events.jsonl"), "")?;
    write_if_missing(&project_path.join("proposals/state_proposals.jsonl"), "")?;
    write_if_missing(&project_path.join("meetings/room_meetings.jsonl"), "")?;
    write_if_missing(&project_path.join("assets/.gitkeep"), "")?;
    write_if_missing(&project_path.join("cache/.gitkeep"), "")?;

    let git_initialized = init_git(&project_path);
    open_project(request.project_path).map(|mut summary| {
        summary.git_initialized = git_initialized;
        summary
    })
}

#[tauri::command]
fn open_project(project_path: String) -> Result<ProjectSummary, String> {
    let project_path_buf = PathBuf::from(&project_path);
    let manifest_path = project_path_buf.join("twlr.project.json");
    let manifest_text = fs::read_to_string(&manifest_path)
        .map_err(|error| format!("Failed to read twlr.project.json: {error}"))?;
    let manifest: serde_json::Value =
        serde_json::from_str(&manifest_text).map_err(|error| format!("Invalid twlr.project.json: {error}"))?;
    let chapters = list_chapters(project_path.clone())?;

    Ok(ProjectSummary {
        project_path,
        project_id: manifest["project_id"].as_str().unwrap_or("unknown").to_string(),
        title: manifest["title"].as_str().unwrap_or("Untitled").to_string(),
        kind: manifest["kind"].as_str().unwrap_or("other").to_string(),
        chapter_count: chapters.len(),
        git_initialized: project_path_buf.join(".git").exists(),
    })
}

#[tauri::command]
fn list_chapters(project_path: String) -> Result<Vec<ChapterSummary>, String> {
    let manuscript_dir = PathBuf::from(project_path).join("manuscript");
    let mut chapters = Vec::new();

    if !manuscript_dir.exists() {
        return Ok(chapters);
    }

    for entry in fs::read_dir(&manuscript_dir).map_err(|error| format!("Failed to read manuscript directory: {error}"))? {
        let entry = entry.map_err(|error| format!("Failed to read chapter entry: {error}"))?;
        let path = entry.path();
        if path.extension().and_then(|extension| extension.to_str()) != Some("md") {
            continue;
        }

        let content = fs::read_to_string(&path).map_err(|error| format!("Failed to read chapter file: {error}"))?;
        chapters.push(parse_chapter_summary(&content, &path)?);
    }

    chapters.sort_by_key(|chapter| chapter.order);
    Ok(chapters)
}

#[tauri::command]
fn read_chapter(project_path: String, file_path: String) -> Result<ChapterContent, String> {
    let full_path = resolve_project_relative_path(&project_path, &file_path)?;
    let content = fs::read_to_string(&full_path).map_err(|error| format!("Failed to read chapter: {error}"))?;
    let summary = parse_chapter_summary(&content, &full_path)?;
    Ok(ChapterContent { summary, content })
}

#[tauri::command]
fn write_chapter(request: WriteChapterRequest) -> Result<ChapterSummary, String> {
    let full_path = resolve_project_relative_path(&request.project_path, &request.file_path)?;
    fs::write(&full_path, request.content).map_err(|error| format!("Failed to write chapter: {error}"))?;
    let content = fs::read_to_string(&full_path).map_err(|error| format!("Failed to reread chapter: {error}"))?;
    parse_chapter_summary(&content, &full_path)
}

#[tauri::command]
fn create_chapter(request: CreateChapterRequest) -> Result<ChapterContent, String> {
    let chapters = list_chapters(request.project_path.clone())?;
    let order = chapters.iter().map(|chapter| chapter.order).max().unwrap_or(0) + 1;
    let title = request
        .title
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| "Untitled Chapter".to_string());
    let now = current_timestamp();
    let chapter_id = format!("chapter_{order:03}");
    let file_path = format!("manuscript/chapter-{order:03}.md");
    let content = [
        "---".to_string(),
        format!("id: {chapter_id}"),
        format!("title: {title}"),
        format!("order: {order}"),
        "status: draft".to_string(),
        "word_count: 0".to_string(),
        format!("created_at: {now}"),
        format!("updated_at: {now}"),
        "---".to_string(),
        "".to_string(),
        format!("# {title}"),
        "".to_string(),
    ]
    .join("\n");

    let full_path = resolve_project_relative_path(&request.project_path, &file_path)?;
    write_if_missing(&full_path, &content)?;
    read_chapter(request.project_path, file_path)
}

#[tauri::command]
fn append_narrative_events(request: AppendProjectRecordsRequest) -> Result<usize, String> {
    append_project_jsonl_records(
        &request.project_path,
        "events/narrative_events.jsonl",
        request.records,
    )
}

#[tauri::command]
fn append_state_proposals(request: AppendProjectRecordsRequest) -> Result<usize, String> {
    append_project_jsonl_records(
        &request.project_path,
        "proposals/state_proposals.jsonl",
        request.records,
    )
}

#[tauri::command]
fn append_room_meetings(request: AppendProjectRecordsRequest) -> Result<usize, String> {
    append_project_jsonl_records(
        &request.project_path,
        "meetings/room_meetings.jsonl",
        request.records,
    )
}

#[tauri::command]
fn save_snapshot(request: SaveSnapshotRequest) -> Result<SnapshotSummary, String> {
    let project_path = PathBuf::from(&request.project_path);
    if !project_path.exists() {
        return Err("Project folder does not exist.".to_string());
    }

    init_git(&project_path);
    run_git(&project_path, &["add", "."])?;
    let status = run_git(&project_path, &["status", "--short"])?;
    let changed_files = status.lines().filter(|line| !line.trim().is_empty()).count();

    if changed_files == 0 {
        return Ok(SnapshotSummary {
            snapshot_id: "none".to_string(),
            message: "No changes to snapshot.".to_string(),
            changed_files,
        });
    }

    let message = request
        .message
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| "TWLR save snapshot".to_string());
    run_git(
        &project_path,
        &[
            "-c",
            "user.name=TWLR",
            "-c",
            "user.email=twlr@local",
            "commit",
            "-m",
            &message,
        ],
    )?;
    let snapshot_id = run_git(&project_path, &["rev-parse", "--short", "HEAD"])?
        .trim()
        .to_string();

    Ok(SnapshotSummary {
        snapshot_id,
        message,
        changed_files,
    })
}

#[tauri::command]
fn snapshot_status(project_path: String) -> Result<SnapshotStatus, String> {
    let project_path_buf = PathBuf::from(&project_path);
    if !project_path_buf.exists() {
        return Err("Project folder does not exist.".to_string());
    }

    init_git(&project_path_buf);
    let status = run_git(&project_path_buf, &["status", "--short"])?;
    let changed_paths = parse_git_status_paths(&status);
    let has_snapshot = run_git(&project_path_buf, &["rev-parse", "--verify", "HEAD"]).is_ok();

    Ok(SnapshotStatus {
        changed_files: changed_paths.len(),
        changed_chapters: changed_paths
            .iter()
            .filter(|path| path.starts_with("manuscript/"))
            .count(),
        changed_state_files: changed_paths.iter().filter(|path| path.starts_with("state/")).count(),
        has_snapshot,
    })
}

#[tauri::command]
fn read_character_state(project_path: String) -> Result<serde_json::Value, String> {
    read_project_json_file(&project_path, "state/characters.json")
}

#[tauri::command]
fn write_character_state(request: WriteProjectJsonRequest) -> Result<(), String> {
    write_project_json_file(&request.project_path, "state/characters.json", request.value)
}

#[tauri::command]
fn read_open_loop_state(project_path: String) -> Result<serde_json::Value, String> {
    read_project_json_file(&project_path, "state/open_loops.json")
}

#[tauri::command]
fn write_open_loop_state(request: WriteProjectJsonRequest) -> Result<(), String> {
    write_project_json_file(&request.project_path, "state/open_loops.json", request.value)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_project,
            open_project,
            list_chapters,
            read_chapter,
            write_chapter,
            create_chapter,
            append_narrative_events,
            append_state_proposals,
            append_room_meetings,
            save_snapshot,
            snapshot_status,
            read_character_state,
            write_character_state,
            read_open_loop_state,
            write_open_loop_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running TWLR desktop app");
}

fn write_if_missing(path: &Path, content: &str) -> Result<(), String> {
    if path.exists() {
        return Ok(());
    }

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("Failed to create parent directory: {error}"))?;
    }

    fs::write(path, content).map_err(|error| format!("Failed to write {}: {error}", path.display()))
}

fn write_json_if_missing(path: &Path, value: serde_json::Value) -> Result<(), String> {
    let content =
        serde_json::to_string_pretty(&value).map_err(|error| format!("Failed to serialize JSON file: {error}"))?;
    write_if_missing(path, &format!("{content}\n"))
}

fn init_git(project_path: &Path) -> bool {
    if project_path.join(".git").exists() {
        return true;
    }

    Command::new("git")
        .arg("init")
        .current_dir(project_path)
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

fn run_git(project_path: &Path, args: &[&str]) -> Result<String, String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(project_path)
        .output()
        .map_err(|error| format!("Failed to run git: {error}"))?;

    if output.status.success() {
        return String::from_utf8(output.stdout).map_err(|error| format!("Invalid git output: {error}"));
    }

    let stderr = String::from_utf8_lossy(&output.stderr);
    Err(format!("Git command failed: {stderr}"))
}

fn parse_git_status_paths(status: &str) -> Vec<String> {
    status
        .lines()
        .filter_map(|line| line.get(3..))
        .map(|line| {
            line.split_once(" -> ")
                .map(|(_, right)| right)
                .unwrap_or(line)
                .trim()
                .to_string()
        })
        .filter(|path| !path.is_empty())
        .collect()
}

fn read_project_json_file(project_path: &str, relative_path: &str) -> Result<serde_json::Value, String> {
    let full_path = resolve_project_relative_path(project_path, relative_path)?;
    let content = fs::read_to_string(&full_path)
        .map_err(|error| format!("Failed to read {}: {error}", full_path.display()))?;
    serde_json::from_str(&content).map_err(|error| format!("Invalid JSON in {}: {error}", full_path.display()))
}

fn write_project_json_file(
    project_path: &str,
    relative_path: &str,
    value: serde_json::Value,
) -> Result<(), String> {
    let full_path = resolve_project_relative_path(project_path, relative_path)?;
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("Failed to create state directory: {error}"))?;
    }

    let content =
        serde_json::to_string_pretty(&value).map_err(|error| format!("Failed to serialize state JSON: {error}"))?;
    fs::write(&full_path, format!("{content}\n"))
        .map_err(|error| format!("Failed to write {}: {error}", full_path.display()))
}

fn append_project_jsonl_records(
    project_path: &str,
    relative_path: &str,
    records: Vec<serde_json::Value>,
) -> Result<usize, String> {
    let full_path = resolve_project_relative_path(project_path, relative_path)?;
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("Failed to create log directory: {error}"))?;
    }

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&full_path)
        .map_err(|error| format!("Failed to open {}: {error}", full_path.display()))?;

    let mut count = 0;
    for record in records {
        let line = serde_json::to_string(&record)
            .map_err(|error| format!("Failed to serialize JSONL record: {error}"))?;
        writeln!(file, "{line}").map_err(|error| format!("Failed to append JSONL record: {error}"))?;
        count += 1;
    }

    Ok(count)
}

fn resolve_project_relative_path(project_path: &str, file_path: &str) -> Result<PathBuf, String> {
    let relative = Path::new(file_path);
    if relative.is_absolute() {
        return Err("Project file path must be relative.".to_string());
    }

    for component in relative.components() {
        if matches!(component, Component::ParentDir | Component::RootDir | Component::Prefix(_)) {
            return Err("Project file path cannot escape the project directory.".to_string());
        }
    }

    Ok(PathBuf::from(project_path).join(relative))
}

fn parse_chapter_summary(content: &str, path: &Path) -> Result<ChapterSummary, String> {
    let frontmatter = parse_frontmatter(content);
    let fallback_title = path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .unwrap_or("Untitled Chapter")
        .to_string();
    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "Invalid chapter file name.".to_string())?;

    Ok(ChapterSummary {
        chapter_id: frontmatter
            .get("id")
            .cloned()
            .unwrap_or_else(|| file_name.trim_end_matches(".md").replace('-', "_")),
        title: frontmatter.get("title").cloned().unwrap_or(fallback_title),
        order: frontmatter
            .get("order")
            .and_then(|value| value.parse::<u32>().ok())
            .unwrap_or(999),
        status: frontmatter
            .get("status")
            .cloned()
            .unwrap_or_else(|| "draft".to_string()),
        word_count: count_words(chapter_body(content)),
        file_path: format!("manuscript/{file_name}"),
        updated_at: frontmatter.get("updated_at").cloned(),
    })
}

fn parse_frontmatter(content: &str) -> std::collections::HashMap<String, String> {
    let mut values = std::collections::HashMap::new();
    if !content.starts_with("---\n") {
        return values;
    }

    let Some(end) = content[4..].find("\n---") else {
        return values;
    };
    let frontmatter = &content[4..4 + end];

    for line in frontmatter.lines() {
        let Some((key, value)) = line.split_once(':') else {
            continue;
        };
        values.insert(key.trim().to_string(), value.trim().trim_matches('"').to_string());
    }

    values
}

fn count_words(content: &str) -> usize {
    content.split_whitespace().filter(|word| word.chars().any(char::is_alphanumeric)).count()
}

fn chapter_body(content: &str) -> &str {
    if !content.starts_with("---\n") {
        return content;
    }

    let Some(end) = content[4..].find("\n---") else {
        return content;
    };

    content[4 + end + 4..].trim_start_matches('\n')
}

fn current_timestamp() -> String {
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0);

    format!("unix:{seconds}")
}

fn make_project_id(title: &str) -> String {
    let mut slug = title
        .trim()
        .to_lowercase()
        .chars()
        .map(|character| if character.is_ascii_alphanumeric() { character } else { '_' })
        .collect::<String>();

    while slug.contains("__") {
        slug = slug.replace("__", "_");
    }

    let slug = slug.trim_matches('_');

    format!("project_{}", if slug.is_empty() { "untitled" } else { slug })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_project_and_appends_events() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or(0);
        let project_path = std::env::temp_dir().join(format!("twlr-command-test-{suffix}"));
        let project_path_text = project_path.to_string_lossy().to_string();
        let _ = fs::remove_dir_all(&project_path);

        let summary = create_project(CreateProjectRequest {
            project_path: project_path_text.clone(),
            title: "Smoke Test Novel".to_string(),
            kind: "web_novel".to_string(),
            language: Some("en".to_string()),
            created_at: Some("2026-05-14T00:00:00.000Z".to_string()),
        })
        .expect("project should be created");

        assert_eq!(summary.title, "Smoke Test Novel");
        assert_eq!(summary.chapter_count, 1);
        assert!(project_path.join("twlr.project.json").exists());

        let chapters = list_chapters(project_path_text.clone()).expect("chapters should be listed");
        assert_eq!(chapters.len(), 1);
        assert_eq!(chapters[0].file_path, "manuscript/chapter-001.md");

        let new_chapter = create_chapter(CreateChapterRequest {
            project_path: project_path_text.clone(),
            title: Some("Second Chapter".to_string()),
        })
        .expect("chapter should be created");

        assert_eq!(new_chapter.summary.file_path, "manuscript/chapter-002.md");

        let updated = write_chapter(WriteChapterRequest {
            project_path: project_path_text.clone(),
            file_path: "manuscript/chapter-001.md".to_string(),
            content: [
                "---",
                "id: chapter_001",
                "title: Revised Chapter",
                "order: 1",
                "status: draft",
                "---",
                "",
                "Mira writes one clear line.",
            ]
            .join("\n"),
        })
        .expect("chapter should be written");

        assert_eq!(updated.title, "Revised Chapter");
        assert_eq!(updated.word_count, 5);

        let appended = append_narrative_events(AppendProjectRecordsRequest {
            project_path: project_path_text.clone(),
            records: vec![json!({
                "event_id": "event_test_001",
                "event_type": "chapter_metadata_changed"
            })],
        })
        .expect("event should be appended");

        assert_eq!(appended, 1);
        let event_log = fs::read_to_string(project_path.join("events/narrative_events.jsonl"))
            .expect("event log should be readable");
        assert!(event_log.contains("event_test_001"));

        let meetings_appended = append_room_meetings(AppendProjectRecordsRequest {
            project_path: project_path_text.clone(),
            records: vec![json!({
                "meeting_id": "meeting_test_001",
                "question": "Smoke meeting?"
            })],
        })
        .expect("meeting should be appended");
        assert_eq!(meetings_appended, 1);
        let meeting_log = fs::read_to_string(project_path.join("meetings/room_meetings.jsonl"))
            .expect("meeting log should be readable");
        assert!(meeting_log.contains("meeting_test_001"));

        write_character_state(WriteProjectJsonRequest {
            project_path: project_path_text.clone(),
            value: json!({
                "schema_version": 1,
                "characters": [{
                    "character_id": "char_mira",
                    "name": "Mira",
                    "role": "lead",
                    "current_status": "testing state writes",
                    "open_loops": [],
                    "relationships": [],
                    "referenced_chapters": [],
                    "updated_at": "2026-05-14T00:00:00.000Z"
                }]
            }),
        })
        .expect("character state should be written");
        let characters = read_character_state(project_path_text.clone())
            .expect("character state should be readable");
        assert_eq!(characters["characters"][0]["character_id"], "char_mira");

        write_open_loop_state(WriteProjectJsonRequest {
            project_path: project_path_text.clone(),
            value: json!({
                "schema_version": 1,
                "open_loops": [{
                    "open_loop_id": "loop_test",
                    "title": "Test unresolved thread",
                    "status": "open",
                    "introduced_in": "chapter_001",
                    "expected_payoff": "later",
                    "related_characters": [],
                    "related_chapters": ["chapter_001"],
                    "notes": "testing state writes",
                    "updated_at": "2026-05-14T00:00:00.000Z"
                }]
            }),
        })
        .expect("open loop state should be written");
        let open_loops = read_open_loop_state(project_path_text.clone())
            .expect("open loop state should be readable");
        assert_eq!(open_loops["open_loops"][0]["open_loop_id"], "loop_test");

        let status = snapshot_status(project_path_text.clone()).expect("snapshot status should be readable");
        assert!(status.changed_files > 0);
        assert!(status.changed_chapters > 0);
        assert!(status.changed_state_files > 0);

        let snapshot = save_snapshot(SaveSnapshotRequest {
            project_path: project_path_text.clone(),
            message: Some("Smoke snapshot".to_string()),
        })
        .expect("snapshot should be saved");

        assert_eq!(snapshot.message, "Smoke snapshot");
        assert!(snapshot.changed_files > 0);
        assert_ne!(snapshot.snapshot_id, "none");
        let clean_status = snapshot_status(project_path_text.clone()).expect("clean status should be readable");
        assert_eq!(clean_status.changed_files, 0);
        assert!(clean_status.has_snapshot);

        fs::remove_dir_all(project_path).expect("test project should be removed");
    }
}
