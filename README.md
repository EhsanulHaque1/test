# test — Express + vanilla JS demo with CI/CD

A tiny full-stack app used to demonstrate a sensible CI/CD pipeline.

- **Backend** — Express 5, in-memory todo CRUD (`server/`)
- **Frontend** — static HTML/CSS/JS served from the same origin (`public/`)
- **Tests** — Jest + Supertest (`tests/`)
- **Pipeline** — GitHub Actions (`.github/workflows/ci.yml`)

## Run locally

```bash
npm ci
npm run dev     # http://localhost:3000
npm test        # Jest with coverage
npm run lint    # ESLint
```

## API

| Method | Path              | Description         |
| ------ | ----------------- | ------------------- |
| GET    | `/api/health`     | Liveness probe      |
| GET    | `/api/todos`      | List todos          |
| POST   | `/api/todos`      | Create `{title}`    |
| PATCH  | `/api/todos/:id`  | Update `title`/`done` |
| DELETE | `/api/todos/:id`  | Delete              |

## What the CI/CD pipeline does

The workflow runs on every push/PR to `main` and has five jobs:

| Job            | Purpose                                                                        | When                                    |
| -------------- | ------------------------------------------------------------------------------ | --------------------------------------- |
| `lint`         | ESLint — fail fast on style/syntax                                             | every push & PR                         |
| `test`         | Jest + Supertest on a Node **20 / 22** matrix, uploads coverage artifact       | every push & PR                         |
| `audit`        | `npm audit --omit=dev --audit-level=high` — block on known prod vulns          | every push & PR                         |
| `build-image`  | Multi-stage Docker build, pushed to **GHCR** tagged `latest` and `sha-<sha>`   | push to `main` only, after the 3 checks |
| `deploy`       | Placeholder deploy step, gated by the `production` GitHub Environment          | push to `main`, after `build-image`     |

Extras baked in:
- `concurrency` cancels superseded runs on the same branch → saves CI minutes.
- Least-privilege `permissions:` on each job; only `build-image` gets `packages: write`.
- npm cache via `actions/setup-node` → cold installs ~10s.
- Buildx GHA cache for Docker layers.
- The `production` environment is where you add **required reviewers** for a manual approval gate before deploy.

## Recommended repo settings (one-time)

1. **Branch protection** on `main`: require the `lint`, `test`, `audit` checks + 1 PR review + linear history.
2. **Environments → production**: add required reviewers, and any deploy secrets (e.g. `FLY_API_TOKEN`, `KUBE_CONFIG`).
3. **Dependabot** (`.github/dependabot.yml`) for weekly npm + `github-actions` updates.
4. **Secret scanning** and **push protection** on in Settings → Code security.
5. Optional: **CodeQL** workflow for static analysis, **Renovate** if you want smarter grouping than Dependabot.

## What would be added for a real production app

- Real datastore (Postgres) with migrations run in a pre-deploy step.
- End-to-end tests (Playwright) as a separate job against a preview deploy.
- Semantic versioning + changelog via `release-please` or `changesets`, publishing GitHub Releases.
- Preview environments per PR (Fly.io, Vercel, or a k8s namespace) linked back on the PR.
- Observability: structured logs, OpenTelemetry traces, `/metrics` endpoint scraped by Prometheus.
- SBOM generation (`anchore/sbom-action`) and image signing (`cosign`) after the Docker build.

## Layout

```
.
├── .github/workflows/ci.yml     # CI/CD pipeline
├── Dockerfile                   # Multi-stage runtime image
├── eslint.config.js
├── package.json
├── public/                      # Frontend (served by Express)
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── server/
│   ├── app.js                   # Express app factory (unit-testable)
│   └── index.js                 # HTTP bootstrap
└── tests/
    └── app.test.js              # Jest + Supertest
```
