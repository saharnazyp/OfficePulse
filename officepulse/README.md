# 📋 OfficePulse — Daily Office Reminder Board

> A self-refreshing daily task board for an office desk, powered by a single Google Sheet and Google Apps Script. Overdue tasks turn red, pulse, and sound a recurring audio alarm until they're marked done.

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white" alt="Apps Script">
  <img src="https://img.shields.io/badge/Frontend-HTML%2FJS-orange" alt="Frontend">
  <img src="https://img.shields.io/badge/UI-RTL%20ready-success" alt="RTL">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
</p>

---

## Overview

OfficePulse turns one Google Sheet into a live wall-board for the front office. The office manager just types a time and a task into the sheet each morning; the system fills in the rest. The web app polls the sheet every few seconds, sorts tasks by time, tracks completion, and escalates anything that's past due with a blinking red card, a fixed top banner, and a beeping alarm that repeats until the task is checked off.

The interface ships right-to-left (RTL) ready, but the logic is language-agnostic and easy to relabel.

## ✨ Features

- **Single-sheet workflow** — one tab, four columns; no database, no extra setup.
- **Live auto-refresh** — the board re-reads the sheet every 5 seconds.
- **Overdue escalation** — past-due, unfinished tasks turn red, pulse, and trigger a banner.
- **Recurring audio alarm** — a triple-beep replays every 2 minutes per overdue task until it's done.
- **One-tap completion** — "Done" stamps the completion time into the sheet; "Undo" reverts it.
- **Progress counter** — shows completed vs. total at a glance.
- **Flexible time parsing** — accepts `Date` cells, `8`, `8:00`, `8.00`, and common locale separators.
- **Zero secrets** — nothing sensitive is stored; the only state lives in the spreadsheet.

## 🧩 How It Works

```
┌──────────────────┐      every 5s       ┌──────────────────┐
│   Google Sheet   │ ◀──── getTasks ──── │    Web App UI    │
│   SHEET_DAILY    │                     │   (Index.html)   │
│  A B C D columns │ ──── markDone ────▶ │  cards + alarm   │
└──────────────────┘     unmarkDone      └──────────────────┘
```

The Apps Script backend (`Code.gs`) exposes `getTasks`, `markDone`, and `unmarkDone` to the client via `google.script.run`. The frontend renders task cards, computes which are overdue against the server clock, and manages the alarm cadence locally.

## 📑 Sheet Layout

A single tab named **`SHEET_DAILY`** with a header row, then one row per task:

| Column | Field | Meaning | Filled by |
|:------:|:-----:|---------|-----------|
| **A** | Time | Task time (`HH:MM`) | Office manager |
| **B** | Task | Task description | Office manager |
| **C** | Status | Completion status (done keyword) | System |
| **D** | Done At | Completion timestamp | System |

Example:

| Time | Task | Status | Done At |
|------|------|--------|---------|
| 08:00 | Daily check-in calls with managers | Done | 09:44 |
| 09:00 | Review the workflow inbox | | |
| 10:00 | Deliver the treasury folder | Done | 11:20 |

> Only columns **A** and **B** are edited by hand. Columns **C** and **D** are written automatically when a task is marked done from the board.

## 🚀 Setup

1. Create a Google Sheet and add a tab named exactly `SHEET_DAILY` with the four headers above.
2. Open **Extensions → Apps Script** and add two files:
   - `Code.gs` — the backend (`getTasks` / `markDone` / `unmarkDone`).
   - `Index.html` — the board UI.
3. **Deploy → New deployment → Web app**, set access as needed, and open the generated URL.
4. Pin the URL on the office display. Type today's tasks into the sheet and you're live.

> Tip: run `testRead()` from the Apps Script editor to verify the sheet is found and parsed correctly.

## ⚙️ Configuration

| Constant | File | Default | Purpose |
|----------|------|---------|---------|
| `SHEET_NAME` | `Code.gs` | `SHEET_DAILY` | Tab the board reads from |
| `REFRESH_MS` | `Index.html` | `5000` | Sheet re-read interval (ms) |
| `REMIND_EVERY_MS` | `Index.html` | `120000` | Re-alarm interval per overdue task (ms) |

## 📂 Structure

```
officepulse/
├── README.md
├── LICENSE
├── .gitignore
├── appsscript.json
├── Code.gs        # Apps Script backend (sheet I/O + web app entry)
└── Index.html     # Live RTL-ready task board with alarm logic
```

## 🌐 Localization

The default interface text and the "done" status keyword are set up for a Persian/RTL office. To localize, translate the UI strings in `Index.html` and update the status keyword in both `markDone()` and the `done` check inside `getTasks()` in `Code.gs`.

## 📝 License

Released under the [MIT License](LICENSE).
