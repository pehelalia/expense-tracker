import { useState, useEffect } from "react";
import { useExpenses, CATEGORIES } from "./hooks/UseExpenses";
import { useAuth } from "./hooks/useAuth";
import { useCategoryBudgets } from "./hooks/useCategoryBudgets";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseCalendar from "./components/ExpenseCalendar";
import { supabase } from "./lib/supabase.js";
import SpendingChart from "./components/SPendingChart";
import LoginPage from "./pages/LoginPage";
import Toast from "./components/Toast";
import "./App.css";

console.log(supabase); // should print the Supabase client object, not undefined

export default function App() {
  const { loading, session, user, signUp, signIn, signOut, error: authError } = useAuth();

  // ── Show loading spinner
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner spinner--lg"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // ── Show login page if no session
  if (!session) {
    return <LoginPage onSignUp={signUp} onSignIn={signIn} error={authError} />;
  }

  // ── Otherwise render the app ─────────────────────────────────────────
  return <AppContent user={user} onSignOut={signOut} />;
}

function AppContent({ user, onSignOut }) {
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
  } = useExpenses(user?.id);

  const { categoryBudgets, setCategoryBudget } = useCategoryBudgets(user?.id);

  const [activePanelTab, setActivePanelTab] = useState("expenses");
  const [toast, setToast] = useState(false);

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

  // ── Tab styles ────────────────────────────────────────────────────────
  const tabStyles = {
    container: {
      display: "flex",
      gap: "0",
      borderBottom: "1px solid var(--color-border-primary)",
      backgroundColor: "var(--color-bg)",
      padding: "0.5rem",
      borderRadius: "8px 8px 0 0",
    },
    tab: {
      flex: 1,
      padding: "0.75rem 1rem",
      border: "none",
      background: "transparent",
      color: "var(--color-text-muted)",
      fontSize: "0.875rem",
      fontWeight: 600,
      cursor: "pointer",
      borderRadius: "6px",
      transition: "background 150ms ease, color 150ms ease",
    },
    tabActive: {
      background: "var(--color-surface)",
      color: "var(--color-primary)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    limitsContainer: {
      padding: "1rem",
    },
    limitsHeader: {
      paddingBottom: "1rem",
      borderBottom: "1px solid var(--color-border-primary)",
      marginBottom: "1rem",
    },
    limitsHeaderText: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "var(--color-text-primary)",
    },
    limitsList: {
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      maxHeight: "500px",
      overflowY: "auto",
    },
    limitRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.75rem 1rem",
      background: "var(--color-bg)",
      borderRadius: "6px",
      border: "1px solid var(--color-border-primary)",
    },
    limitCat: {
      fontWeight: 600,
      color: "var(--color-text-primary)",
      fontSize: "0.875rem",
    },
    limitValue: {
      fontSize: "0.9rem",
      fontWeight: 600,
      color: "var(--color-primary)",
    },
  };

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

          {/* User pill with dropdown */}
          <UserPill user={user} onSignOut={onSignOut} />
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
            <ExpenseForm
              addExpense={addExpense}
              onSuccess={() => {
                setToast(true);
                setTimeout(() => setToast(false), 2500);
              }}
            />
            <SpendingChart summary={summary} categoryBudgets={categoryBudgets} setCategoryBudget={setCategoryBudget} />
          </div>

          {/* Right column — Expense list with tabs */}
          <div className="expense-panel" id="expense-list">
            {/* Tabs */}
            <div style={tabStyles.container}>
              <button
                onClick={() => setActivePanelTab("expenses")}
                style={{
                  ...tabStyles.tab,
                  ...(activePanelTab === "expenses" ? tabStyles.tabActive : {}),
                }}
              >
                Expenses
              </button>
              <button
                onClick={() => setActivePanelTab("limits")}
                style={{
                  ...tabStyles.tab,
                  ...(activePanelTab === "limits" ? tabStyles.tabActive : {}),
                }}
              >
                Category Limits
              </button>
            </div>

            {/* Expenses Tab */}
            {activePanelTab === "expenses" && (
              <>
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
              </>
            )}

            {/* Category Limits Tab */}
            {activePanelTab === "limits" && (
              <div style={tabStyles.limitsContainer}>
                <div style={tabStyles.limitsHeader}>
                  <span style={tabStyles.limitsHeaderText}>Category Limits</span>
                </div>
                <div style={tabStyles.limitsList}>
                  {CATEGORIES.map((cat) => (
                    <div key={cat} style={tabStyles.limitRow}>
                      <span style={tabStyles.limitCat}>{cat}</span>
                      <span style={tabStyles.limitValue}>
                        ₹{(categoryBudgets[cat] || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast visible={toast} message="✓ Expense added" />
    </>
  );
}

/* ── User pill component with sign out dropdown ──────────────────────────── */
function UserPill({ user, onSignOut }) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await onSignOut();
      setShowDropdown(false);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  return (
    <div className="user-pill-container">
      <button
        className="user-pill"
        onClick={() => setShowDropdown(!showDropdown)}
        title={user.email}
      >
        <div className="user-pill__avatar">{user.initials}</div>
        <div className="user-pill__info">
          <div className="user-pill__username">{user.username}</div>
          <div className="user-pill__email">{user.email}</div>
        </div>
      </button>

      {showDropdown && (
        <div className="user-dropdown">
          <button
            className="user-dropdown__item user-dropdown__item--signout"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
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