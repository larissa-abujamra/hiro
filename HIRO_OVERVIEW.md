# Hiro — Complete Project Overview

> This document is a comprehensive reference for any AI agent or developer working on this codebase. Keep it updated when major features are added.

---

## What is Hiro?

**Hiro** is an AI-powered clinical assistant (AI Medical Scribe) built for Brazilian doctors. It listens to medical consultations in real time, transcribes the audio, and automatically generates a structured clinical record (prontuário in SOAP format). It also supports digital prescription via Memed integration.

The app is designed to eliminate manual documentation time for physicians — a doctor starts a consultation, speaks normally with their patient, and Hiro handles the entire documentation workflow automatically.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Anthropic Claude · ElevenLabs Scribe · Memed · Vercel

---

## Core User Flow

```
1. Doctor opens Nova Consulta → selects (or creates) a patient → sets reason
2. Navigates to /consulta/[id] → presses the mic button → recording starts
3. ElevenLabs Scribe v2 Realtime transcribes audio in real time (Portuguese)
4. As words come in, two AI hooks fire in parallel:
     · useDetection   → POST /api/detect   → detects prescriptions, exams, referrals, etc.
     · useCidSuggestions → POST /api/cid   → suggests CID-10 diagnostic codes
5. Doctor clicks "Parar e gerar prontuário"
6. POST /api/prontuario → Anthropic Claude generates SOAP note + summary + clinical flags
7. Doctor is redirected to /consulta/[id]/resumo (summary screen)
8. Doctor reviews and edits the SOAP note, sees CID suggestions, flags
9. Doctor clicks "Gerar Prescrição" → Memed loads embedded (token from /api/memed/token)
10. Doctor signs prescription digitally inside Memed
11. Doctor exports PDF (jsPDF narrative clinical report) and/or saves to patient record
12. Saved consultation is added to the patient's history in the store
```

---

## Pages (App Router)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Dashboard home: greeting, today's date, daily metrics card, upcoming patients, quick action links |
| `/consulta/nova` | `app/consulta/nova/page.tsx` | Intake flow: select existing patient or create new one, set consultation reason |
| `/consulta/[id]` | `app/consulta/[id]/page.tsx` | Live consultation: recording, real-time transcription, AI detection panel, generate SOAP |
| `/consulta/[id]/resumo` | `app/consulta/[id]/resumo/page.tsx` | Post-consultation: editable SOAP, CIDs, alerts, Memed prescription, PDF export, save |
| `/pacientes` | `app/pacientes/page.tsx` | Patient list from store |
| `/pacientes/[id]` | `app/pacientes/[id]/page.tsx` | Full patient profile: history, evolution charts (Recharts), exams, medications, CIDs |
| `/perfil` | `app/perfil/page.tsx` | Doctor profile form (persisted to localStorage) — required for Memed |
| `/agenda` | `app/agenda/page.tsx` | Placeholder — agenda feature not yet built |

**Dynamic params** use `params: Promise<{ id }>` (Next.js 15+ App Router style, always `await params`).

---

## API Routes (all server-side, secrets never reach the browser)

### `POST /api/prontuario`
- **Input:** `{ transcription: string, patientContext?: string, confirmedCids?, detectedItems? }`
- **What it does:** Sends the full transcription to Anthropic Claude with a structured medical prompt
- **Output:** `{ soap: { s, o, a, p }, summary: string, flags: string[] }`
- **Guard:** Returns empty SOAP (no error) if `transcription.length < 20` or `ANTHROPIC_API_KEY` missing
- **Model env var:** `ANTHROPIC_PRONTUARIO_MODEL` (default: `claude-haiku-4-5`)

### `POST /api/cid`
- **Input:** `{ lines: string[], patientContext?: string }`
- **What it does:** Asks Claude to suggest CID-10 codes based on transcription lines
- **Output:** `{ suggestions: CidSuggestion[] }` — each has `code`, `name`, `confidence`, `sourceQuote`, `confirmed: false`
- **Model env var:** `ANTHROPIC_CID_MODEL` (default: `claude-haiku-4-5`)

### `POST /api/detect`
- **Input:** `{ text: string, previousLines?: string[], consultationId?: string }`
- **What it does:** Detects clinical action items in the latest speech chunk
- **Output:** `{ items: DetectedItem[] }` — types: `prescription | exam | return | certificate | referral`
- **Model env var:** `ANTHROPIC_DETECT_MODEL` (default: `claude-haiku-4-5`)

### `GET /api/scribe-token`
- **What it does:** Creates a single-use ElevenLabs token for `realtime_scribe` using `@elevenlabs/elevenlabs-js`
- **Output:** `{ token: string }` — expires in 15 minutes, consumed on first use
- **Why server-side:** `ELEVENLABS_API_KEY` must never reach the browser

### `POST /api/memed/token`
- **Input:** `{ nome, sobrenome, cpf, crm, uf, data_nascimento, sexo, email, external_id? }`
- **What it does:** Creates or retrieves the doctor's prescritor record in Memed, returns their auth token for the frontend script
- **Output:** `{ token: string }`
- **Logic:** Tries `memed.prescritor.get(external_id)` first; if 404/422, calls `memed.prescritor.create(...)`. Token is not static — always refreshed from API.
- **Why server-side:** `MEMED_API_KEY` and `MEMED_SECRET_KEY` must never reach the browser

---

## Components

### Layout
| Component | File | Notes |
|-----------|------|-------|
| `SidebarDesktopShell` | `components/layout/SidebarDesktopShell.tsx` | Fixed 220px sidebar, desktop only (`lg:flex`) |
| `Sidebar` | `components/layout/Sidebar.tsx` | Mobile slide-over drawer with hamburger |
| `SidebarNav` | `components/layout/SidebarNav.tsx` | Nav links + doctor profile footer link; reads `useDoctorStore` |
| `DoctorProfileWorkspace` | `components/layout/DoctorProfileWorkspace.tsx` | Doctor profile form (personal + professional data) |

### Dashboard
| Component | File | Notes |
|-----------|------|-------|
| `DailyMetricsCard` | `components/dashboard/DailyMetricsCard.tsx` | Glass card with today's stats (currently hardcoded) |
| `UpcomingPatientsSection` | `components/dashboard/UpcomingPatientsSection.tsx` | Upcoming patient list, links to patient profile |

### Consultation
| Component | File | Notes |
|-----------|------|-------|
| `NewConsultationFlow` | `components/consulta/NewConsultationFlow.tsx` | Intake UI: patient selection/creation + reason |
| `ConsultationWorkspace` | `components/consulta/ConsultationWorkspace.tsx` | Main recording screen — the most complex component |

`ConsultationWorkspace` internals:
- Uses `useTranscription()` hook for ElevenLabs Scribe
- Uses `useDetection()` and `useCidSuggestions()` hooks for real-time AI
- `toggleMainRecording()` — async, fetches Scribe token, connects WebSocket
- `handleStopAndGenerate()` — reads `lines` directly from hook (not store) to avoid async sync race condition, then calls `/api/prontuario`
- `handleCancelConsultation()` — stops recording, calls `resetConsultation()`, navigates to `/consulta/nova`
- Bottom bar is `fixed` with `lg:left-[220px]` to align with sidebar

### Patient
| Component | File | Notes |
|-----------|------|-------|
| `PatientsDashboard` | `components/paciente/PatientsDashboard.tsx` | Grid of patient cards |
| `PatientProfileWorkspace` | `components/paciente/PatientProfileWorkspace.tsx` | Full profile with Recharts metrics, tabs, exam upload |
| `ExamUpload` | `components/paciente/ExamUpload.tsx` | File upload UI (local state only) |
| `ConsultationHistory` | `components/paciente/ConsultationHistory.tsx` | List of past consultations |
| `EvolutionCharts` | `components/paciente/EvolutionCharts.tsx` | Recharts line charts for vitals/metrics |

### Prontuário (SOAP Summary)
| Component | File | Notes |
|-----------|------|-------|
| `GeneratedSummaryWorkspace` | `components/prontuario/GeneratedSummaryWorkspace.tsx` | Post-consultation review screen |
| `MemedPrescription` | `components/prontuario/MemedPrescription.tsx` | Memed embedded prescription widget |

`MemedPrescription` internals:
- Checks `isProfileComplete()` before rendering button — shows link to `/perfil` if incomplete
- Calls `POST /api/memed/token` with profile from `useDoctorStore`
- Injects `<script data-token="..." data-color="#0F6E56">` into document body
- Polls for `window.MdHub` (8s timeout), then calls `MdHub.command.send('plataforma.prescricao', 'openModal')`
- Listens for `prescricaoSalva` event
- Cleans up script + DOM elements on unmount

### UI Primitives
| Component | File |
|-----------|------|
| `ButtonHiro` | `components/ui/ButtonHiro.tsx` — variants: `primary`, `secondary`, `ghost`, `danger` |
| `CardHiro` | `components/ui/CardHiro.tsx` — variants: default glass, active (green) |
| `OverlineLabel` | `components/ui/OverlineLabel.tsx` — small uppercase section label |
| `BadgeStatus` | `components/ui/BadgeStatus.tsx` — status pill |
| `AvatarInitials` | `components/ui/AvatarInitials.tsx` — circle with initials |

---

## Hooks

### `useTranscription` (`hooks/useTranscription.ts`)
Wraps `@elevenlabs/react` `useScribe`. Provides a stable interface so `ConsultationWorkspace` doesn't call ElevenLabs APIs directly.

**Returns:** `{ lines, interimText, isListening, isSupported, error, start, stop, reset, wordCount }`

- `start()` — **async**, fetches `/api/scribe-token`, calls `scribe.connect({ token, microphone: { echoCancellation, noiseSuppression } })`, returns `Promise<boolean>`
- `stop()` — calls `scribe.disconnect()`
- `reset()` — disconnects + clears `committedTranscripts`
- `lines` — mapped from `committedTranscripts` (all `isFinal: true`)
- `interimText` — `partialTranscript` (live, before commit)
- Cleanup: `disconnect()` on unmount via `useEffect`

### `useCidSuggestions` (`hooks/useCidSuggestions.ts`)
- `analyze(allTexts: string[])` — fires only every ~40 new words (debounced by word count)
- Calls `POST /api/cid`, maps response to `CidSuggestion[]`
- Writes to `useConsultationStore` via `setCidSuggestions`

### `useDetection` (`hooks/useDetection.ts`)
- `analyze(text: string, previousLines: string[])` — called on every new final transcription line
- Calls `POST /api/detect`, validates item types
- Writes to `useConsultationStore` via `addDetectedItem` (deduped by `type + sourceQuote`)
- Uses a `processedRef` set to avoid re-processing chunks per consultation

---

## State Management

### `useConsultationStore` (in-memory, no persistence)
Lives in `lib/store.ts`. Manages the entire consultation lifecycle.

**Key state:**
```
patients: Patient[]               ← starts with mockPatients, new patients added here
selectedPatientId: string | null
consultationReason: string
activeConsultationId: string | null
isRecording: boolean
recordingSeconds: number          ← ticked every second via setInterval in ConsultationWorkspace
liveTranscription: TranscriptionLine[]  ← synced from hook via useEffect
cidSuggestions: CidSuggestion[]
detectedItems: DetectedItem[]
generatedSoap: { s, o, a, p } | null
patientSummary: string
flags: string[]
savedSummaries: SavedSummaryEntry[]
newPatientDraft: NewPatientDraft
```

**`resetConsultation()`** — called on cancel or after the flow completes. Resets all consultation fields but preserves `patients` and `savedSummaries`.

### `useDoctorStore` (persisted to localStorage)
Lives in `lib/doctorStore.ts`. Manages the doctor's profile for Memed and PDF.

**Profile fields:** `nome`, `sobrenome`, `cpf`, `crm`, `uf`, `data_nascimento`, `sexo`, `email`, `especialidade`, `clinica`

**`isProfileComplete()`** — returns `true` when the 6 Memed-required fields are non-empty.

---

## Data Types (`lib/types.ts`)

```typescript
Patient {
  id, name, dateOfBirth, sex, height?, weight?, phone?,
  conditions?: string[],
  medications: Medication[],    // { name, dose, status: active|suspended|completed }
  cids: CidEntry[],            // { code, name, firstSeen, lastSeen }
  consultations: Consultation[],
  exams: Exam[],
  metrics: PatientMetrics[]    // { date, systolic?, diastolic?, weight?, glucose? }
}

Consultation {
  id, patientId, date, reason, duration,
  transcription: TranscriptionLine[],
  soap: { s, o, a, p },
  confirmedCids: CidCode[],
  detectedItems: DetectedItem[],
  documents: GeneratedDocument[]
}

DetectedItem {
  id, type: prescription|exam|return|certificate|referral,
  text, sourceQuote, details
}

CidSuggestion {
  code, name, confidence, sourceQuote, confirmed: boolean
}
```

---

## Environment Variables

All secrets are server-side only (no `NEXT_PUBLIC_` prefix).

| Variable | Required | Used in |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | ✅ | All three `/api/` AI routes |
| `ELEVENLABS_API_KEY` | ✅ | `/api/scribe-token` |
| `MEMED_API_KEY` | ✅ for Memed | `/api/memed/token` |
| `MEMED_SECRET_KEY` | ✅ for Memed | `/api/memed/token` |
| `MEMED_API_URL` | optional | documented in `.env.local`, used for reference |
| `MEMED_FRONTEND_URL` | optional | documented in `.env.local`, used for reference |
| `ANTHROPIC_PRONTUARIO_MODEL` | optional | `/api/prontuario` (default: `claude-haiku-4-5`) |
| `ANTHROPIC_CID_MODEL` | optional | `/api/cid` (default: `claude-haiku-4-5`) |
| `ANTHROPIC_DETECT_MODEL` | optional | `/api/detect` (default: `claude-haiku-4-5`) |

---

## Third-Party Integrations

### ElevenLabs Scribe v2 Realtime
- **Package:** `@elevenlabs/react` (hook), `@elevenlabs/elevenlabs-js` (token generation)
- **Flow:** Backend creates single-use token → frontend opens WebSocket to `wss://api.elevenlabs.io`
- **Model:** `scribe_v2_realtime`, language `pt`
- **Events:** `partialTranscript` (live preview), `committedTranscripts` (final lines)
- **Limitations:** Requires paid ElevenLabs plan; "at capacity" errors possible under load

### Anthropic Claude
- **Package:** `@anthropic-ai/sdk`
- **Default model:** `claude-haiku-4-5` for all three endpoints (fast/cheap)
- **Three prompts:**
  1. SOAP generation — detailed medical documentation prompt in Portuguese
  2. CID-10 suggestion — structured JSON with codes and confidence
  3. Item detection — typed clinical action extraction

### Memed (Digital Prescription)
- **Package:** `memed-node` (unofficial Node.js SDK)
- **Environment:** `integration` (test environment URLs auto-resolved by SDK)
- **Auth:** `apiKey` + `secretKey` in headers, never exposed to browser
- **Frontend script:** `sinapse-prescricao.min.js` injected dynamically with `data-token`
- **Required doctor fields:** CPF, CRM, UF, data de nascimento (validated in `/api/memed/token`)

### Vercel Analytics
- **Package:** `@vercel/analytics`
- **Component:** `<Analytics />` in root `app/layout.tsx`
- **Notes:** Only active in production (Vercel). No API key required.

---

## PDF Generation (`lib/generatePdf.ts`)

Uses `jsPDF` (client-side, no server needed).

**Format:** Narrative clinical report (not rigid SOAP labels).
- Green header banner with "hiro. AI Medical Scribe"
- Title: "Relatório Clínico — [Patient Name]"
- Patient summary strip (age, CIDs, medications)
- Four flowing sections: **QUEIXA E HISTÓRIA** / **ACHADOS CLÍNICOS** / **IMPRESSÃO DIAGNÓSTICA** / **CONDUTA E ORIENTAÇÕES**
- Footer with page numbers on every page
- Auto page-break detection
- Filename: `relatorio-[patient-slug]-[date].pdf`

---

## UI Design System

**Colors** (defined in Tailwind config + CSS vars):
- `hiro-green` / `hiro-active` — `#0F6E56` (primary action, active states)
- `hiro-text` — `#1C2B1E` (near-black green)
- `hiro-muted` — `#6B7A6D`
- `hiro-bg` — off-white warm
- `hiro-card` — card background
- `hiro-red` — errors
- `hiro-amber` — warnings

**Fonts:**
- `Playfair Display` — display/serif headings (`font-serif`)
- `Geist Sans` — body text (`font-sans`)

**Glass aesthetic:** `.glass-card`, `.glass-warm`, `.glass-loading-overlay` classes in `globals.css` — translucent backgrounds with blur and subtle borders.

**Layout:** Fixed 220px sidebar (`lg:left-[220px]`). Bottom action bars use `fixed bottom-0 left-0 right-0 lg:left-[220px]`.

---

## Known Limitations / Future Work

- **No database** — all patient data lives in-memory Zustand store. Refreshing the page resets everything except the doctor profile (localStorage) and any data loaded from `mockPatients`.
- **Mock data** — 5 hardcoded patients (`mockPatients`). New patients added during the session are lost on refresh.
- **Dashboard metrics** — `DailyMetricsCard` and `UpcomingPatientsSection` use hardcoded data; `dashboardTodayStats.ts` exists but is not yet wired up.
- **Several stub components** — `PatientSelector`, `PatientContext`, `CidSuggestions`, `TranscriptionPanel`, `RecordingZone`, `DetectedItems`, `SoapEditor`, `DocumentsList` exist but are not used in the current UI (legacy from earlier architecture iterations).
- **Agenda page** — `/agenda` is a placeholder.
- **ElevenLabs capacity** — Free/Starter plans may hit "at capacity" errors. No fallback transcription currently.
- **Memed integration** — Uses integration/test environment. Production URLs require completed Memed homologation.
- **Single doctor** — Profile is stored in localStorage; no authentication system exists.

---

## Project Structure

```
hiro/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, sidebar, Analytics)
│   ├── page.tsx                      # Dashboard home
│   ├── globals.css                   # Global styles + glass utilities
│   ├── icon.tsx                      # Dynamic favicon
│   ├── agenda/page.tsx               # Placeholder
│   ├── perfil/page.tsx               # Doctor profile page
│   ├── consulta/
│   │   ├── nova/page.tsx             # Intake flow
│   │   └── [id]/
│   │       ├── page.tsx              # Live consultation
│   │       └── resumo/page.tsx       # SOAP summary
│   ├── pacientes/
│   │   ├── page.tsx                  # Patient list
│   │   └── [id]/page.tsx             # Patient profile
│   └── api/
│       ├── prontuario/route.ts       # SOAP generation (Anthropic)
│       ├── cid/route.ts              # CID-10 suggestions (Anthropic)
│       ├── detect/route.ts           # Item detection (Anthropic)
│       ├── scribe-token/route.ts     # ElevenLabs token
│       └── memed/token/route.ts      # Memed doctor token
├── components/
│   ├── layout/                       # Sidebar, nav, doctor profile form
│   ├── dashboard/                    # Metrics card, upcoming patients
│   ├── consulta/                     # Recording workspace, intake flow
│   ├── paciente/                     # Patient list, profile, charts, exams
│   ├── prontuario/                   # SOAP editor, Memed widget
│   └── ui/                           # Button, Card, Badge, Avatar, OverlineLabel
├── hooks/
│   ├── useTranscription.ts           # ElevenLabs Scribe wrapper
│   ├── useCidSuggestions.ts          # Real-time CID detection
│   └── useDetection.ts               # Real-time item detection
├── lib/
│   ├── types.ts                      # All TypeScript interfaces
│   ├── mockData.ts                   # 5 demo patients
│   ├── store.ts                      # Consultation Zustand store
│   ├── doctorStore.ts                # Doctor profile store (persisted)
│   ├── generatePdf.ts                # jsPDF clinical report
│   ├── iconCircleGlassStyles.ts      # CSS-in-JS for glass icon circles
│   └── dashboardTodayStats.ts        # Dashboard helpers (not yet wired)
├── .env.local                        # Local secrets (not committed)
├── AGENTS.md                         # AI agent rules (read Next.js docs first)
└── CLAUDE.md                         # Points to AGENTS.md
```
