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
- **Budget tracker** — set a monthly budget and see exactly how much is remaining
- **Stat cards** — total spent, budget remaining, and your biggest spending category at a glance
- **Dark mode** — full dark/light toggle with your preference saved across sessions
- **Pink theme** — a custom pink & violet color system that works in both modes
- **Persistent data** — everything saves to localStorage, no backend or account needed
- **Mobile responsive** — works on any screen size

---

## Tech stack

| Tech | Purpose |
|---|---|
| React 18 | UI and component logic |
| Vite | Build tool and dev server |
| Chart.js + react-chartjs-2 | Doughnut chart |
| localStorage | Data persistence |
| CSS custom properties | Theming (light/dark) |

No external UI libraries. No backend. No database.

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
│   └── useExpenses.js       # All state, localStorage, and summary logic
├── components/
│   ├── ExpenseForm.jsx       # Add expense form with validation
│   └── SpendingChart.jsx     # Chart.js doughnut chart
├── App.jsx                   # Main layout
└── App.css                   # All styles + CSS variables
```

---

## Screenshots

> Add screenshots here after deploying — light mode and dark mode side by side looks great.

---

## Author

Made by [pehelalia](https://github.com/pehelalia) · 1st year B.Tech student