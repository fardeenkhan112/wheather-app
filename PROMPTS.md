# Prompt History — WeatherBoard

This file records the actual prompts and AI development environment used to build WeatherBoard, in chronological order.

---

## Entry 1 — Initial Master Build Prompt

- **Date**: 2026-11-13
- **Development Tool Used**: Google AI Studio (Build mode)
- **Short Description of Change Requested**: Build the complete WeatherBoard client-side React + Vite PWA from scratch (architecture, GeoDB city autocomplete with caching/cancellation, OpenWeatherMap + Open-Meteo fallback normalization, 5-day local-date forecast, up to 5 persisted favourites, daily foreground reminder with honest limitations, Workbox PWA offline support, dark/light theme, °C/°F unit toggle, Vitest/RTL tests, `README.md`, `PROMPTS.md`, and Vercel configuration).
- **Exact Prompt**:

```markdown
# ROLE AND MISSION

Act as a senior React frontend engineer, product designer, PWA specialist, API integration engineer, accessibility reviewer, and QA engineer.

Build a complete, polished, production-quality web application named **WeatherBoard** for a Frontend (React) Developer technical interview at Edspire.

This is a real technical hiring challenge. The result must look and behave like a professional consumer product, not a generic AI-generated tutorial or template.

I am using Google AI Studio Build mode. Keep the actual development environment and tools accurately documented. Do not claim that I used Cursor, Antigravity IDE, or OpenCode if I did not.

I will personally review and modify the code later. Therefore, use a clean, maintainable, beginner-friendly architecture with readable JavaScript, sensible component separation, meaningful variable names, and comments around non-obvious functionality.

Do not overcomplicate the project.

[Full specification covering Sections 1–21: Official Project Requirements, Technology Stack, Project Architecture, GeoDB City Search Autocomplete, OpenWeatherMap Integration, Open-Meteo Fallback, Weather UI, Favourite Cities (max 5), PWA & Offline Support, Push Notifications & Daily Reminder, Design System, Responsive Design (375px/768px/1280px), Form Validation & Error Handling, Theme & Temperature Unit, Security & Env Config, Vitest/RTL Testing, Vercel Deployment, README.md, PROMPTS.md, Workflow, and Final Acceptance Report.]
```

- **Verification Result**: Automated Vitest suite (`npm run test`), `npm run lint`, and `npm run build` executed after implementation (see final acceptance report and local test output).

---

## Entry 2 — Second-Stage Technical Audit

- **Date**: 2026-11-13
- **Development Tool Used**: Google AI Studio (Build mode)
- **Short Description of Change Requested**: Perform a second-stage technical audit without rebuilding or overwriting the project; verify `.env.local`, API integrations, fallback logic, global city search, favourites, PWA, notifications, responsive layout (`375px`, `768px`, `1280px`), `package.json` scripts, and fix only genuine bugs.
- **Exact Prompt**:

```markdown
Do not rebuild, redesign, or overwrite the existing WeatherBoard project.

Perform a second-stage technical audit of the existing implementation.

Your priorities:
1. Inspect the actual source files and package.json.
2. Verify that .env.local is correctly read by Vite. Never print or expose API key values.
3. Verify the GeoDB Cities integration using the configured RapidAPI key.
4. Verify OpenWeatherMap current weather and 5-day forecast requests.
5. Verify that Open-Meteo fallback activates correctly when the primary provider fails.
6. Inspect browser errors, failed network requests, and CORS issues.
7. Verify that city autocomplete uses globally searchable cities without restricting the application to Pakistan.
8. Verify favourites, confirmation dialogs, localStorage recovery and theme persistence.
9. Audit service worker registration, manifest, offline cache and last-viewed weather.
10. Verify notification behaviour honestly. Do not claim closed-tab scheduled push notifications work without a real push sender.
11. Check layouts at exactly 375px, 768px and 1280px.
12. Inspect the actual npm scripts. Do not label tsc --noEmit as ESLint or a real lint check.
13. Run npm run test and npm run build again.
14. Fix only genuine bugs without destroying working features.
```

- **Verification Result**: Re-ran `npm run test` (Vitest + RTL) and `npm run build` (`vite build`) after fixing genuine bugs found during code audit.

