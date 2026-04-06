import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useExpenses } from "../hooks/UseExpenses";

// Register the pieces of Chart.js you're actually using
// (Vite tree-shakes the rest — keeps your bundle small)
ChartJS.register(ArcElement, Tooltip, Legend);

// Read chart colors from CSS variables at render time so they adapt to the theme
function getChartColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (name) => s.getPropertyValue(name).trim();
  return {
    Food:          { bg: v("--chart-food")          || "#E91E8C", border: v("--chart-food-border")          || "#c4177a" },
    Transport:     { bg: v("--chart-transport")      || "#7C3AED", border: v("--chart-transport-border")      || "#5B21B6" },
    Entertainment: { bg: v("--chart-entertainment")  || "#F48CB6", border: v("--chart-entertainment-border")  || "#E06B9A" },
    Study:         { bg: v("--chart-study")          || "#F59E0B", border: v("--chart-study-border")          || "#D97706" },
    Rent:          { bg: v("--chart-rent")           || "#EC4899", border: v("--chart-rent-border")           || "#DB2777" },
    Other:         { bg: v("--chart-other")          || "#9CA3AF", border: v("--chart-other-border")          || "#6B7280" },
  };
}

export default function SpendingChart() {
  const { summary } = useExpenses();
  const { byCategory, total } = summary;
  const COLORS = getChartColors();

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
        borderColor:     labels.map((l) => COLORS[l]?.border ?? "#5F5E5A"),
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
      <p style={styles.heading}>Spending breakdown</p>
      <p style={styles.sub}>This month · ₹{total.toLocaleString("en-IN")} total</p>

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
  heading: {
    fontSize: "16px",
    fontWeight: 500,
    margin: "0 0 2px",
    color: "var(--color-text-primary)",
  },
  sub: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    margin: "0 0 1.25rem",
  },
  chartWrap: {
    position: "relative",
    maxWidth: "280px",
    margin: "0 auto",
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
  empty: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    textAlign: "center",
    padding: "2rem 1rem",
  },
};