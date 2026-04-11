import { useState } from "react";
import { useExpenses, CATEGORIES } from "../hooks/UseExpenses";

/**
 * ExpenseForm — controlled form to add a new expense
 *
 * Props:
 *   onSuccess(expense) — optional callback after a successful add
 */
export default function ExpenseForm({ addExpense, onSuccess }) {

  const empty = { amount: "", category: "", description: "", date: today() };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState([]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear errors as user types
    if (errors.length > 0) setErrors([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await addExpense(form);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setForm(empty);
    setErrors([]);
    onSuccess?.();
  }

  return (
    <div style={styles.card}>
      <p style={styles.heading}>Add expense</p>

      {/* Error list */}
      {errors.length > 0 && (
        <div style={styles.errorBox}>
          {errors.map((err, i) => (
            <p key={i} style={styles.errorItem}>
              {err}
            </p>
          ))}
        </div>
      )}

      <div style={styles.form}>
        {/* Amount */}
        <div style={styles.field}>
          <label style={styles.label}>Amount (₹)</label>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            style={inputStyle(errors.some((e) => e.toLowerCase().includes("amount")))}
          />
        </div>

        {/* Category */}
        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={inputStyle(errors.some((e) => e.toLowerCase().includes("category")))}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Description</label>
          <input
            name="description"
            type="text"
            placeholder="e.g. Canteen lunch, Auto to college"
            value={form.description}
            onChange={handleChange}
            style={inputStyle(errors.some((e) => e.toLowerCase().includes("description")))}
          />
        </div>

        {/* Date */}
        <div style={styles.field}>
          <label style={styles.label}>Date</label>
          <input
            name="date"
            type="date"
            max={today()}
            value={form.date}
            onChange={handleChange}
            style={inputStyle(errors.some((e) => e.toLowerCase().includes("date")))}
          />
        </div>

        {/* Submit */}
        <div style={{ ...styles.field, alignSelf: "flex-end" }}>
          <button onClick={handleSubmit} style={styles.btn}>
            Add expense
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

function inputStyle(hasError) {
  return {
    width: "100%",
    padding: "8px 10px",
    fontSize: "14px",
    borderRadius: "8px",
    border: `1px solid ${hasError ? "#E24B4A" : "var(--color-border-secondary, #ccc)"}`,
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box",
  };
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
    margin: "0 0 1rem",
    color: "var(--color-text-primary)",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    fontWeight: 400,
  },
  btn: {
    width: "100%",
    padding: "9px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "8px",
    border: "0.5px solid var(--color-border-secondary)",
    background: "transparent",
    color: "var(--color-text-primary)",
    cursor: "pointer",
  },
  success: {
    fontSize: "13px",
    color: "#0F6E56",
    background: "#E1F5EE",
    borderRadius: "8px",
    padding: "8px 12px",
    marginBottom: "12px",
  },
  errorBox: {
    borderRadius: "8px",
    background: "#FCEBEB",
    padding: "8px 12px",
    marginBottom: "12px",
  },
  errorItem: {
    fontSize: "13px",
    color: "#A32D2D",
    margin: "2px 0",
  },
};