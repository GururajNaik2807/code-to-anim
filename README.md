# CodeToAnim

CodeToAnim is an open-source learning platform for exploring data structures and algorithms through searchable lessons, executable examples, and step-by-step visualizations.

Created and maintained by **Gururaj Naik**.

## Important Security Limitation

This project is shared as an educational starting point. The backend executes user-submitted Python code and is **not production-secure**. It may be vulnerable to abuse, resource exhaustion, or sandbox escape if exposed carelessly. If you use CodeToAnim in a product, you are responsible for replacing or hardening the execution layer with proper Docker or container isolation, resource limits, authentication, rate limiting, and monitoring before accepting untrusted users.

Please keep this warning with any substantial reuse of the project and give credit to **Gururaj Naik**.

## Project Status

This project is under active development. The frontend is suitable for local exploration and Vercel deployment. The trace backend executes user-submitted Python and must be treated as untrusted-code infrastructure. Do not expose it to the public internet in production until it runs inside a properly isolated, resource-limited sandbox with authentication or abuse controls.

## Features

- Searchable lessons and algorithm catalog
- Interactive Python editor and execution visualizer
- Public learning routes and authenticated progress tracking
- Supabase authentication and persistence
- Optional Google Analytics 4 integration

## Repository Layout

- `frontend/`: React 19 and Vite application
- `backend/`: FastAPI trace API
- `frontend/src/data/`: lesson, algorithm, and LeetCode catalogs
- `frontend/src/components/`: reusable editor and visualization components
- `frontend/src/pages/`: route-level screens

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Python 3.10 or newer
- A Supabase project for authentication and application data

## Local Development

### Frontend

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Set the values in `frontend/.env` before using authentication or dashboard features. The Supabase browser anon key is designed to be public, but it must be protected by correct Supabase Row Level Security policies. Never put a Supabase service-role key in the frontend or commit it to Git.

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:CODETOANIM_ALLOWED_ORIGINS = "http://localhost:5173"
uvicorn main:app --reload --port 8000
```

The frontend uses `VITE_API_BASE_URL` to select the trace API. Set it to `http://127.0.0.1:8000` for local development.

## Validation

```powershell
cd frontend
npm run lint
npm run build
```

```powershell
python -m py_compile backend/main.py
```

The current lint command reports existing issues in parts of the frontend. Treat a clean lint run as a release requirement before publishing a deployment.

## Configuration

Copy the example files and provide values through local environment files or your hosting provider:

- `frontend/.env.example`
- `backend/.env.example`

Environment files are ignored by Git. Review `git diff --cached` and `git status --ignored` before pushing.

## Security and Privacy

Read [SECURITY.md](SECURITY.md) before deploying. In particular:

- The backend runs submitted Python and is not a security boundary.
- Supabase RLS and server-side authorization must protect every administrative operation.
- Analytics must not receive emails, access tokens, UUIDs, saved code, feedback, or arbitrary user input.
- Do not commit credentials, private keys, production dumps, or `.env` files.

Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md), not in a public issue.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Pull requests should explain the change, include focused validation, and avoid unrelated formatting or generated artifacts.

## License

Copyright (c) 2026 Gururaj Naik. Released under the [MIT License](LICENSE).
