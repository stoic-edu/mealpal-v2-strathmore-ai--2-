# Meal Buddy 🍽️

An AI-powered cafeteria ordering platform for **Strathmore University** that lets students and staff skip the queue, order ahead, and eat smarter — built for [MLH](https://mlh.io/).

[![](screenshots/02-home.png)](screenshots/02-home.png)

## 📽️ Demo Video

> Add the video to your repo (drag-and-drop it into a new GitHub Issue or Discussion to get a shareable `user-images.githubusercontent.com` link, then paste that link below), or upload it to YouTube/Loom and link it here.

[![Watch the demo](screenshots/02-home.png)](#) <!-- replace the `#` with your hosted video link -->

## About

Meal Buddy solves a very real campus problem: long, slow-moving cafeteria queues and students making rushed, unhealthy food choices under time pressure. It lets students browse live queue times across multiple campus cafeterias, order and pay ahead of time, and get AI-driven meal recommendations that fit their calorie goals and budget — while cafeteria staff get a dedicated Kitchen Display to manage and hand off orders using a simple reference code.

## Features and Interfaces

1. **Login / Sign Up**

   - Secure sign-in for both students and staff, with staff IDs (`STAFF-...`) automatically routed to the Kitchen Display
   - Two-step onboarding that also captures a student's health profile (age, weight, height, activity level)

   [![](screenshots/01-login.png)](screenshots/01-login.png)

2. **Home Page**

   - Browse multiple campus cafeterias (Main Cafeteria, Upesi, Pate Cafe, Springs of Olives) with **live queue length and estimated wait time**
   - Daily "Today's Special" carousel highlighting themed menus (e.g. Coastal Kenya Day)
   - AI-generated **"Recommended for You"** plate pairings based on what's realistically available around campus

   [![](screenshots/02-home.png)](screenshots/02-home.png)
   [![](screenshots/03-recommendations.png)](screenshots/03-recommendations.png)

3. **Cafeteria Menu**

   - Every dish is tagged with a **Healthy % score**, calories, rating, allergen warnings, and dietary tags (Vegetarian, Snack, Drink, etc.)
   - "Add to Plate" builds up a custom order across categories (mains, sides, drinks, snacks)

   [![](screenshots/04-menu-healthy-score.png)](screenshots/04-menu-healthy-score.png)

4. **Plate / Checkout**

   - Review and adjust quantities before paying
   - Multiple payment methods: **Campus Wallet**, **M-Pesa**, and **Card**
   - Instant order confirmation with a unique reference code (e.g. `MB-STU-2026-27309`)

   [![](screenshots/05-cart-checkout.png)](screenshots/05-cart-checkout.png)

5. **Live Order Tracking**

   - Real-time queue position and ETA for every active order
   - Status updates (`In Queue` → `On the Way`) with a scannable **QR reference code** to show at the counter
   - Full order history

   [![](screenshots/08-order-tracking.png)](screenshots/08-order-tracking.png)

6. **Health Profile & AI Nutrition Coach**

   - Daily calorie, budget, and "remaining" ring summaries
   - Personalized daily calorie target calculated with the **Mifflin-St Jeor equation** based on gender, age, weight, height, activity level, and goal (lose / maintain / gain weight)
   - Smart nudges — e.g. flags high sugar/fat items to avoid and suggests top picks that fit the remaining budget/calories
   - "Don't know what to eat? Ask me" — an in-app AI chat assistant for meal suggestions

   [![](screenshots/06-profile-health.png)](screenshots/06-profile-health.png)
   [![](screenshots/07-calorie-calculator.png)](screenshots/07-calorie-calculator.png)

7. **Kitchen Display (Staff View)**

   - A dedicated dashboard for cafeteria staff to view active orders and history
   - Staff type in (or scan) a student's reference code to verify and confirm handover, with sound alerts for new orders

   [![](screenshots/09-kitchen-display.png)](screenshots/09-kitchen-display.png)

## Tech Stack

#### Frontend

- Next.js (React)
- TypeScript

#### Other Tools

- AI-powered meal recommendation & chat assistant
- Mifflin-St Jeor based calorie/nutrition engine
- QR-code order verification for cafeteria handoff

## Points to Remember While Testing the App

1. Run the app locally and open [http://localhost:3000](http://localhost:3000)
2. Use one of the demo accounts on the sign-in screen to get started instantly:
   - **Student:** `S2024-38721` / `student123`
   - **Staff:** `STAFF-001` / `staff123`
3. Staff IDs are automatically routed to the Kitchen Display instead of the student ordering flow
4. Allow browser **notifications/sound** permissions to get the full Kitchen Display alert experience

## Instructions

1. Clone the project
   - `git clone https://github.com/stoic-edu/mealpal-v2-strathmore-ai--2-.git`
2. Move into the project folder
   - `cd mealpal-v2-strathmore-ai--2-/mealpal-v2`
3. Install dependencies
   - `npm install`
4. Create a `.env` file and set any required environment variables (see `.env.example` if provided)
5. Run the app
   - `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Useful Links

- [GitHub Repository](https://github.com/stoic-edu/mealpal-v2-strathmore-ai--2-)
- Project Demo *(add your live deployment link here once hosted, e.g. on Vercel)*
- Demo Video *(add your hosted video link here)*

## Team

Built by the **Stoic Edu** team for MLH.

## Need Help?

Feel free to open an issue on this repository if you run into any problems.
