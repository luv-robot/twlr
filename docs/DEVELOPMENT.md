# Development Notes

This document records the current local development entry points and known environment blockers.

## Frontend

Install dependencies:

```bash
npm install
```

Run type checks:

```bash
npm run typecheck
```

Build the desktop frontend:

```bash
npm run build -w @twlr/desktop
```

Run the Vite dev server:

```bash
npm run dev -w @twlr/desktop -- --host 127.0.0.1
```

Current verified frontend status:

- `npm run typecheck` passes.
- `npm run build -w @twlr/desktop` passes.
- Vite serves `http://127.0.0.1:1420/` successfully.

## Tauri / Rust

The current local machine has:

```text
rustc 1.74.0
cargo 1.74.0
```

That toolchain is too old for the current Tauri dependency resolution. `cargo check` is blocked before compiling TWLR code because transitive crates now use Rust 2024 edition metadata. During verification, the blocker appeared at:

- `idna_adapter v1.2.2`
- `serde_spanned v1.1.1`
- `time-core v0.1.8`

Practical next step:

```text
Upgrade Rust/Cargo to a current stable toolchain before running cargo check or tauri dev.
```

The currently observed dependency chain includes crates that require at least Rust 1.88. Use a current stable Rust toolchain rather than trying to pin many transitive crates.

## Browser Smoke Check

The Vite server returned HTTP 200 on `http://127.0.0.1:1420/`.

The in-app browser automation connection timed out during this pass, so no screenshot was captured. This was a browser automation issue, not a frontend build failure.
