# Meal Buddy

A mobile-first cafeteria ordering app for Strathmore University. Order ahead, pay with M-Pesa, and skip the queue.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
## Video Demo
https://docs.google.com/videos/d/1zTbDefiS2lrPVguhTo9orKsqS2zvTTpRkEdgsNYZQdw/play?usp=sharing

## Always-on Startup (Docker Compose)

Run both the frontend and AI model backend with auto-restart and health checks:

```bash
docker compose up --build -d
```

This starts:

- `frontend` on `http://localhost:3000`
- `backend` on `http://localhost:8000`

Both services use `restart: unless-stopped`, and the frontend waits until the
backend health check passes before it starts.

Useful commands:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

### One-click startup on Windows

Use the helper script to start Docker Desktop (if needed), wait for the engine,
and bring up the stack:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-stack.ps1 -Build
```

If images are already built, you can skip rebuilding:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-stack.ps1
```

## AI-guided features

This app is guided by four trained ML models (recommendation, demand forecast,
queue congestion, waste risk), served by a small Python backend in `/backend`.
Start it in a separate terminal before `npm run dev`:

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --port 8000
```

See `backend/README.md` for details on each model, its endpoint, and how the
frontend wires into it. Where the models are used:

- **Home page** — "Recommended for You" pairings are ranked by the recommendation
  model's match probability for the logged-in student; each cafeteria's queue badge
  shows the queue model's live Low/Medium/High congestion prediction.
- **Cafeteria menu page** — the same recommendation ranking and congestion badge,
  scoped to that cafeteria.
- **Kitchen dashboard → AI Insights tab** — per-dish demand forecast and waste-risk
  prediction to help plan production.

If the backend isn't running, these features fail gracefully and say so instead of
breaking the rest of the app.

## Demo accounts

| Role    | ID           | Password    |
|---------|--------------|-------------|
| Student | S2024-38721  | student123  |
| Kitchen Staff | STAFF-001 | staff123 |

## Tech stack

- Next.js (Pages Router)
- Tailwind CSS
- shadcn/ui + Radix primitives
- next-themes for light/dark mode

## Project structure

```
backend/        Python FastAPI server that loads the 4 .pkl models
src/
  components/   MealCard, KitchenOrderCard, CafeteriaQueue, KitchenAIInsights, FoodChatBot, AppShell, etc.
  contexts/     Auth and theme providers
  lib/          Mock data, utilities, and the AI client/encoding helpers
  pages/
    api/ai/     Proxy routes to the Python model server
  pages/        App routes (login, home, menu, orders, profile, kitchen)
  styles/       Global CSS and design tokens
```
