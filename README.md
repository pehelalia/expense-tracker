# 💸 Spendwise — Student Expense Tracker

A clean, responsive expense tracking app built for students to manage monthly budgets, visualise spending habits, and stay on top of finances.

**[Live Demo →](https://spendwise-expense-tracker-ruby.vercel.app/)**

![App screenshot](./public/screenshot.png)

---

## What it does

Students often have no idea where their money goes. Spendwise lets you log every expense by category, set a monthly budget, and instantly see a breakdown of your spending — so you always know what's left.

---

## Features

- **Add & delete expenses** — log amount, category, description, and date
- **Category filtering** — filter your expense list by Food, Transport, Study, Rent, Entertainment, or Other
- **Spending chart** — live doughnut chart showing your breakdown by category
- **Category budget limits** — set per-category spending limits and get instant warnings when you overspend
- **Budget tracker** — set a monthly budget and see exactly how much is remaining
- **Stat cards** — total spent, budget remaining, and your biggest spending category at a glance
- **Dark mode** — full dark/light toggle with your preference saved across sessions
- **Pink theme** — a custom pink & violet color system that works in both modes
- **Authentication** — sign up and log in to sync expenses across devices
- **Persistent data** — all expenses and budget limits sync to Supabase in real-time
- **Success notifications** — toast feedback when expenses are added successfully
- **Error handling** — graceful error boundaries prevent crashes; friendly error messages guide recovery
- **Mobile responsive** — works on any screen size

---

## Key Highlights

### 🎯 Category Budget Limits
Set spending limits for each category. The app shows real-time warnings in red when you exceed a limit, helping you stay on track.

### 🔔 Success Notifications  
Smooth toast notifications appear briefly at the bottom of the screen when you successfully add an expense — instant visual feedback without clutter.

### 🛡️ Graceful Error Handling
If something goes wrong, you'll see a friendly error message instead of a blank screen. Hit "Reload app" to recover and continue.

### 👤 User Accounts
Sign up or log in with your email to sync expenses across devices. Your data is stored securely in Supabase and recoverable anytime.

---

## Tech stack

| Tech | Purpose |
|---|---|
| React 18 | UI and component logic |
| Vite | Build tool and dev server |
| Supabase | Backend, PostgreSQL database, and authentication |
| Chart.js + react-chartjs-2 | Doughnut chart |
| CSS custom properties | Theming (light/dark) |

No external UI libraries. Full-stack with real-time data sync.

---

## Getting started

**Prerequisites:** Node.js 18+ and npm installed.

```bash
# 1. Clone the repo
git clone https://github.com/pehelalia/expense-tracker.git
cd expense-tracker

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# To build for production
npm run build
```

---

## Project structure

```
src/
├── hooks/
│   ├── useExpenses.js          # All expense state and CRUD logic
│   ├── useAuth.js              # Authentication and session management
│   ├── useCategoryBudgets.js   # Per-category budget limits
│   └── useProfile.js           # User profile data
├── components/
│   ├── ExpenseForm.jsx          # Add expense form with validation
│   ├── ExpenseCalendar.jsx      # Calendar view of expenses
│   ├── SPendingChart.jsx        # Chart.js doughnut chart + limit warnings
│   ├── Toast.jsx                # Success notification toast
│   ├── ErrorBoundary.jsx        # Global crash handler
│   └── LoginPage.jsx            # Auth UI
├── lib/
│   └── supabase.js              # Supabase client config
├── pages/
│   └── LoginPage.jsx            # Sign up / sign in page
├── App.jsx                      # Main layout and state orchestration
└── App.css                      # All styles + CSS variables
```

---

## Screenshots

> Add screenshots here after deploying — light mode and dark mode side by side looks great.

---

## Author

Made by [pehelalia](https://github.com/pehelalia) · 1st year B.Tech student