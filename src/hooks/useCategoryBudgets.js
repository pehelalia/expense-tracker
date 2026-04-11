import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * useCategoryBudgets — manages per-category budget limits with Supabase persistence
 *
 * Parameters:
 *   userId — UUID of the logged-in user (from useAuth)
 *
 * Returns:
 *   categoryBudgets — object like { Food: 900, Transport: 500, ... }
 *   setCategoryBudget(category, limit) — async function to upsert a category budget
 */
export function useCategoryBudgets(userId) {
  const [categoryBudgets, setCategoryBudgetsState] = useState({});

  // ── Load category budgets from Supabase on mount ──────────────────────
  useEffect(() => {
    if (!userId) return;

    const loadBudgets = async () => {
      try {
        const { data, error } = await supabase
          .from("category_budgets")
          .select("category, budget_limit")
          .eq("user_id", userId);

        if (error) throw error;

        // Convert array to object keyed by category
        const budgetsObj = {};
        if (data) {
          data.forEach(({ category, budget_limit }) => {
            budgetsObj[category] = budget_limit;
          });
        }
        setCategoryBudgetsState(budgetsObj);
        console.log("Loaded categoryBudgets:", budgetsObj);
      } catch (err) {
        console.error("Failed to load category budgets:", err.message);
        setCategoryBudgetsState({});
      }
    };

    loadBudgets();
  }, [userId]);

  // ── Upsert a category budget ──────────────────────────────────────────
  const setCategoryBudget = useCallback(
    async (category, limit) => {
      if (!userId) return;

      try {
        // Use upsert to insert or update (requires UNIQUE constraint on user_id, category)
        const { error } = await supabase
          .from("category_budgets")
          .upsert(
            { user_id: userId, category, budget_limit: Number(limit) },
            { onConflict: "user_id,category" }
          );

        if (error) throw error;

        // Update local state immediately after successful upsert
        setCategoryBudgetsState((prev) => ({
          ...prev,
          [category]: Number(limit),
        }));
      } catch (err) {
        console.error(
          `Failed to set budget for ${category}:`,
          err.message
        );
      }
    },
    [userId]
  );

  return { categoryBudgets, setCategoryBudget };
}
