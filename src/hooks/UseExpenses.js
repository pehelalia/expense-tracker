import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "student_expenses";
const BUDGET_KEY = "student_budget";

/**
 * useExpenses — manages all expense state with Supabase persistence
 *
 * Parameters:
 *   userId — UUID of the logged-in user (from useAuth)
 *
 * Returns:
 *   expenses        — full list of expense objects for this user
 *   addExpense(obj) — add a new expense (persists to Supabase)
 *   deleteExpense(id) — remove by id (deletes from Supabase)
 *   budget          — monthly budget (number, stored in localStorage)
 *   setBudget(n)    — update budget
 *   summary         — { total, remaining, byCategory, biggestCategory }
 *   filterCategory  — currently active category filter (string | "All")
 *   setFilterCategory — update the filter
 *   filteredExpenses — expenses after applying filterCategory
 */
export function useExpenses(userId) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(!!userId);

  const [budget, setBudgetState] = useState(() => {
    try {
      const stored = localStorage.getItem(BUDGET_KEY);
      return stored ? Number(stored) : 5000;
    } catch {
      return 5000;
    }
  });

  const [filterCategory, setFilterCategory] = useState("All");

  // ── Load expenses from Supabase when userId is available ────────────────
  useEffect(() => {
    if (!userId) {
      setExpenses(sampleData());
      setIsLoading(false);
      return;
    }

    const loadExpenses = async () => {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false });

        if (error) throw error;
        setExpenses(data || []);
      } catch (err) {
        console.error("Failed to load expenses:", err.message);
        // Fallback to sample data on error
        setExpenses(sampleData());
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();
  }, [userId]);

  // ── Persist budget ──────────────────────────────────────────────────────
  function setBudget(value) {
    const n = Number(value);
    if (!isNaN(n) && n >= 0) {
      setBudgetState(n);
      localStorage.setItem(BUDGET_KEY, String(n));
    }
  }

  // ── Add a new expense (persists to Supabase if userId exists) ───────────
  const addExpense = useCallback(async ({ amount, category, description, date }) => {
    try {
      const errors = validateExpense({ amount, category, description, date });
      if (errors.length > 0) return { ok: false, errors };

      const newExpense = {
        id: crypto.randomUUID(),
        amount: parseFloat(parseFloat(amount).toFixed(2)),
        category,
        description: description.trim(),
        date,
        user_id: userId || null,
      };

      // Add to Supabase if user is logged in
      if (userId) {
        const { data, error } = await supabase
          .from("expenses")
          .insert([
            {
              id: newExpense.id,
              user_id: userId,
              amount: newExpense.amount,
              category: newExpense.category,
              description: newExpense.description,
              date: newExpense.date,
            },
          ])
          .select();

        if (error) throw error;
        // Update local state with the created expense from Supabase
        setExpenses((prev) => [data[0] || newExpense, ...prev]);
      } else {
        // Fallback: just update local state for a non-authenticated user
        setExpenses((prev) => [newExpense, ...prev]);
      }

      return { ok: true, errors: [] };
    } catch (err) {
      console.error("addExpense failed:", err.message);
      return { ok: false, errors: [err.message] };
    }
  }, [userId]);

  // ── Delete by id (removes from Supabase if userId exists) ──────────────
  const deleteExpense = useCallback(async (id) => {
    if (!userId) {
      // If no user, just remove from local state
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Failed to delete expense:", err.message);
    }
  }, [userId]);

  // ── Summary calculations (only recalculates when expenses/budget change)
  const summary = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const thisMonth = expenses.filter((e) => e.date.startsWith(currentMonth));

    const total = thisMonth.reduce((sum, e) => sum + e.amount, 0);
    const remaining = budget - total;

    const byCategory = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = thisMonth
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + e.amount, 0);
      return acc;
    }, {});

    const biggestCategory = Object.entries(byCategory).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      total: parseFloat(total.toFixed(2)),
      remaining: parseFloat(remaining.toFixed(2)),
      byCategory,
      biggestCategory: biggestCategory
        ? { name: biggestCategory[0], amount: parseFloat(biggestCategory[1].toFixed(2)) }
        : null,
    };
  }, [expenses, budget]);

  // ── Filtered list ───────────────────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    if (filterCategory === "All") return expenses;
    return expenses.filter((e) => e.category === filterCategory);
  }, [expenses, filterCategory]);

  return {
    expenses,
    addExpense,
    deleteExpense,
    budget,
    setBudget,
    summary,
    filterCategory,
    setFilterCategory,
    filteredExpenses,
  };
}

// ── Validation ─────────────────────────────────────────────────────────────
function validateExpense({ amount, category, description, date }) {
  const errors = [];
  const num = parseFloat(amount);

  if (!amount || isNaN(num) || num <= 0)
    errors.push("Amount must be a positive number.");
  if (num > 100000)
    errors.push("Amount seems too large. Double-check it.");
  if (!CATEGORIES.includes(category))
    errors.push("Please select a valid category.");
  if (!description || description.trim().length < 2)
    errors.push("Description must be at least 2 characters.");
  if (!date)
    errors.push("Date is required.");
  if (date && new Date(date) > new Date())
    errors.push("Date cannot be in the future.");

  return errors;
}

// ── Constants ───────────────────────────────────────────────────────────────
export const CATEGORIES = [
  "Food",
  "Groceries",
  "Transport",
  "Entertainment",
  "Study",
  "Rent",
  "Miscellaneous",
];

// ── Sample data (shown on first load so the app isn't empty) ────────────────
function sampleData() {
  const today = new Date();
  const fmt = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  return [
    { id: "1", amount: 120,  category: "Food",          description: "Grocery run", date: fmt(1) },
    { id: "2", amount: 50,   category: "Transport",     description: "Bus pass",    date: fmt(2) },
    { id: "3", amount: 299,  category: "Study",         description: "Textbooks",   date: fmt(3) },
    { id: "4", amount: 200,  category: "Entertainment", description: "Movie + dinner", date: fmt(5) },
    { id: "5", amount: 3500, category: "Rent",          description: "Monthly rent", date: fmt(7) },
    { id: "6", amount: 85,   category: "Food",          description: "Canteen + chai", date: fmt(0) },
  ];
}