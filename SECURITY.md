# Security Policy

## Known Limitation

CodeToAnim is an educational project, not a production security product. The backend executes user-submitted Python code and should be assumed vulnerable if it is exposed directly to untrusted users. Anyone building a product from this repository must replace or harden the execution layer with Docker or equivalent isolation, strict resource limits, authentication, rate limiting, and monitoring before deployment.

## Supported Versions

The default branch is the only actively maintained version.

## Reporting a Vulnerability

Do not open a public issue for a suspected vulnerability. Contact Gururaj Naik privately through the security contact configured on the GitHub repository, or use GitHub's private vulnerability reporting when enabled. Include reproduction steps, affected files or endpoints, impact, and a suggested mitigation when possible.

Do not include real credentials, personal data, or production records in a report.

## Deployment Warnings

The trace API accepts Python source code and executes it. Its restricted builtins, import allowlist, step limit, timeout, and response limits are defense-in-depth only; they are not a proven process or container isolation boundary. Before making the API public, run it in a dedicated sandbox with:

- Strong process or container isolation
- CPU, memory, filesystem, network, and process limits
- Authentication, rate limiting, request quotas, and abuse monitoring
- No production credentials or sensitive network access
- A separate service account and environment from the application database

The frontend admin check is not authorization. Administrative Supabase RPCs and tables must enforce authorization with server-side policies and Row Level Security.

## Secret Handling

Never commit `.env`, service-role keys, database passwords, OAuth client secrets, private keys, access tokens, production exports, or user data. If a secret was ever committed, rotate it even if the file is later deleted.

The Supabase anon key and GA4 measurement ID are public configuration values, not substitutes for access control. Use least-privilege Supabase policies and avoid sending identifiers or user content to analytics.
