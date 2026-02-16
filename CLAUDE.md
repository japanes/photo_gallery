
# Photo Gallery App

## Project Overview

A photo gallery application with the following features:

- **Photo gallery** with grid view, search, sort, and pagination
- **Photo upload** with preview
- **Album management** via sidebar
- **User authentication** (mock)
- **User profile** page
- **Dark mode** toggle

The codebase intentionally contains numerous issues for assessment purposes — the goal is to analyze, refactor, fix, and test the application.

Source code is in the `app/` subdirectory.

## Tech Stack

- Angular 19.0.0, TypeScript 5.6, SCSS, RxJS 7.8
- Karma + Jasmine for testing
- Docker Compose for development environment

## Project Architecture and Conventions

**TARGET** — how code SHOULD be written when refactoring or adding new code:

- **Components**: Standalone (no NgModules). Use `standalone: true` in `@Component` decorator
- **State management**: Angular Signals (`signal()`, `computed()`, `effect()`) instead of BehaviorSubjects
- **Type safety**: Strict typing everywhere. No `any`. Use interfaces (not classes) for models. Enable `strict: true` in tsconfig
- **Services**: Use `@Injectable({ providedIn: 'root' })`. Private state, expose via readonly signals/observables
- **Change detection**: `ChangeDetectionStrategy.OnPush` on all components
- **Templates**: Use `@for` / `@if` (new control flow) with `track` instead of `*ngFor` / `*ngIf`. Use `| async` pipe or signal-based state
- **RxJS**: Unsubscribe all subscriptions (`takeUntilDestroyed`, `DestroyRef`). Use observer object syntax `{ next, error }` not callback args
- **HTTP**: Use `provideHttpClient()` in app config, not `HttpClientModule`
- **Bootstrap**: Use `bootstrapApplication()` with `provideRouter()`, not `platformBrowserDynamic().bootstrapModule()`
- **Error handling**: Handle errors in HTTP calls with `catchError`. No silent failures
- **Security**: Never use `[innerHTML]` for user data. Never send credentials in query params
- **Code quality**: No `console.log` in production. Use `===` not `==`. Add `trackBy` / `track` to all loops
- **Pipes**: Pure pipes only. No impure pipes

**File structure:**

```
app/src/app/
├── components/ (header, photo-card, photo-gallery, sidebar, upload-dialog, user-profile)
├── services/ (auth, notification, photo)
├── models/ (photo.model.ts)
├── pipes/ (file-size, time-ago, truncate)
├── app.component.ts
├── app.config.ts (replaces app.module.ts)
├── app.routes.ts (separate routing file)
```

- Path aliases: `@app/*` → `src/app/*`, `@env/*` → `src/environments/*`
- Component prefix: `app`
- Styles: SCSS, component-scoped
- API: JSONPlaceholder (mock backend). Use environment config for API URLs

## Known Anti-Patterns

**CURRENT** — what exists in the codebase and needs to be fixed:

- NgModule-based instead of standalone components
- `strict: false` and `strictTemplates: false` in tsconfig
- Extensive `any` types everywhere (models, services, components)
- Models defined as classes instead of interfaces
- Services not using `providedIn: 'root'`
- Public mutable state in services (e.g., `public photos: any[] = []`)
- Manual subscriptions without cleanup → memory leaks
- No OnPush change detection on any component
- No trackBy in `*ngFor`
- Hardcoded API URLs (ignoring environment config)
- XSS via `[innerHTML]` in header
- Credentials in query params (AuthService.login)
- Deprecated subscribe callback syntax
- `console.log` in production code
- No error handling in HTTP calls
- Impure TimeAgoPipe
- No ESLint/Prettier config
- Zero test files
- `==` instead of `===` in multiple places
- BehaviorSubjects exposed publicly
- Dead code / unimplemented methods

**Critical bugs:**

1. **Memory leaks**: unsubscribed observables in PhotoGalleryComponent and SidebarComponent
2. **Broken pagination**: doesn't reset to page 1 when filters change
3. **XSS vulnerability**: `[innerHTML]` for user name in HeaderComponent

## Development Commands

```bash
# Docker (primary way to run)
docker compose up              # start dev server
docker compose up --build      # rebuild and start
docker compose down            # stop

# Inside container
npm start                      # dev server on port 4200 (alias for ng serve)
npm run build                  # production build
npm test                       # run tests (watch mode)
npm run test:ci                # headless CI tests
npm run lint                   # lint
```
