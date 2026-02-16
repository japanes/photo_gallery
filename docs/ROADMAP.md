# Roadmap

## Part 1: Environment Setup

- [x] Create `CLAUDE.md` with project description for Claude Code
  - [x] Project architecture and conventions
  - [x] Known patterns and anti-patterns
  - [x] Tech stack details
  - [x] Development commands
- [x] Configure Claude Code for the project
  - [x] Set up `.claude/settings.json`
  - [x] Create at least 2 custom slash commands for recurring tasks
  - [x] Configure any relevant MCP servers

## Part 2: Refactoring with Claude Code

- [x] Migrate to standalone components
  - [x] Convert `PhotoGalleryComponent` from module-based to standalone
  - [x] Convert `PhotoCardComponent` from module-based to standalone
  - [x] Convert `UploadDialogComponent` from module-based to standalone
  - [x] Remove `GalleryModule` and `SharedModule`
  - [x] Update `main.ts` to use `bootstrapApplication`
- [x] Introduce Angular Signals
  - [x] Replace `BehaviorSubject` patterns in `PhotoService` with signals
  - [x] Use `computed()` for derived state (filtered photos, total likes)
  - [x] Replace imperative state in components with signal-based reactivity
- [x] Fix type safety
  - [x] Replace ALL `any` types with proper interfaces
  - [x] Add strict typing to models, services, and components
  - [x] Enable `strict: true` in `tsconfig.json`
- [x] Fix 3 critical bugs
  - [x] Memory leaks (unsubscribed observables)
  - [x] Broken pagination (doesn't reset on filter change)
  - [x] XSS vulnerability in HeaderComponent (`innerHTML`)

## Part 3: Testing with Claude Code

- [ ] Write unit tests for refactored components and services
- [ ] Achieve >80% code coverage on modified files
- [ ] Tests follow Arrange-Act-Assert pattern

## Known BUG Comments in Codebase

### `environments/environment.ts`
- [x] Debug flag exists but nothing uses it (line 6)

### `app.component.ts`
- [x] Console.log left in code (line 74)
- [x] No actual navigation or filtering logic for album selection (line 75)

### `pipes/truncate.pipe.ts`
- [x] Not marked as pure — implementation has side effects potential (line 3)
- [x] No null/undefined handling, will throw on null values (line 9)
- [x] No type checking — will crash if value is not a string (line 11)
- [x] Cuts in the middle of words (line 15)

### `pipes/time-ago.pipe.ts`
- [x] Impure pipe for time — recalculates on every change detection (line 3)
- [x] `pure: false` causes performance issues (line 7)
- [x] No timezone handling (line 13)
- [x] No handling for months/years, falls through to undefined (line 22)

### `pipes/file-size.pipe.ts`
- [x] Using 1000 instead of 1024 for binary file sizes (line 8)
- [x] No handling for negative numbers or NaN (line 9)
- [x] `const k = 1000` — should be 1024 for binary (line 13)

### `services/photo.service.ts`
- [x] Hardcoded API URL, should use environment config (line 35)
- [x] No error handling, returns any, no typing (line 38)
- [x] No return type, mutates internal state directly (line 60)
- [x] No validation, no progress tracking, fake upload implementation (line 71)
- [x] Building FormData incorrectly, no file type validation (line 73)
- [x] `JSON.stringify` comment mismatch in metadata append (line 77)
- [x] Mutates array directly instead of creating new reference (line 82)
- [x] No debounce, no minimum query length, hits API on every keystroke (line 93)
- [x] No pagination support (line 121)

### `services/auth.service.ts`
- [x] No actual token validation, just checks if user exists (line 81)
- [x] Role check using magic strings (line 86)
- [x] No token refresh mechanism (line 91)

### `services/notification.service.ts`
- [ ] No auto-dismiss, no max notifications limit, memory leak potential (line 12)
- [ ] Using Math.random for IDs (line 15)
- [ ] No validation of notification type (success/error/warning/info) (line 17)
- [ ] setTimeout without cleanup on service destroy (line 22)

### `components/header/header.component.ts`
- [ ] No semantic HTML — should use `<header>`, `<nav>` (template, line 14)
- [ ] Search duplicated in header and gallery, no shared state (template, line 22)
- [ ] No actual search implementation (line 129)
- [ ] Hardcoded credentials for "demo" — security issue (line 134)
- [ ] No confirmation dialog on logout (line 139)
- [x] Direct DOM manipulation (line 145)

### `components/photo-gallery/photo-gallery.component.ts`
- [ ] No loading skeleton, just a spinner (template, line 36)
- [ ] No empty state handling (template, line 44)
- [ ] No trackBy function, will re-render entire list on any change (template, line 51)
- [ ] Pagination is broken — always shows page 1 (template, line 65)
- [ ] No confirmation dialog before deletion (line 280)
- [ ] No navigation to detail view, just logs (line 286)
- [ ] Reloads all photos instead of adding to existing list (line 293)

### `components/photo-card/photo-card.component.ts`
- [ ] No NgOptimizedImage, no lazy loading, no alt text derived from data (template, line 12)
- [ ] No error handling for broken images (template, line 13)
- [ ] Pipe `truncate` used but might not work correctly (template, line 19)
- [ ] No date formatting, raw date string shown (template, line 26)
- [ ] No aria labels, no keyboard support (template, line 31)
- [ ] Tags rendered without proper styling or click handling (template, line 37)
- [ ] No placeholder/skeleton while loading (styles, line 64)
- [ ] No text overflow handling (styles, line 72)
- [ ] No confirmation before emitting delete (line 143)

### `components/sidebar/sidebar.component.ts`
- [ ] No semantic HTML — should use `<aside>`, `<nav>` (template, line 10)
- [ ] No loading state for albums (template, line 14)
- [ ] No album cover image, just text (template, line 20)
- [ ] Create album doesn't work (template, line 27)
- [ ] Tags hardcoded, not loaded from API (template, line 35)
- [ ] Fixed height causes content cut-off on small screens (styles, line 74)
- [ ] Hardcoded tags in component (line 180)
- [ ] Not implemented, just logs (line 198)

### `components/upload-dialog/upload-dialog.component.ts`
- [ ] No backdrop click to close, no escape key handler (template, line 14)
- [ ] No focus trap for accessibility (template, line 15)
- [ ] No drag-and-drop support (template, line 24)
- [ ] No file type restriction in UI, only in validation (template, line 25)
- [ ] Error message shown incorrectly (template, line 32)
- [ ] Albums not loaded, empty select (template, line 55)
- [ ] No upload progress bar (template, line 81)
- [ ] Preview shown even when no file selected (template, line 93)
- [ ] No file size validation (line 236)
- [ ] No file type validation beyond accept attribute (line 237)
- [ ] FileReader not cleaned up, potential memory leak (line 242)
- [ ] Tags not properly parsed from comma-separated string (line 259)
- [ ] No error handling, no progress tracking (line 266)
- [ ] No user-visible error notification (line 277)
- [ ] No cleanup of preview URL — `URL.revokeObjectURL` not called (line 283)

### `components/user-profile/user-profile.component.ts`
- [ ] No NgOptimizedImage (template, line 19)
- [ ] Role displayed using magic string comparison (template, line 24)
- [ ] No lazy loading, shows ALL photos (template, line 48)
- [ ] Save doesn't do anything (template, line 69)
- [ ] No loading state, no "not found" state (template, line 76)
- [ ] Not implemented, just logs (line 238)
- [ ] Should make HTTP call and update on success (line 240)

---

## Part 4: Documentation

- [ ] Write `REPORT.md`
  - [ ] Which prompts worked well and which didn't (with examples)
  - [ ] Where Claude Code made mistakes and how you fixed them
  - [ ] Where manual coding was faster than Claude Code
  - [ ] Recommendations for team adoption of Claude Code
