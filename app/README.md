# 🧪 Senior Developer + Claude Code Assessment

## Photo Manager — Test Project

This is a simplified photo management application built with Angular 19. The application has been intentionally written with **numerous issues** across architecture, code quality, typing, patterns, and best practices.

Your task is to demonstrate your ability to use **Claude Code** to analyze, refactor, fix, and test this codebase.

---

## Project Overview

A photo gallery application with the following features:
- Photo gallery with grid view, search, sort, and pagination
- Photo upload with preview
- Album management via sidebar
- User authentication (mock)
- User profile page
- Dark mode toggle

**Stack:** Angular 19, TypeScript, SCSS, RxJS

---

## Assessment Tasks

### Part 1: Environment Setup (30 min)

1. **Create a `CLAUDE.md` file** that describes this project for Claude Code:
   - Project architecture and conventions
   - Known patterns and anti-patterns
   - Tech stack details
   - Development commands

2. **Configure Claude Code** for the project:
   - Set up `.claude/settings.json`
   - Create at least 2 custom slash commands for recurring tasks
   - Configure any relevant MCP servers

### Part 2: Refactoring with Claude Code (90 min)

Using Claude Code as your primary tool, perform the following:

1. **Migrate to standalone components:**
   - Convert `PhotoGalleryComponent`, `PhotoCardComponent`, and `UploadDialogComponent` from module-based to standalone
   - Remove the `GalleryModule` and `SharedModule`
   - Update `main.ts` to use standalone bootstrap with `bootstrapApplication`

2. **Introduce Angular Signals:**
   - Replace `BehaviorSubject` patterns in `PhotoService` with signals where appropriate
   - Use `computed()` for derived state (e.g., filtered photos, total likes)
   - Replace imperative state in components with signal-based reactivity

3. **Fix type safety:**
   - Replace ALL `any` types with proper interfaces
   - Add strict typing to models, services, and components
   - Enable `strict: true` in `tsconfig.json`

4. **Fix the 3 critical bugs:**
   - Memory leaks (unsubscribed observables)
   - Broken pagination (doesn't reset on filter change)
   - XSS vulnerability in HeaderComponent (innerHTML)

### Part 3: Testing with Claude Code (60 min)

- Write unit tests for the refactored components and services
- Achieve **>80% code coverage** on modified files
- Tests must follow the Arrange-Act-Assert pattern

### Part 4: Documentation (30 min)

Write a brief report (`REPORT.md`) covering:
- Which prompts worked well and which didn't (with examples)
- Where Claude Code made mistakes and how you fixed them
- Where manual coding was faster than Claude Code
- Recommendations for team adoption of Claude Code

---

## Requirements

- **Record your terminal session** using `asciinema` or screen recording
- The recording is as important as the code — we evaluate your **process**, not just the result
- Commit frequently with meaningful messages
- Use Claude Code for the majority of the work, but manual edits are expected where appropriate

---

## Getting Started

```bash
npm install
ng serve
```

The app runs on `http://localhost:4200`

---

## Evaluation Criteria

| Criteria | Weight |
|---|---|
| Claude Code proficiency (prompt quality, iteration, context management) | 30% |
| Code quality of the result (architecture, typing, patterns) | 25% |
| Testing quality and coverage | 20% |
| Process documentation (REPORT.md) | 15% |
| CLAUDE.md and tooling setup | 10% |

---

## Time Limit

**3-4 hours total.** Quality over quantity — it's better to do fewer tasks well than rush through everything.

Good luck! 🚀
