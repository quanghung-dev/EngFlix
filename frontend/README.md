# EngFlex Web Application

The Next.js application provides the browser interface for video learning, dictation, shadowing, vocabulary review, progress tracking, and community features. It uses Firebase Authentication and connects to the shared Express API.

[Project overview](../README.md) · [Backend guide](../Backend/readme.md) · [Android guide](../mobile/README.md)

## Stack

- Next.js 16.2.10 with the App Router, React 19.2.4, and TypeScript.
- Tailwind CSS 4, shadcn components, Base UI, Motion, and Lucide icons.
- Firebase Authentication and Storage.
- Axios for authenticated browser requests and `fetch` for public server requests.
- TanStack Query and Table, Recharts, and DnD Kit.
- Pusher JS for live chat events.

Dependency versions are defined in [package.json](package.json) and pinned by [package-lock.json](package-lock.json).

## Prerequisites

- Node.js **20.9.0 or later**, as required by the locked Next.js package, and npm.
- A running [backend](../Backend/readme.md) with migrations applied.
- A Firebase project matching the backend's Admin credentials.

Enable Email/Password authentication in Firebase and Google sign-in if using the Google login flow. Add your local or deployed web hostname to the project's authorized authentication domains. Configure Firebase Storage and its rules if testing file uploads.

## Configuration

Create `frontend/.env.local`; no environment template is checked in. Use values from your own Firebase project's web application configuration:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL including `/api/v1`. Defaults to `http://localhost:8000/api/v1`. Use no trailing slash for consistency. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web application API key. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project identifier matching the backend. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Actual bucket name from your Firebase configuration. |
| `NEXT_PUBLIC_PUSHER_KEY` | Optional public Pusher key for live chat. |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Optional Pusher cluster matching the backend. |
| `CACHE_REVALIDATE_SECRET` | Optional server-only secret for the cache revalidation endpoint. Must match the backend value. |

`lib/firebase.ts` contains fallback values for the original Firebase project. Set all four Firebase variables explicitly to use your own project consistently.

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and embedded at build time. Keep Firebase Admin credentials, Azure keys, DeepSeek keys, and the Pusher secret on the backend. Restart the development server after changing `.env.local`; rebuild a deployed app after changing public variables.

## Start locally

Run these commands from `frontend/`:

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep the backend running on port 8000 with the configuration above.

If the backend uses the full Compose stack on port 3000, change the API URL to `http://localhost:3000/api/v1`, then start the web app on port 3001:

```sh
npm run dev -- --port 3001
```

Public server requests and browser requests share `NEXT_PUBLIC_API_URL`. The configured address must be reachable from both the Next.js server and the user's browser; a container-only hostname such as `backend` will not work in a normal browser.

## Application structure

```text
frontend/
├── app/
│   ├── (product)/          Main application pages and shared layout
│   ├── (study)/            Focused lesson and vocabulary quiz screens
│   ├── api/cache/revalidate/  Server endpoint for tagged cache invalidation
│   ├── login/              Sign-in page
│   └── signup/             Registration page
├── components/             Shared and feature-specific UI
├── hooks/                  Reusable React hooks
├── lib/                    API clients, Firebase, auth session, WAV recorder
├── services/               API calls grouped by domain
├── types/                  Shared TypeScript models
└── public/                 Static assets
```

Route groups such as `(product)` and `(study)` organize layouts without adding those names to URLs.

| Route | Purpose |
| --- | --- |
| `/login`, `/signup` | Authentication |
| `/topics`, `/topics/[categoryId]` | Browse topics and lessons |
| `/lessons/[lessonId]/dictation` | Sentence dictation practice |
| `/lessons/[lessonId]/shadowing` | Recording and pronunciation feedback |
| `/vocabulary`, `/vocabulary/quiz` | Vocabulary decks and quizzes |
| `/progress`, `/notes` | Learning records and saved notes |
| `/community`, `/friends`, `/chat` | Posts, friendships, and community chat |
| `/profile/[userId]` | User profiles |
| `/dashboard` | Application dashboard |

Backend administrator APIs are documented separately in the backend guide; their existence does not imply that every administrative operation has a web page.

## How the web app connects to the system

### Authentication and API requests

Firebase handles sign-in. The authentication flow synchronizes the profile with `/api/v1/auth/sync` so PostgreSQL has an application user record.

`lib/api-client.ts` uses `lib/auth-session.ts` to obtain a Firebase ID token for browser requests and attaches it as a Bearer token. Its `apiRequest` helper retries a 401 response once with a forced token refresh when an authenticated session exists.

`lib/public-api.ts` uses `fetch` for public data and supports Next.js cache tags and revalidation options. Domain services in `services/` connect pages to these clients.

### Study and pronunciation

Study pages combine video segments with transcript-based exercises. `lib/wav-recorder.ts` prepares WAV audio for assessment by the backend. Azure credentials stay on the API server. Allow microphone access when prompted; browser recording requires a secure context, such as localhost or HTTPS.

### Live chat

Set `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` to match the backend's Pusher application. The backend stores messages in PostgreSQL and publishes live events through Pusher. Without matching configuration, stored messages and live updates can behave differently.

### Content cache invalidation

The server route `POST /api/cache/revalidate` accepts a Bearer token matching `CACHE_REVALIDATE_SECRET`. To let backend content changes notify it, configure the backend with:

```dotenv
FRONTEND_REVALIDATE_URL=http://localhost:3000/api/cache/revalidate
CACHE_REVALIDATE_SECRET=replace-with-the-same-private-secret-on-both-servers
```

Set that same secret in `frontend/.env.local`. The route accepts `topics`, `categories`, `lessons`, and numeric `category:<id>`, `lesson:<id>`, or `transcripts:<id>` tags. Keep the secret server-only.

## Commands and verification

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run start` | Serve an existing production build |

There is no automated test script in `package.json`. Before submitting a web change, run the checks relevant to it and manually verify the affected flow. For a full smoke check: sign in, browse lessons, open a study page, save progress, and review vocabulary. Test recording and live chat when their backend integrations are configured.

Additional UI guidance is available in [UI_DESIGN_SYSTEM.md](UI_DESIGN_SYSTEM.md).

## Production build

With deployment environment variables configured:

```sh
npm run build
npm run start
```

Use a backend URL reachable by the deployed Next.js server and browsers. Firebase must authorize the deployed web hostname. Public values are fixed at build time, so configure them before building. Update the backend's revalidation URL when the web hostname changes.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| API requests fail | Confirm the backend is running and `NEXT_PUBLIC_API_URL` includes `/api/v1`. Restart Next.js after changing the value. |
| Port 3000 is already in use | Move the host backend to 8000, or start Next.js on 3001 for the full Compose workflow. |
| Login works but protected requests return 401 | Confirm the web and backend Firebase projects match; check token refresh and backend logs. |
| Firebase reports an unauthorized domain | Add the web hostname to Firebase Authentication's authorized domains. |
| Catalog is empty | Check the database for lesson/category content; migrations do not provide a dedicated content-seeding workflow. |
| Microphone recording fails | Use localhost or HTTPS and allow microphone permission. |
| Avatar or file upload fails | Check the Firebase Storage bucket and access rules. |
| Live chat messages appear only after a refresh | Check matching frontend/backend Pusher configuration. |
| Content stays stale after an edit | Check the callback URL, matching revalidation secrets, and accepted cache tags. |
| Build or install fails on an older Node.js version | Check `node --version` against the locked Next.js minimum of 20.9.0. |
