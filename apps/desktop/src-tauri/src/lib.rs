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
struct AppendProjectRecordsRequest {
    project_path: String,
    records: Vec<serde_json::Value>,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_project,
            open_project,
            list_chapters,
            read_chapter,
            write_chapter,
            append_narrative_events,
            append_state_proposals
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
