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

- [ ] Migrate to standalone components
  - [ ] Convert `PhotoGalleryComponent` from module-based to standalone
  - [ ] Convert `PhotoCardComponent` from module-based to standalone
  - [ ] Convert `UploadDialogComponent` from module-based to standalone
  - [ ] Remove `GalleryModule` and `SharedModule`
  - [ ] Update `main.ts` to use `bootstrapApplication`
- [ ] Introduce Angular Signals
  - [ ] Replace `BehaviorSubject` patterns in `PhotoService` with signals
  - [ ] Use `computed()` for derived state (filtered photos, total likes)
  - [ ] Replace imperative state in components with signal-based reactivity
- [ ] Fix type safety
  - [ ] Replace ALL `any` types with proper interfaces
  - [ ] Add strict typing to models, services, and components
  - [ ] Enable `strict: true` in `tsconfig.json`
- [ ] Fix 3 critical bugs
  - [ ] Memory leaks (unsubscribed observables)
  - [ ] Broken pagination (doesn't reset on filter change)
  - [ ] XSS vulnerability in HeaderComponent (`innerHTML`)

## Part 3: Testing with Claude Code

- [ ] Write unit tests for refactored components and services
- [ ] Achieve >80% code coverage on modified files
- [ ] Tests follow Arrange-Act-Assert pattern

## Part 4: Documentation

- [ ] Write `REPORT.md`
  - [ ] Which prompts worked well and which didn't (with examples)
  - [ ] Where Claude Code made mistakes and how you fixed them
  - [ ] Where manual coding was faster than Claude Code
  - [ ] Recommendations for team adoption of Claude Code
