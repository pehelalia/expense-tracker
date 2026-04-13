import { Doughnut } from "react-chartjs-2";
import { useState, useEffect as React_useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { CATEGORIES } from "../hooks/UseExpenses";

// Register the pieces of Chart.js you're actually using
// (Vite tree-shakes the rest — keeps your bundle small)
ChartJS.register(ArcElement, Tooltip, Legend);

// Read chart colors from CSS variables at render time so they adapt to the theme
function getChartColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (name) => s.getPropertyValue(name).trim();
  return {
    Food: { bg: v("--chart-food") || "#E91E8C", border: v("--chart-food-border") || "#c4177a" },
    Groceries: { bg: v("--chart-groceries") || "#2ECC71", border: v("--chart-groceries-border") || "#27AE60" },
    Transport: { bg: v("--chart-transport") || "#7C3AED", border: v("--chart-transport-border") || "#5B21B6" },
    Entertainment: { bg: v("--chart-entertainment") || "#F48CB6", border: v("--chart-entertainment-border") || "#E06B9A" },
    Study: { bg: v("--chart-study") || "#F59E0B", border: v("--chart-study-border") || "#D97706" },
    Rent: { bg: v("--chart-rent") || "#EC4899", border: v("--chart-rent-border") || "#DB2777" },
    Miscellaneous: { bg: v("--chart-miscellaneous") || "#9CA3AF", border: v("--chart-miscellaneous-border") || "#6B7280" },
  };
}

export default function SpendingChart({ summary, categoryBudgets = {}, setCategoryBudget }) {
  const { byCategory, total } = summary;
  const [showLimitsPanel, setShowLimitsPanel] = useState(false);
  const [editLimits, setEditLimits] = useState(categoryBudgets);
  const COLORS = getChartColors();

  // Update editLimits when categoryBudgets changes
  React_useEffect(() => {
    setEditLimits(categoryBudgets);
  }, [categoryBudgets]);

  // Only show categories that have spending
  const activeCategories = Object.entries(byCategory).filter(([, v]) => v > 0);

  if (activeCategories.length === 0) {
    return (
      <div style={styles.empty}>
        No expenses this month yet. Add one to see your breakdown.
      </div>
    );
  }

  const labels = activeCategories.map(([cat]) => cat);
  const values = activeCategories.map(([, v]) => v);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((l) => COLORS[l]?.bg ?? "#888780"),
        borderColor: labels.map((l) => COLORS[l]?.border ?? "#5F5E5A"),
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    cutout: "68%",          // thickness of the ring
    radius: "88%",          // leave room for the legend
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { size: 13 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = total > 0
              ? ((ctx.parsed / total) * 100).toFixed(1)
              : 0;
            return `  ₹${ctx.parsed.toLocaleString("en-IN")} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <p style={styles.heading}>Spending breakdown</p>
          <p style={styles.sub}>This month · ₹{total.toLocaleString("en-IN")} total</p>
        </div>
        <button
          onClick={() => setShowLimitsPanel(!showLimitsPanel)}
          style={styles.setLimitsBtn}
          title="Set category budget limits"
        >
          Set limits
        </button>
      </div>

      {/* The chart */}
      <div style={styles.chartWrap}>
        <Doughnut data={data} options={options} />

        {/* Centre label */}
        <div style={styles.centre}>
          <span style={styles.centreAmount}>
            ₹{total.toLocaleString("en-IN")}
          </span>
          <span style={styles.centreLabel}>spent</span>
        </div>
      </div>

      {/* ── Set limits inline panel ─────────────────────────────────────── */}
      {showLimitsPanel && (
        <div style={styles.limitsPanel}>
          {CATEGORIES.map((cat) => (
            <div key={cat} style={styles.limitField}>
              <label style={styles.limitLabel}>{cat}</label>
              <input
                type="number"
                min="0"
                step="100"
                value={editLimits[cat] || ""}
                onChange={(e) =>
                  setEditLimits({
                    ...editLimits,
                    [cat]: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="No limit"
                style={styles.limitInput}
              />
            </div>
          ))}
          <div style={styles.limitButtons}>
            <button
              onClick={async () => {
                const promises = [];
                Object.entries(editLimits).forEach(([cat, limit]) => {
                  if (limit !== undefined && limit !== categoryBudgets[cat]) {
                    promises.push(setCategoryBudget(cat, limit));
                  }
                });
                await Promise.all(promises);
                setShowLimitsPanel(false);
              }}
              style={styles.limitSaveBtn}
            >
              Save limits
            </button>
            <button
              onClick={() => {
                setEditLimits(categoryBudgets);
                setShowLimitsPanel(false);
              }}
              style={styles.limitCancelBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Budget warnings ──────────────────────────────────────────────── */}
      <div style={styles.warningsSection}>
        {Object.entries(byCategory).map(([cat, spent]) => {
          const limit = categoryBudgets[cat];
          if (!limit || spent <= limit) return null;

          const overspend = spent - limit;
          return (
            <div key={cat} style={styles.warningPill}>
              <span>⚠️</span>
              <span>
                {cat} — ₹{spent.toLocaleString("en-IN")} spent of ₹
                {limit.toLocaleString("en-IN")} limit (₹
                {overspend.toLocaleString("en-IN")} over)
              </span>
            </div>
          );
        })}

        {Object.entries(byCategory).every(([cat, spent]) => {
          const limit = categoryBudgets[cat];
          return !limit || spent <= limit;
        }) && Object.keys(categoryBudgets).length > 0 && (
          <div style={styles.allGoodPill}>
            ✓ All categories within budget
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  card: {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "12px",
    padding: "1.25rem",
    fontFamily: "var(--font-sans, sans-serif)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  heading: {
    fontSize: "16px",
    fontWeight: 500,
    margin: "0 0 2px",
    color: "var(--color-text-primary)",
  },
  sub: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    margin: 0,
  },
  setLimitsBtn: {
    padding: "0.5rem 1rem",
    background: "var(--color-primary-light)",
    color: "var(--color-primary)",
    border: "1.5px solid var(--color-primary)",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 150ms ease, color 150ms ease",
  },
  chartWrap: {
    position: "relative",
    maxWidth: "280px",
    margin: "0 auto 1.5rem",
  },
  centre: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -60%)",
    textAlign: "center",
    pointerEvents: "none",
  },
  centreAmount: {
    display: "block",
    fontSize: "20px",
    fontWeight: 500,
    color: "var(--color-text-primary)",
  },
  centreLabel: {
    display: "block",
    fontSize: "12px",
    color: "var(--color-text-secondary)",
  },
  limitsPanel: {
    background: "var(--color-bg)",
    border: "1px solid var(--color-border-primary)",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "0.75rem",
  },
  limitField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  limitLabel: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--color-text-primary)",
  },
  limitInput: {
    padding: "0.5rem",
    border: "1px solid var(--color-border-primary)",
    borderRadius: "6px",
    background: "var(--color-surface)",
    color: "var(--color-text-primary)",
    fontSize: "0.875rem",
    fontFamily: "inherit",
  },
  limitButtons: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  limitSaveBtn: {
    flex: 1,
    padding: "0.625rem 1rem",
    background: "var(--color-primary)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 150ms ease",
  },
  limitCancelBtn: {
    flex: 1,
    padding: "0.625rem 1rem",
    background: "var(--color-background-hover)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-primary)",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 150ms ease",
  },
  warningsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  warningPill: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    background: "rgba(229, 57, 53, 0.08)",
    border: "1px solid var(--color-danger)",
    borderRadius: "8px",
    color: "var(--color-danger)",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  allGoodPill: {
    padding: "0.75rem 1rem",
    background: "rgba(0, 137, 123, 0.08)",
    border: "1px solid var(--color-success)",
    borderRadius: "8px",
    color: "var(--color-success)",
    fontSize: "0.875rem",
    fontWeight: 500,
    textAlign: "center",
  },
  empty: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    textAlign: "center",
    padding: "2rem 1rem",
  },
};