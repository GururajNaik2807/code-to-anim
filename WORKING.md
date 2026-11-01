# How CodeToAnim Works

This guide explains the application from the first browser load to code execution, visualization, authentication, and progress tracking. It is written for contributors and for anyone adapting CodeToAnim into another product.

Created by **Gururaj Naik**.

> **Security limitation:** The trace backend executes user-submitted Python. It is an educational implementation, not a production sandbox. Anyone using it for a product must replace or harden the execution layer with Docker or equivalent isolation, strict resource limits, authentication, rate limiting, and monitoring. See [SECURITY.md](SECURITY.md).

## The Big Picture

```mermaid
flowchart TD
    Browser[Browser] --> Entry[frontend/src/main.jsx]
    Entry --> App[App.jsx]
    App --> Providers[AuthProvider + ThemeProvider + Router]
    Providers --> Tracking[RouteTracker + GlobalTracker]
    Providers --> Routes{Route selected}

    Routes --> Public[Public learning pages]
    Routes --> Workspace[WorkspacePage]
    Routes --> Profile[Authenticated ProfilePage]
    Routes --> NotFound[Not found page]

    Public --> Catalog[Local lesson and algorithm data]
    Public --> Supabase[(Supabase)]
    Workspace --> Editor[Editor.jsx]
    Workspace --> API[FastAPI POST /api/trace]
    API --> Trace[Trace and layout engine]
    Trace --> Visualizer[Visualizer.jsx]
    Profile --> Dashboard[Dashboard views]
    Dashboard --> Supabase
```

The frontend owns the user experience and local catalogs. Supabase owns authentication and persisted user data. The FastAPI backend receives code and returns trace steps. The visualizer turns those steps into animated arrays, stacks, queues, linked lists, trees, graphs, and variable views.

## Startup Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant M as main.jsx
    participant A as App.jsx
    participant S as Supabase Auth
    participant R as React Router

    B->>M: Load the Vite entry module
    M->>A: Render App inside StrictMode
    A->>S: getSession()
    A->>S: onAuthStateChange()
    A->>R: Register public and profile routes
    R-->>B: Render the matching page
    A->>A: Start route analytics and learning tracker
```

### What happens at startup

1. Vite loads `frontend/src/main.jsx`.
2. React renders `App`.
3. `App` mounts `HelmetProvider`, `AuthProvider`, `ThemeProvider`, and `BrowserRouter`.
4. Supabase restores any existing session and listens for sign-in or sign-out changes.
5. The theme provider restores `light`, `dark`, or `coffee` from browser storage.
6. React Router renders the page for the current URL.
7. `RouteTracker` observes route changes. `useLearningTracker` measures active signed-in learning time.

## Visitor Learning Flow

```mermaid
flowchart LR
    Start[Open CodeToAnim] --> Landing[Landing page]
    Landing --> Learn[Learn hub]
    Landing --> Library[Algorithm library]
    Landing --> Direct[Workspace]

    Learn --> Lesson[Lesson page]
    Library --> Algorithm[Algorithm details]
    Lesson --> Direct
    Algorithm --> Direct

    Direct --> Preset{Preset selected?}
    Preset -->|Yes| Load[Load local code and metadata]
    Preset -->|No| Default[Load default Bubble Sort example]
    Load --> Edit[Editor]
    Default --> Edit
    Edit --> Run[Run trace]
```

Public content is primarily local and route-driven:

- Lessons come from `frontend/src/data/lessonsData.js`.
- Algorithms come from `frontend/src/data/algorithmsData.js`.
- LeetCode practice content comes from `frontend/src/data/leetcodeData.js`.
- A lesson or algorithm can open the workspace with code and metadata in router state or query parameters.

Guests can view public content and run within the frontend's guest limits. Direct code editing, saving, progress, and other account features require authentication.

## Authentication Flow

```mermaid
flowchart TD
    Open[User opens login modal] --> Choice{Choose action}
    Choice --> Login[Email and password login]
    Choice --> Signup[Create account]
    Choice --> OAuth[GitHub or Google OAuth]
    Choice --> Forgot[Password recovery]

    Login --> SupabaseAuth[Supabase Auth]
    Signup --> SupabaseAuth
    OAuth --> SupabaseAuth
    Forgot --> SupabaseAuth

    SupabaseAuth --> Result{Session available?}
    Result -->|Yes| Context[AuthContext stores user]
    Result -->|Email verification needed| Verify[User verifies email]
    Verify --> Context
    Context --> Profile[/profile]
    Result -->|Error| Message[Human-readable auth error]
```

`AuthContext` is the frontend source of truth for the current user. `App` also keeps a session guard for `/profile`. A signed-in session enables dashboard data, code saving, completion tracking, and learning-time tracking.

## Workspace Execution Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as Editor.jsx
    participant W as WorkspacePage.jsx
    participant API as FastAPI /api/trace
    participant T as run_trace_worker
    participant V as Visualizer.jsx

    U->>E: Edit or select Python code
    E->>W: Update code state
    U->>W: Click Run
    W->>W: Check code length and guest/account limits
    W->>API: POST { code }
    API->>API: Reject empty or oversized input
    API->>T: Execute with tracing limits
    T->>T: Capture lines, variables, output, and layout
    T-->>API: TraceResponse
    API-->>W: success, steps, or error
    W->>V: Store steps and select first step
    V->>V: Render current layout
    U->>V: Play, pause, step, or change speed
```

### Trace response shape

Each successful trace returns an ordered `steps` array. A step contains:

- `step`: sequence number
- `line`: source line being traced
- `variables`: JSON-safe visible variables
- `output`: captured standard output
- `visual_layout`: detected structure for the visualizer

The backend currently limits execution time, trace steps, output size, and code length. These limits reduce accidental abuse but do not provide container-level security.

## How Visualization Works

```mermaid
flowchart TD
    Vars[Python locals at a trace line] --> Safe[make_json_safe]
    Safe --> Detect[generate_visual_layout]
    Detect --> Kind{Detected structure}
    Kind --> Array[Array, stack, or queue]
    Kind --> Linked[Linked list]
    Kind --> Tree[Tree with nodes and edges]
    Kind --> Graph[Graph or matrix]
    Kind --> Dict[Dictionary]
    Kind --> None[No visual structure]

    Array --> Step[Trace step]
    Linked --> Step
    Tree --> Step
    Graph --> Step
    Dict --> Step
    None --> Step
    Step --> React[React state in WorkspacePage]
    React --> Animate[Framer Motion and Visualizer layout]
```

`backend/main.py` detects common data structures from the traced variables. `frontend/src/components/Visualizer.jsx` chooses the matching renderer and uses Framer Motion for transitions. The current step is controlled by `WorkspacePage` through `currentStepIndex`.

## Signed-In Progress Flow

```mermaid
flowchart TD
    Session[Signed-in session] --> Profile[ProfilePage]
    Profile --> Payload[get_user_dashboard_payload RPC]
    Payload --> Data[Profile, saved code, activity, progress, leaderboard]
    Data --> Views[Dashboard, library, workspace, leaderboard, feedback]

    Workspace[Workspace action] --> Execution[log_user_execution RPC]
    Workspace --> Complete[mark_algorithm_complete RPC]
    Workspace --> Save[save_user_code RPC]
    Session --> Time[useLearningTracker]
    Time --> Learning[increment_learning_time RPC]
    Session --> Streak[Daily session]
    Streak --> Update[update_user_streak RPC]

    Execution --> Supabase[(Supabase)]
    Complete --> Supabase
    Save --> Supabase
    Learning --> Supabase
    Update --> Supabase
```

Supabase RPCs and table policies are part of the deployment contract. The frontend calls them, but authorization must be enforced by Supabase Row Level Security and server-side function checks, not by hidden UI controls.

## Route Responsibilities

| Route | Owner | Purpose |
| --- | --- | --- |
| `/` | `LandingPage` | Entry point and animated product demo |
| `/learn` | `LearnHub` | Browse lessons |
| `/learn/:category/:topic` | `LessonPage` | Read a lesson and open practice |
| `/algorithms` | `AlgorithmLibrary` | Search and filter algorithms |
| `/leetcode` | `LeetcodeProblems` | Browse practice problems |
| `/workspace` | `WorkspacePage` | Edit, execute, and visualize code |
| `/profile` | `ProfilePage` | Authenticated dashboard shell |
| `/p/:userId` | `PublicProfileCard` | Read-only public profile |
| `/leaderboard` | `Leaderboard` | Public learning rankings |
| `/reset-password` | `ResetPassword` | Complete password recovery |

## Important Modules

| Module | Responsibility |
| --- | --- |
| `frontend/src/main.jsx` | Browser entry point |
| `frontend/src/App.jsx` | Providers, auth bootstrap, routes, trackers |
| `frontend/src/context/AuthContext.jsx` | Supabase session and auth modal state |
| `frontend/src/context/ThemeContext.jsx` | Theme selection and browser persistence |
| `frontend/src/pages/WorkspacePage.jsx` | Workspace state, limits, API calls, playback |
| `frontend/src/components/Editor.jsx` | Code editing and keyboard history |
| `frontend/src/components/Visualizer.jsx` | Animated structure and variable rendering |
| `frontend/src/data/` | Local educational catalogs |
| `frontend/src/hooks/useLearningTracker.js` | Active learning-time synchronization |
| `backend/main.py` | Trace API, execution limits, and layout detection |

## Configuration and Deployment Boundaries

- Frontend configuration uses `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`.
- Backend CORS uses `CODETOANIM_ALLOWED_ORIGINS`.
- `frontend/vercel.json` rewrites client routes to `index.html`.
- `backend/vercel.json` routes API requests to FastAPI on Vercel.
- `.env` files are local configuration and must never be committed.

The frontend can be deployed separately from the backend. For a real public product, place the trace service behind an isolated execution system and keep production database credentials away from the code runner.

## A Contributor's Fast Path

1. Start at `frontend/src/main.jsx` and `frontend/src/App.jsx`.
2. Follow the route into the page that owns the behavior.
3. Follow shared state through `AuthContext`, `ThemeContext`, or the owning hook.
4. For execution, follow `WorkspacePage` to `backend/main.py` and back to `Visualizer`.
5. Keep static educational content in `frontend/src/data/`.
6. Run the frontend lint/build checks and backend syntax check before opening a pull request.

For project setup, see [README.md](README.md). For contribution rules, see [CONTRIBUTING.md](CONTRIBUTING.md). For known security limitations, see [SECURITY.md](SECURITY.md).
