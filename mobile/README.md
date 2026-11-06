# EngFlex Android Application

The native Android client supports video study, dictation, pronunciation recording, vocabulary review, learning progress, notes, and account settings. It is written in Java and uses XML layouts, Firebase Authentication, and Retrofit to connect to the shared backend.

[Project overview](../README.md) · [Backend guide](../Backend/readme.md) · [Web guide](../frontend/README.md)

## Build configuration

| Setting | Repository value |
| --- | --- |
| Active Gradle module | `:app` |
| Application ID | `com.quanghung.engflix` |
| Java namespace | `com.example.app` |
| Minimum Android API | 24 |
| Compile / target Android API | 36 / 36 |
| Java source / target compatibility | 11 / 11 |
| Android Gradle Plugin | 8.13.2 |
| Gradle wrapper | 8.13 |

Java 11 compatibility describes the application source and bytecode settings. Use JDK 17 to run the Android Gradle build. Use Android Studio with support for the configured Android Gradle Plugin, and install Android SDK Platform 36 through SDK Manager.

The app uses Material Components, Navigation, ViewPager2, View Binding, LiveData/ViewModel libraries, Retrofit 2, OkHttp 4, Gson, Firebase Auth, and a YouTube WebView player. Dependency declarations are in [app/build.gradle.kts](app/build.gradle.kts) and [gradle/libs.versions.toml](gradle/libs.versions.toml).

## Prerequisites

- Android Studio, JDK 17, and Android SDK Platform 36.
- An emulator or Android device running API 24 or later.
- A running [backend](../Backend/readme.md) with database migrations applied.
- A Firebase Android app registered as `com.quanghung.engflix` in the same Firebase project used by the backend.
- Email/Password authentication enabled in Firebase.

The application ID and Java namespace are different. Register the **application ID** in Firebase.

## Configuration

### 1. Open the Gradle project

In Android Studio, choose **File > Open** and select the `mobile/` directory. Only `:app` is included by [settings.gradle.kts](settings.gradle.kts). The top-level `core/` and `feature/` directories contain legacy placeholder code outside the active Gradle module.

### 2. Create local.properties

Create `mobile/local.properties` and set:

```properties
sdk.dir=C:/Users/YOUR_USER/AppData/Local/Android/Sdk
FIREBASE_API_KEY=your-firebase-web-api-key
BASE_URL=http://10.0.2.2:8000/api/v1/
```

Replace the SDK path with your installation directory; Android Studio may generate it automatically. Forward slashes work for the Windows example above. On macOS or Linux, use the actual absolute SDK path for that machine.

| Property | Purpose |
| --- | --- |
| `sdk.dir` | Local Android SDK location. |
| `FIREBASE_API_KEY` | Compiled into `BuildConfig.FIREBASE_API_KEY`; supply the key for your Firebase project. Firebase SDK initialization also uses `google-services.json`. |
| `BASE_URL` | Compiled into `BuildConfig.BASE_URL` and used by Retrofit. Include `/api/v1/` and the final slash. |

These are build-time properties. Rebuild and reinstall after changing them. The Gradle file does not provide useful defaults for missing API properties, so populate them before building.

### 3. Supply Firebase client configuration

Place the Firebase Android configuration at `mobile/app/google-services.json`, matching application ID `com.quanghung.engflix`. A file is already present in the repository; replace it with the configuration for your own Firebase project when using your own backend credentials.

`google-services.json` is Android client configuration. Never put a Firebase Admin service account file or backend integration secrets in the Android app. `local.properties` is gitignored; `app/google-services.json` is currently tracked.

### 4. Choose the backend address

| Device or setup | Example `BASE_URL` |
| --- | --- |
| Standard Android emulator; host backend on 8000 | `http://10.0.2.2:8000/api/v1/` |
| Standard Android emulator; full Compose backend on 3000 | `http://10.0.2.2:3000/api/v1/` |
| Physical device on the same network | `http://YOUR_COMPUTER_LAN_IP:8000/api/v1/` |
| Deployed backend | `https://YOUR_API_HOST/api/v1/` |

On an emulator or physical device, `localhost` refers to that device. The standard emulator uses `10.0.2.2` to reach the development computer. For a physical device, use the computer's LAN address and allow inbound traffic to the backend port through the computer's firewall.

The current [AndroidManifest.xml](app/src/main/AndroidManifest.xml) permits cleartext HTTP for development. Use an HTTPS API address for a deployed environment.

## Run and build

Sync the project with Gradle, select an emulator or device, and run the `app` configuration in Android Studio.

For command-line builds, run from `mobile/`. On Windows PowerShell:

```powershell
.\gradlew.bat assembleDebug
```

On macOS or Linux:

```sh
./gradlew assembleDebug
```

The debug APK is written to `app/build/outputs/apk/debug/app-debug.apk`. To install it on a connected device:

```sh
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Source structure

```text
mobile/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/example/app/
│       │   ├── MainActivity.java
│       │   ├── adapter/             List and exercise adapters
│       │   ├── core/                Shared UI classes
│       │   ├── data/
│       │   │   ├── local/           TokenManager
│       │   │   ├── remote/          Retrofit, APIs, models, interceptors
│       │   │   └── repository/      Data access and authentication flows
│       │   ├── diaglog/             Dialog classes (existing folder spelling)
│       │   ├── feature/             Auth, study, vocabulary, notes, progress, settings
│       │   └── utils/               Constants and YouTube WebView helpers
│       └── res/                    XML layouts, resources, and navigation
├── gradle/                         Wrapper and dependency version catalog
├── build.gradle.kts
└── settings.gradle.kts
```

Features are organized around Fragments, adapters, repositories, and Retrofit APIs. ViewModel/LiveData support is available, but the source also includes direct Fragment-to-repository calls; it is not a uniform MVVM implementation.

## System integration

### Authentication

`AuthRepository` signs users in through Firebase Auth, obtains an ID token, saves it through `TokenManager`, and synchronizes the profile with the backend. A successful Firebase sign-in still needs the backend synchronization step to succeed.

`AuthInterceptor` attaches `Authorization: Bearer <ID_TOKEN>` to backend requests. When a Firebase user session is available, it asks Firebase for a current token; otherwise it can fall back to the locally stored token. `TokenManager` uses SharedPreferences. Application data is stored by the backend in PostgreSQL; the app has no configured Room or SQLite data layer.

### Study and pronunciation

The study flow plays YouTube video segments in a WebView and uses timed transcripts for listening and dictation. Pronunciation recording lives in `ListeningFragment`: it captures mono, 16-bit PCM at 16 kHz, wraps it in a WAV header, and submits it through the pronunciation API.

Grant microphone permission when prompted. The backend requires Azure Speech configuration to return pronunciation scores. Do not add Azure credentials to the mobile build.

### API interfaces

Interfaces under `app/src/main/java/com/example/app/data/remote/api/` cover authentication, user profiles, lessons, categories, transcripts, bookmarks, progress, vocabulary, and pronunciation. `RetrofitClient` configures the shared client and its interceptors.

Community and chat features documented for the web/API are not presented as equivalent Android features. Check the active `app/` implementation when extending mobile coverage.

## Checks and release builds

Run the available checks from `mobile/`:

| Task | Windows PowerShell command | Purpose |
| --- | --- | --- |
| Debug APK | `.\gradlew.bat assembleDebug` | Compile a development build |
| Unit tests | `.\gradlew.bat testDebugUnitTest` | Run local debug unit tests |
| Android lint | `.\gradlew.bat lintDebug` | Run Android static checks |
| Instrumented tests | `.\gradlew.bat connectedDebugAndroidTest` | Run tests on a connected emulator/device |
| Release APK | `.\gradlew.bat assembleRelease` | Build a release variant |

On macOS/Linux, replace `.\gradlew.bat` with `./gradlew`. Tests currently consist of the standard example unit and instrumented tests; they do not verify the learning or authentication flows.

A smoke check should cover sign-in and profile sync, loading a lesson, video playback, dictation, saving a note, and reading saved progress. Test audio recording with microphone permission and a configured assessment backend.

Release signing is not configured in `app/build.gradle.kts`. Configure a signing key before distributing a release; keep the keystore and its passwords outside source control. The current release build has minification disabled.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Gradle fails before compilation | Check the Gradle JDK, installed SDK Platform 36, network access, and the repository's wrapper/plugin versions. |
| Retrofit rejects the base URL | Set `BASE_URL` to an absolute URL ending in `/api/v1/`, then rebuild. |
| Connection refused or timeout | Start the backend, verify its port, and use the correct emulator or LAN address. Check the host firewall for physical devices. |
| Firebase initialization or sign-in fails | Match `google-services.json` to the application ID and backend Firebase project; enable Email/Password auth. |
| Login succeeds in Firebase but the app reports an error | Check `/auth/sync`, database migrations, and backend logs. |
| Protected requests return 401 | Sign in again and check token validity and Firebase project alignment. |
| Recording fails or has no audio | Grant microphone permission and confirm the emulator/device has a working audio input. |
| Recording uploads but no score is returned | Check WAV upload requirements and backend Azure credentials. |
| Edits under top-level `feature/` do not appear | Implement the change under `app/src/main/`; only `:app` is built. |

## Contributing

Place new screens under the active `app/src/main/java/com/example/app/feature/` tree, update the navigation resources when needed, and reuse the existing repositories and Retrofit interfaces. Release WebView and recording resources with the Fragment lifecycle. Build the debug variant and manually verify the changed flow before submitting a change.
