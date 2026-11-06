# EngFlex Backend

The Express API serves the web and Android clients. It verifies Firebase ID tokens, stores application data in PostgreSQL, and integrates pronunciation assessment, vocabulary translation, caching, and live chat.

[Project overview](../README.md) · [Web guide](../frontend/README.md) · [Android guide](../mobile/README.md)

## Stack and structure

The backend uses CommonJS JavaScript, Express 5, `pg`, Firebase Admin, Azure Speech SDK, Multer, Redis, Pusher, and Swagger UI. The OpenAI JavaScript client connects to DeepSeek for vocabulary translation.

```text
Backend/
├── index.js                 Express setup and route registration
├── routes/                  HTTP routes and Swagger annotations
├── middlewares/             Authentication, roles, and error handling
├── controllers/             Request validation and HTTP responses
├── services/                Business logic and SQL queries
├── db/                      PostgreSQL pool and Redis connection
├── firebase/                Firebase Admin initialization
├── migrations/              Versioned SQL changes
├── scripts/run-migrations.js
├── config/swagger.js        OpenAPI configuration
└── utils/                   Response, caching, and other helpers
```

Requests flow through routes and middleware to controllers and services. Services query PostgreSQL directly; there is no ORM layer.

## Prerequisites

- Node.js and npm. To use the same runtime for the web app, use a version satisfying its locked requirement of Node.js 20.9.0 or later.
- PostgreSQL; the included Compose configuration uses PostgreSQL 15.
- A Firebase project with Admin credentials. Enable Email/Password authentication for email-based login.
- Redis for the caching path; Compose supplies Redis 7.
- Azure Speech credentials for pronunciation, DeepSeek credentials for AI translation, and Pusher credentials for live chat, as needed.

Run the commands below from `Backend/`. The repository includes a package lock, so use `npm ci` for reproducible dependency installation.

## Configuration

Create `.env` in this directory. There is no checked-in `.env.example`. For a backend running on the host with PostgreSQL and Redis supplied by Compose:

```dotenv
PORT=8000
DB_HOST=localhost
DB_PORT=5430
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=engflix
REDIS_URL=redis://localhost:6379
FIREBASE_WEB_API_KEY=your-firebase-web-api-key
```

These database credentials match the included local Compose service. Supply Firebase Admin credentials using one of the methods below before starting the API. Add feature-specific variables only when configuring those integrations.

### Database and server variables

| Variable | Behavior |
| --- | --- |
| `PORT` | Express port; defaults to `3000`. Use `8000` for the host workflow in these guides. |
| `DATABASE_URL` | PostgreSQL connection string. Takes precedence over every `DB_*` setting. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Separate connection settings used when `DATABASE_URL` is absent. |
| `REDIS_URL` | Defaults to `redis://localhost:6379`; use `redis://redis:6379` inside Compose. |
| `FIREBASE_WEB_API_KEY` | Firebase Web API key for the backend email/password login endpoint. `FIREBASE_API_KEY` is accepted as a fallback. |

For a local database installed outside Docker, replace `DB_PORT=5430` with its actual port, commonly `5432`. The database pool enables its SSL configuration when a connection string contains `sslmode=require` or the database host uses `neon.tech`.

### Firebase Admin credentials

The initialization code checks the following sources in order:

1. `FIREBASE_SERVICE_ACCOUNT`: the entire service account JSON encoded as one environment variable.
2. `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`: individual fields. Literal `\n` sequences in the private key are converted to newlines. Optional fields are `FIREBASE_PRIVATE_KEY_ID`, `FIREBASE_CLIENT_ID`, and `FIREBASE_CLIENT_X509_CERT_URL`.
3. A local `Backend/serviceAccountKey.json` file, which is gitignored.

For local development, placing your downloaded Admin service account file at `Backend/serviceAccountKey.json` is the simplest file-based setup. The API fails during initialization if no valid credentials are available. The Admin account must belong to the same Firebase project as the clients.

### Feature integrations

| Variables | Used for | Behavior without configuration |
| --- | --- | --- |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | Azure pronunciation assessment | Assessment requires valid credentials. |
| `DEEPSEEK_API_KEY` | AI vocabulary translation in `services/translationService.js` | Returns placeholder vocabulary information. |
| `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` | Live chat events | Messages can still be stored and fetched, but live events are not sent. |
| `FRONTEND_REVALIDATE_URL`, `CACHE_REVALIDATE_SECRET` | Invalidate the web app's tagged cache after content changes | Callback is skipped when either value is absent. |

For local cache invalidation, use `FRONTEND_REVALIDATE_URL=http://localhost:3000/api/cache/revalidate` and set the same `CACHE_REVALIDATE_SECRET` in the frontend. A containerized backend needs a URL reachable from inside its container.

Keep Admin credentials and third-party secrets out of Git and client-side configuration.

## Start locally

### Option A: Run Node.js on the host

With `.env` and Firebase credentials ready:

```sh
docker compose up -d db redis
npm ci
npm run migrate
npm run dev
```

This starts the database and cache in containers and the API on the host. With `PORT=8000`, visit [Swagger UI](http://localhost:8000/api-docs).

### Option B: Run the full Compose stack

The existing Compose file starts PostgreSQL, Redis, and the backend:

```sh
docker compose up --build -d
docker compose exec backend npm run migrate
docker compose logs -f backend
```

| Service | Container port | Host port |
| --- | --- | --- |
| Backend | 3000 | 3000 |
| PostgreSQL | 5432 | 5430 |
| Redis | 6379 | 6379 |

Compose mounts this directory into `/app`, so the backend can read `.env` and the local service account file there. Explicit Compose environment values override matching `.env` values, including `PORT=3000` and `DB_HOST=db`. An existing `DATABASE_URL` still takes precedence in the application; omit it when using the Compose database.

The Dockerfile currently uses `node:18-alpine` and runs the Nodemon development command. It is a development setup; its runtime differs from the web app's requirement.

To run the web app alongside this stack, set `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1` and start Next.js with `npm run dev -- --port 3001`. Set the revalidation callback to the web app's reachable address if using it.

Swagger UI is available at `http://localhost:3000/api-docs` in this mode, but its configured request server is still `http://localhost:8000` in `config/swagger.js`. Adjust that configuration before using Swagger's request execution against the Compose API.

Stop containers without deleting database volumes:

```sh
docker compose down
```

## Database migrations

```sh
npm run migrate
```

The runner sorts `.sql` files by full filename, executes each pending file in a transaction, and records it in `schema_migrations`. Applied filenames are skipped on later runs. Both files beginning with `013_` are separate migrations and must be retained.

Review migrations before applying them to an existing database. In particular, migration `014_fix_system_audit.sql` migrates legacy bookmarks, drops the old table, and removes duplicate vocabulary items.

The runner currently logs failures and exits without reliably reporting a nonzero exit status. Read its output and inspect `schema_migrations` rather than treating a successful shell exit as proof that all migrations ran. There is no dedicated seed or rollback command.

## API usage

The base path is `/api/v1`. Open `/api-docs` for endpoint parameters, request bodies, and response schemas; route annotations live in `routes/`.

| Route group | Purpose |
| --- | --- |
| `/auth` | Login, profile synchronization, and profile updates |
| `/topics`, `/categories`, `/lessons`, `/transcripts` | Browse content and load study data |
| `/transcript-bookmarks`, `/transcript-progress`, `/learning-history` | Notes, completion records, and learning history |
| `/dictation-status`, `/shadowing-status`, `/progress` | Exercise completion and progress summaries |
| `/vocabulary-categories`, `/vocabulary-decks` | Vocabulary organization, deck contents, and review operations |
| `/pronunciation-attempts`, `/pronunciation` | Audio assessment, attempts, and pronunciation progress |
| `/chat`, `/friendships`, `/posts` | Community messages, friendships, posts, likes, and comments |
| `/admin` | Role-protected dashboard and content management |

These are route prefixes, not a list of identical CRUD operations. Check Swagger or the route source for supported methods and access requirements.

### Authentication

1. Sign in through a client or the backend login endpoint.
2. Obtain a Firebase **ID token**.
3. Synchronize the profile using `POST /api/v1/auth/sync`.
4. Send protected requests with `Authorization: Bearer <ID_TOKEN>`.

In Swagger's **Authorize** dialog, paste only the ID token; Swagger adds the Bearer prefix. A refresh token cannot be used as an API bearer token. Administrative routes additionally check the user's role.

### Pronunciation uploads

Send `multipart/form-data` to `POST /api/v1/pronunciation-attempts` with:

| Field | Value |
| --- | --- |
| `audio` | WAV file with MIME type `audio/wav` or `audio/x-wav` |
| `referenceText` | Text the learner should read |
| `lessonId` | Lesson identifier |
| `transcriptId` | Transcript identifier |

Clients record mono, 16-bit PCM WAV audio at 16 kHz. Multer stages uploads in an `audio` directory under the operating system's temporary directory. The separately mounted `/uploads` static path is not the pronunciation upload destination.

## Commands and verification

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies |
| `npm run dev` | Start the API with Nodemon |
| `npm run migrate` | Apply pending SQL migrations |
| `node index.js` | Start the API directly without Nodemon |

No `start`, `test`, or `lint` npm script is defined. `test.js` is a standalone DeepSeek experiment, not an automated test suite.

For a smoke check, verify the migration log, load Swagger, fetch public lesson/category data, sign in and synchronize a profile, then check a protected endpoint. Test assessment, translation, and live chat separately when their credentials are configured.

## Deployment notes

`vercel.json` routes requests to the exported Express application. `index.js` skips `app.listen` when `VERCEL` is set. Configure database access, Firebase Admin credentials, and the required integration variables in the deployment environment. Run migrations as a separate operation; API startup does not apply them.

The repository's Docker configuration is designed for development. A production setup needs its own runtime, process command, secret configuration, and persistent external services.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| API fails during Firebase initialization | Supply a valid Admin credential source from the list above. |
| Database connection refused | Use port 5430 from the host for Compose PostgreSQL; inside Compose use `db:5432`. Check whether `DATABASE_URL` overrides your settings. |
| Web and API both try to use port 3000 | Use backend `PORT=8000`, or run the web app on 3001 with the full Compose stack. |
| Missing tables after migration command | Read the logged error and check `schema_migrations`; exit status alone is insufficient. |
| Redis connection errors | Start the Redis service and check `REDIS_URL`; repeated connection errors can appear while Redis is unavailable. |
| Protected endpoint returns 401 | Refresh the Firebase ID token and confirm both sides use the same Firebase project. |
| Live chat does not update | Configure all four backend Pusher variables and matching public frontend values. |
| Translation returns generic text | Check `DEEPSEEK_API_KEY` and the service logs. |
| Pronunciation upload is rejected | Check multipart field names, WAV MIME type, token, and Azure credentials. |
