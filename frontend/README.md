# CodeToAnim Frontend

The frontend is a React 19 single-page application built with Vite. CodeToAnim helps people learn data structures and algorithms by combining searchable lessons, algorithm examples, an interactive editor, and step-by-step visualizations.

The application intentionally has two experiences:

1. **Public learning and SEO surface**: stable pages that can be linked, indexed, and opened without an account.
2. **Authenticated learning workspace**: `/profile` is a dashboard shell. After sign-in, it changes content using local view state instead of creating a route for every dashboard panel.

## Contents

- [Architecture at a glance](#architecture-at-a-glance)
- [Project structure](#project-structure)
- [Route map](#route-map)
- [Public and SEO mindset](#public-and-seo-mindset)
- [Authenticated dashboard mindset](#authenticated-dashboard-mindset)
- [State and data flow](#state-and-data-flow)
- [GA4 analytics architecture](#ga4-analytics-architecture)
- [Key modules](#key-modules)
- [Local development](#local-development)
- [Build and validation](#build-and-validation)
- [Adding a feature](#adding-a-feature)

## Architecture at a glance

```text
Browser
  |
  v
App.jsx
  |-- HelmetProvider       page metadata
  |-- AuthProvider         Supabase session and auth modal state
  |-- ThemeProvider        light, dark, and coffee themes
  |-- BrowserRouter        public routes and /profile entry point
  |-- GlobalTracker        authenticated learning-time tracking
  |-- Analytics            GA4 page views and product events (planned)
  |
  +-- Public pages         Landing, Learn, Algorithms, Workspace, About, Community, etc.
  +-- ProfilePage          authenticated dashboard shell
        |-- dashboard
        |-- library
        |-- workspace       embeds WorkspacePage
        |-- leaderboard
        +-- feedback
```

`App.jsx` owns application bootstrapping, route registration, the top-level Supabase session check, and the daily streak RPC. Feature behavior belongs in the page, component, context, hook, or data module that owns it.

## Project structure

```text
frontend/
|-- index.html                 Vite HTML entry point
|-- package.json               scripts and dependencies
|-- vite.config.js             Vite configuration
|-- eslint.config.js           ESLint configuration
|-- vercel.json                Vercel deployment configuration
|-- public/
|   |-- robots.txt              crawler rules
|   +-- sitemap.xml             public URL discovery
|-- src/
|   |-- main.jsx                React DOM entry point
|   |-- App.jsx                 providers, auth bootstrap, and routes
|   |-- index.css               global Tailwind import and scrollbar rules
|   |-- supabaseClient.js       Supabase browser client
|   |-- assets/                 bundled static assets
|   |-- components/             reusable UI and editor/visualizer building blocks
|   |-- context/                cross-cutting auth and theme state
|   |-- data/                   local lesson and algorithm catalogs
|   |-- hooks/                  reusable stateful behavior
|   |-- pages/                  route-level screens and dashboard screens
|   +-- utils/                  small shared utilities, such as auth error mapping
```

### Component boundaries

- `pages/` owns route-level composition, page metadata, page data loading, and major screen state.
- `components/` owns reusable interaction surfaces. `Editor.jsx` and `Visualizer.jsx` form the core algorithm execution experience; `Navbar.jsx` and `LandingNav.jsx` provide navigation variants.
- `context/` owns state needed across many pages. Keep page-specific data local unless multiple route surfaces genuinely need it.
- `data/` is the source of truth for the static algorithm and lesson catalogs. Routes and filters should consume these exports rather than duplicate records.
- `hooks/` contains lifecycle behavior independent of page layout. `useLearningTracker` records active learning time for the signed-in user.
- `analytics/` should contain GA4 initialization, event names, and tracking helpers when analytics implementation begins. Keep analytics calls out of visual components where possible.

## Route map

| URL | Screen | Access | Purpose |
| --- | --- | --- | --- |
| `/` | `LandingPage` | Public | Product entry point and sign-in entry point |
| `/learn` | `LearnHub` | Public | Browse data-structure lessons |
| `/learn/:category/:topic` | `LessonPage` | Public | Read a lesson and open related practice |
| `/algorithms` | `AlgorithmLibrary` | Public | Search and filter the algorithm catalog |
| `/workspace` | `WorkspacePage` | Public | Standalone editor and visualization workspace |
| `/about` | `About` | Public | Product and project information |
| `/community` | `CommunityPage` | Public | Community-facing content |
| `/leaderboard` | `Leaderboard` | Public | Public leaderboard view |
| `/p/:userId` | `PublicProfileCard` | Public | Shareable public profile |
| `/profile` | `ProfilePage` | Authenticated | Single dashboard shell for the signed-in experience |
| `/auth` | `AuthRedirect` | Transitional | Redirects legacy auth links and opens `LoginModal` |
| `/reset-password` | `ResetPassword` | Auth flow | Completes the password reset flow |
| `*` | `NotFoundPage` | Public | Fallback for unknown URLs |

The `/profile` route is guarded in `App.jsx`. While the Supabase session is loading it shows a loading frame; an authenticated session renders the dashboard, and an unauthenticated visitor is redirected to `/`.

## Public and SEO mindset

The public pages are the discoverable learning layer. Each important concept should have a stable URL and meaningful page content before authentication is required.

- Keep lessons addressable through `/learn/:category/:topic`, with route parameters resolving into `LESSONS_DATABASE`.
- Keep algorithms addressable and searchable through `/algorithms`, with records coming from `ALGORITHMS_DATABASE`.
- Keep the editor usable at `/workspace` without requiring a dashboard session. Lessons and algorithms can pass a preset into the workspace through navigation state or query parameters.
- Use `react-helmet-async` for page titles, descriptions, and canonical URLs. `AlgorithmLibrary`, `LearnHub`, and `WorkspacePage` establish this pattern; lesson metadata is derived from the selected lesson.
- Keep `public/robots.txt` and `public/sitemap.xml` aligned with public routes. Do not add private dashboard URLs to the sitemap.
- Treat public pages as standalone entry points. A visitor may arrive directly from search, so the page should explain its subject and provide a clear path to practice or sign in.

SEO here is a routing and content decision, not only a metadata decision: stable URLs, useful rendered copy, internal links, and focused page responsibilities make the learning catalog discoverable.

## Authenticated dashboard mindset

Once a user signs in, `/profile` becomes the product workspace. `ProfilePage` owns the dashboard frame, sidebar, header search, profile data, theme controls, and the active content view.

The current view is stored as `codeanim_current_view` in `localStorage`, so the user can return to the last dashboard section. The supported in-dashboard views are:

| View state | Dashboard content |
| --- | --- |
| `dashboard` | Profile summary, XP/level, activity heatmap, progress, recent algorithms, and leaderboard preview |
| `library` | Searchable and filterable algorithm library using the shared algorithm catalog |
| `workspace` | Embedded `WorkspacePage` for editing and visualizing code |
| `leaderboard` | Full leaderboard view |
| `feedback` | Feedback widget/form |

This model keeps signed-in learning continuous: users can move from progress to library to workspace without losing the dashboard shell. When an algorithm is selected, `ProfilePage` navigates back to `/profile` with `presetCode` and algorithm metadata in location state, then activates the `workspace` view.

The dashboard is not a replacement for the public routes. Public routes are for discovery and shareable learning content; the dashboard is for personalized progress, saved code, activity, and a focused authenticated workflow.

## State and data flow

### Authentication

`AuthProvider` listens to Supabase auth state and exposes `user`, `loading`, and login modal controls through `useAuth`. `LoginModal` handles sign-in and sign-up, then routes successful users to `/profile`.

`App.jsx` also keeps a top-level session value for guarding `/profile` and calls the `update_user_streak` RPC once per signed-in user session.

### Dashboard data

`ProfilePage` requests the signed-in dashboard payload through the `get_user_dashboard_payload` Supabase RPC. The payload supplies profile data, saved code, algorithm progress, daily activity, recent activity, and leaderboard data. A five-minute per-user `sessionStorage` cache reduces repeat dashboard fetches during the same session.

### Theme

`ThemeProvider` supports `light`, `dark`, and `coffee`. The selected theme is persisted in `localStorage`, mirrored to `sessionStorage`, and applied as a class on `document.body`. `ProfilePage` also synchronizes a changed signed-in theme back to the `profiles` table when the tab becomes hidden or closes.

### Learning tracking

`GlobalTracker` mounts `useLearningTracker` once inside the providers. For an authenticated user, the hook measures active time with timestamps and periodically calls the `increment_learning_time` Supabase RPC. It pauses accounting when the document is hidden and performs a final best-effort sync on tab close.

### Supabase configuration

The browser client reads:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Create these in a local `frontend/.env` file or through the deployment environment. The anon key is intended for browser use; never place a service-role key in the frontend.

## GA4 analytics architecture

GA4 should measure the learning journey across both application surfaces without becoming coupled to page markup. React Router is the source of truth for page views; meaningful user actions are tracked through a small, stable event vocabulary.

### Recommended implementation boundary

Add analytics as a cross-cutting layer under `src/analytics/`:

```text
src/analytics/
|-- config.js                GA4 measurement ID and runtime enablement
|-- analytics.js             initialize GA4 and expose safe tracking functions
|-- events.js                event-name constants and parameter builders
+-- AnalyticsTracker.jsx     subscribes to React Router location changes
```

This directory does not exist yet. It is the recommended home for the GA4 implementation so pages do not each initialize Google Analytics independently.

### Environment configuration

Use a Vite public environment variable for the measurement ID:

```env
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

The measurement ID is not a secret, but it should be configured per environment. Keep analytics disabled when the variable is missing or when the user has not granted the required analytics consent.

Do not send passwords, access tokens, email addresses, full user IDs, saved code, feedback text, or arbitrary source code to GA4. Prefer anonymous aggregate measurement.

### SPA page-view model

React Router changes the URL without reloading the document, so GA4 must receive one page view after each location change. Track the canonical route, not rendered text:

| Route family | Recommended page category |
| --- | --- |
| `/` | Landing |
| `/learn` | Learn hub |
| `/learn/:category/:topic` | Lesson |
| `/algorithms` | Algorithm library |
| `/workspace` | Public workspace |
| `/profile` | Authenticated dashboard |
| `/about`, `/community`, `/leaderboard` | Public page |
| `/p/:userId` | Public profile |

Do not send query strings, Supabase tokens, recovery codes, or arbitrary `location.state` values as page-view parameters. For public profiles, use the route category only and never send `userId` to GA4.

### Event naming convention

Use lowercase `snake_case` event names and stable parameter names. Events should describe meaningful product actions, not clicks on particular CSS elements.

| Event | When to send | Safe parameters |
| --- | --- | --- |
| `lesson_view` | A valid lesson is opened | `lesson_category`, `lesson_topic` |
| `lesson_start_visualization` | A lesson opens in the workspace | `lesson_category`, `lesson_topic` |
| `algorithm_search` | A search is submitted or meaningfully debounced | `result_count`, `search_surface` |
| `algorithm_filter` | Library filters change | `category`, `difficulty`, `result_count` |
| `workspace_run` | A trace request completes | `workspace_type`, `success`, `step_count_bucket` |
| `workspace_save` | Code is saved successfully | `workspace_type` |
| `algorithm_complete` | An algorithm or lesson is completed | `completion_type` |
| `auth_start` | Login, sign-up, OAuth, or recovery begins | `method`, `auth_action` |
| `auth_result` | An auth flow succeeds or fails | `method`, `auth_action`, `success` |
| `feedback_submit` | Feedback is accepted by Supabase | `message_length_bucket` |

Avoid high-cardinality parameters such as search text, user-entered titles, UUIDs, email addresses, code content, exception messages, or full URLs containing identifiers. Bucket values where practical, such as `0`, `1_10`, `11_50`, and `51_plus`.

### Dashboard tracking

`ProfilePage` is one route with multiple in-place views. Track view changes as virtual screen views or a single `dashboard_view_change` event, but do not pretend that every sidebar click is a new URL. The only recommended parameter is:

```text
view: dashboard | library | workspace | leaderboard | feedback
```

The persisted `codeanim_current_view` value is UI state, not an analytics identity. Do not include `localStorage` or `sessionStorage` contents in events.

### Consent and privacy

- Load GA4 only after analytics consent where consent is required.
- Default to analytics disabled when consent state is unknown.
- Provide a way to withdraw consent and stop future collection.
- Configure GA4 data retention and Google Signals according to the product privacy policy.
- Keep authentication, learning progress, and security logs in Supabase; GA4 is for aggregate product analytics.
- Never use analytics events to authorize actions or enforce execution limits.

### Validation checklist

Before enabling GA4 in production:

1. Confirm direct navigation and client-side navigation each produce one page view, not duplicates.
2. Confirm `/profile` does not send email, UUIDs, code, feedback, or Supabase tokens.
3. Test login, sign-up, recovery, lesson visualization, workspace execution, save, completion, and feedback events.
4. Inspect events with GA4 DebugView in development or staging.
5. Test with the measurement ID absent and with analytics consent denied; the app must continue working.
6. Add automated tests around event names and parameter sanitization before expanding the vocabulary.

## Key modules

| Module | Responsibility |
| --- | --- |
| `src/App.jsx` | Providers, route table, session guard, streak initialization, fallback route |
| `src/pages/ProfilePage.jsx` | Authenticated application shell and all dashboard views |
| `src/pages/WorkspacePage.jsx` | Editor/visualizer workspace, metadata, and algorithm preset loading |
| `src/components/Editor.jsx` | Code editing surface |
| `src/components/Visualizer.jsx` | Algorithm execution visualization |
| `src/data/algorithmsData.js` | Algorithm records, code, categories, difficulty, and complexity metadata |
| `src/data/lessonsData.js` | Lesson records, topics, content, and SEO descriptions |
| `src/context/AuthContext.jsx` | Supabase auth state and modal state |
| `src/context/ThemeContext.jsx` | Theme selection and persistence |
| `src/hooks/useLearningTracker.js` | Active learning-time measurement and sync |

## Local development

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local development URL in the terminal. The app can run with missing Supabase variables, but authentication and dashboard data require valid environment values.

## Build and validation

```bash
npm run lint
npm run build
npm run preview
```

Run lint after JSX or hook changes. Run the production build before deployment to catch import, routing, and bundling problems.

## Adding a feature

1. Decide whether the feature belongs to the public SEO surface or the authenticated dashboard.
2. For a public concept, add or update a stable route, rendered descriptive content, metadata, and internal links.
3. For an authenticated workflow, add a `currentView` branch and sidebar action in `ProfilePage` unless the feature truly needs its own URL.
4. Reuse `AuthContext`, `ThemeContext`, `ALGORITHMS_DATABASE`, and `LESSONS_DATABASE` instead of introducing parallel sources of truth.
5. Keep Supabase reads and writes close to the page or hook that owns the behavior, and update the dashboard cache when a mutation changes displayed data.
6. Run `npm run lint` and `npm run build` before opening a pull request.
