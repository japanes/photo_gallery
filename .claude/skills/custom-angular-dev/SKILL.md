---
name: custom-angular-dev
description: Reviews Angular code for compliance with project architecture, conventions, and TypeScript requirements. Use when the user asks to check, review, audit, or validate Angular code quality, or before committing refactored code. Detects anti-patterns, security issues, memory leaks, and deviations from the target architecture defined in CLAUDE.md.
compatibility: Designed for Claude Code. Requires access to the project filesystem.
allowed-tools: Bash(npx:*) Read Glob Grep
metadata:
  author: team
  version: "1.0"
---

# Custom Angular Dev — Code Compliance Review

Analyze Angular project source code and report violations of the team's architecture, conventions, and TypeScript standards.

## When to activate

- User asks to "check", "review", "audit", or "validate" code quality
- User asks to verify compliance with project standards
- User invokes `/custom-angular-dev` directly
- Before finalizing a refactoring or feature branch

## Scope

Analyze files under `app/src/app/` — components, services, pipes, models, config, and routes.

## Review checklist

Run each check group below. For every violation found, report:
- **File and line** (e.g. `app/src/app/components/header/header.component.ts:42`)
- **Rule violated** (short ID from the list below)
- **Severity**: CRITICAL / WARNING / INFO
- **Current code** (snippet)
- **Recommended fix** (snippet or description)

---

### 1. Standalone components (STANDALONE)

| ID | Check | Severity |
|----|-------|----------|
| STANDALONE-1 | Every `@Component` must have `standalone: true` | CRITICAL |
| STANDALONE-2 | No `NgModule` declarations (`@NgModule`, `declarations: [...]`) should exist | CRITICAL |
| STANDALONE-3 | Imports of other components/pipes/directives must be in the component's `imports` array, not in a module | WARNING |

### 2. Change detection (CHANGE-DET)

| ID | Check | Severity |
|----|-------|----------|
| CD-1 | Every `@Component` must set `changeDetection: ChangeDetectionStrategy.OnPush` | WARNING |

### 3. Signals & state management (SIGNALS)

| ID | Check | Severity |
|----|-------|----------|
| SIG-1 | Prefer `signal()`, `computed()`, `effect()` over `BehaviorSubject` / `ReplaySubject` for component state | WARNING |
| SIG-2 | Services must NOT expose public mutable state (e.g. `public photos: any[] = []`) | CRITICAL |
| SIG-3 | `BehaviorSubject` in services should be private with a public `readonly` signal or `asObservable()` | WARNING |

### 4. TypeScript strict typing (TS)

| ID | Check | Severity |
|----|-------|----------|
| TS-1 | No `any` type anywhere (variables, parameters, return types, generics) | CRITICAL |
| TS-2 | `tsconfig.json` must have `"strict": true` and `"strictTemplates": true` | CRITICAL |
| TS-3 | Models must be defined as `interface`, not `class` | WARNING |
| TS-4 | Use `===` and `!==` instead of `==` and `!=` | WARNING |

### 5. RxJS & subscriptions (RXJS)

| ID | Check | Severity |
|----|-------|----------|
| RX-1 | Every `.subscribe()` in a component must have a corresponding unsubscription mechanism (`takeUntilDestroyed()`, `DestroyRef`, or `| async` pipe) | CRITICAL |
| RX-2 | Use observer object syntax `{ next: ..., error: ... }` not positional callback arguments in `.subscribe()` | WARNING |
| RX-3 | No orphan subscriptions (subscribe without assignment or pipe-based cleanup) | CRITICAL |

### 6. Templates & control flow (TPL)

| ID | Check | Severity |
|----|-------|----------|
| TPL-1 | Use `@for` with `track` instead of `*ngFor` | WARNING |
| TPL-2 | Use `@if` instead of `*ngIf` | WARNING |
| TPL-3 | Every `*ngFor` (if still present) must have a `trackBy` function | WARNING |
| TPL-4 | Use `\| async` pipe or signal reads in templates instead of manual subscription fields | INFO |

### 7. HTTP & API (HTTP)

| ID | Check | Severity |
|----|-------|----------|
| HTTP-1 | Use `provideHttpClient()` in app config, not `HttpClientModule` | WARNING |
| HTTP-2 | Every HTTP call must have `catchError` or equivalent error handling | CRITICAL |
| HTTP-3 | API base URL must come from `environment` config, not hardcoded strings | WARNING |
| HTTP-4 | Use `provideRouter()` in app config, not `RouterModule.forRoot()` | WARNING |

### 8. Security (SEC)

| ID | Check | Severity |
|----|-------|----------|
| SEC-1 | No `[innerHTML]` binding with user-controlled data | CRITICAL |
| SEC-2 | No credentials (passwords, tokens) in URL query parameters | CRITICAL |
| SEC-3 | No secrets or API keys hardcoded in source code | CRITICAL |

### 9. Code quality (QUAL)

| ID | Check | Severity |
|----|-------|----------|
| QUAL-1 | No `console.log` / `console.warn` / `console.error` in production code (test files excluded) | WARNING |
| QUAL-2 | No dead code: empty method bodies, unreachable code, unused imports | INFO |
| QUAL-3 | No impure pipes (`pure: false`) | WARNING |
| QUAL-4 | Services must use `@Injectable({ providedIn: 'root' })` | WARNING |

### 10. Bootstrap & configuration (BOOT)

| ID | Check | Severity |
|----|-------|----------|
| BOOT-1 | App must bootstrap with `bootstrapApplication()`, not `platformBrowserDynamic().bootstrapModule()` | WARNING |
| BOOT-2 | `app.config.ts` must exist and provide router, HTTP client via `provideRouter()` / `provideHttpClient()` | WARNING |

---

## Steps

1. **Collect files**: Use `Glob` to find all `.ts` and `.html` files under `app/src/app/`. Also read `tsconfig.json`, `tsconfig.app.json`, `app/src/main.ts`, and `app/src/app/app.config.ts` if they exist.

2. **Read and analyze**: For each file, read its content and check against every applicable rule from the checklist above.

3. **Compile report**: Group findings by severity, then by file. Use this format:

   ```
   ## Code Compliance Report

   **Scanned**: N files
   **Violations**: X CRITICAL, Y WARNING, Z INFO

   ### CRITICAL

   #### SEC-1 — [innerHTML] with user data
   **File**: `app/src/app/components/header/header.component.html:12`
   **Current**:
   <span [innerHTML]="userName"></span>
   **Fix**: Use text interpolation: `<span>{{ userName }}</span>>`

   ...

   ### WARNING
   ...

   ### INFO
   ...

   ## Summary
   - Total files scanned: N
   - Clean files: M
   - Files with violations: K
   - Compliance score: XX% (files without CRITICAL / total)
   ```

4. **Compliance score**: Calculate as `(files without any CRITICAL violation) / (total files scanned) * 100`, rounded to the nearest integer.

5. **Prioritized action plan**: After the report, list the top 5 most impactful fixes to improve the score, ordered by:
   - Number of CRITICAL violations they would resolve
   - Number of files affected
   - Effort required (low / medium / high)

## Rules

- Do NOT modify any files. This skill is read-only — it only reports findings.
- Report only real violations with concrete file paths and line numbers. No guessing.
- If a file follows all rules, do not include it in the report (only count it in "clean files").
- Write the report in the same language the user has been using in the conversation.
- If the project is partially refactored (some files modern, some legacy), report both states and highlight progress.
