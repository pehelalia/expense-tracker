import { useState, useEffect } from "react";
import { useExpenses, CATEGORIES } from "./hooks/UseExpenses";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseCalendar from "./components/ExpenseCalendar";
import SpendingChart from "./components/SPendingChart";
import "./App.css";

export default function App() {
  const {
    expenses,
    addExpense,
    budget,
    setBudget,
    summary,
    filteredExpenses,
    filterCategory,
    setFilterCategory,
    deleteExpense,
  } = useExpenses();

  const { total, remaining, biggestCategory } = summary;

  // ── Theme toggle ──────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute("data-theme") === "dark";
  });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
      setIsDark(saved === "dark");
    }
  }, []);

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setIsDark(next === "dark");
  }

  // Sort by most recent date
  const sorted = [...filteredExpenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="app-header" id="app-header">
        <div className="app-header__brand">
          <div className="app-header__icon">💰</div>
          <div>
            <div className="app-header__title">Spendwise</div>
            <div className="app-header__subtitle">Student Expense Tracker</div>
          </div>
        </div>

        <div className="app-header__right">
          <ExpenseCalendar expenses={expenses} />
          <div className="app-header__budget">
            <label className="app-header__budget-label" htmlFor="budget-input">
              Monthly Budget ₹
            </label>
            <input
              id="budget-input"
              className="app-header__budget-input"
              type="number"
              min="0"
              step="100"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="5000"
            />
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="app-container">
        {/* ── Summary Cards ───────────────────────────────────────────── */}
        <div className="summary-row">
          <SummaryCard
            icon="📊"
            iconClass="summary-card__icon--spent"
            label="Total Spent"
            value={`₹${total.toLocaleString("en-IN")}`}
            detail="This month"
          />
          <SummaryCard
            icon={remaining >= 0 ? "✅" : "⚠️"}
            iconClass={`summary-card__icon--remaining${remaining < 0 ? " negative" : ""}`}
            label="Budget Remaining"
            value={`₹${Math.abs(remaining).toLocaleString("en-IN")}`}
            valueClass={remaining < 0 ? "summary-card__value--negative" : ""}
            detail={remaining < 0 ? "Over budget!" : `of ₹${budget.toLocaleString("en-IN")}`}
          />
          <SummaryCard
            icon="🏆"
            iconClass="summary-card__icon--category"
            label="Biggest Category"
            value={biggestCategory ? biggestCategory.name : "—"}
            detail={
              biggestCategory
                ? `₹${biggestCategory.amount.toLocaleString("en-IN")} spent`
                : "No expenses yet"
            }
          />
        </div>

        {/* ── Main 2-column grid ──────────────────────────────────────── */}
        <div className="main-grid">
          {/* Left column */}
          <div className="left-column">
            <ExpenseForm addExpense={addExpense} />
            <SpendingChart summary={summary} />
          </div>

          {/* Right column — Expense list */}
          <div className="expense-panel" id="expense-list">
            <div className="expense-panel__header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="expense-panel__title">Expenses</span>
                <span className="expense-panel__count">{sorted.length}</span>
              </div>
              <select
                id="category-filter"
                className="expense-panel__filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="expense-panel__list">
              {sorted.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state__icon">📭</div>
                  <div className="empty-state__title">No expenses yet</div>
                  <div className="empty-state__subtitle">
                    {filterCategory !== "All"
                      ? `No ${filterCategory} expenses found. Try a different filter.`
                      : "Add your first expense to start tracking!"}
                  </div>
                </div>
              ) : (
                sorted.map((expense, i) => (
                  <div
                    className="expense-row"
                    key={expense.id}
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <span
                      className={`expense-row__cat-dot dot--${expense.category}`}
                    />
                    <div className="expense-row__main">
                      <div className="expense-row__desc">{expense.description}</div>
                      <div className="expense-row__meta">
                        <span className={`badge badge--${expense.category}`}>
                          {expense.category}
                        </span>
                        <span className="expense-row__date">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                    </div>
                    <span className="expense-row__amount">
                      ₹{expense.amount.toLocaleString("en-IN")}
                    </span>
                    <button
                      className="expense-row__delete"
                      onClick={() => deleteExpense(expense.id)}
                      title="Delete expense"
                      aria-label={`Delete ${expense.description}`}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Summary card component ──────────────────────────────────────────────── */
function SummaryCard({ icon, iconClass, label, value, valueClass = "", detail }) {
  return (
    <div className="summary-card fade-in">
      <div className={`summary-card__icon ${iconClass}`}>{icon}</div>
      <div className="summary-card__info">
        <div className="summary-card__label">{label}</div>
        <div className={`summary-card__value ${valueClass}`}>{value}</div>
        {detail && <div className="summary-card__detail">{detail}</div>}
      </div>
    </div>
  );
}

/* ── Date formatter ──────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}