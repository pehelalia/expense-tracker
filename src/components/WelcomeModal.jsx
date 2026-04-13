import { useState } from "react";
import { supabase } from "../lib/supabase";
import { CATEGORIES } from "../hooks/UseExpenses";

export default function WelcomeModal({ user, setBudget, setCategoryBudget, onComplete }) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [categoryLimits, setCategoryLimits] = useState({});
  const [theme, setTheme] = useState("light");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const occupationOptions = [
    "🎓 Student",
    "💼 Working professional",
    "👨‍💻 Freelancer",
    "🏠 Homemaker",
    "🔍 Job seeking",
    "✏️ Other",
  ];

  function handleNext() {
    if (step === 1 && !firstName.trim()) return;
    if (step === 2 && !lastName.trim()) return;
    if (step === 3 && !occupation) return;
    if (step === 4 && (!monthlyBudget || Number(monthlyBudget) <= 0)) return;
    if (step === 5) {
      handleComplete();
      return;
    }
    setStep(step + 1);
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  async function handleComplete() {
    if (!user?.id) return;
    setIsSubmitting(true);

    try {
      // Save profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          occupation,
          onboarding_done: true,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Save monthly budget
      setBudget(Number(monthlyBudget));

      // Save category budgets (fire and forget - don't await)
      for (const [category, limit] of Object.entries(categoryLimits)) {
        if (Number(limit) > 0) {
          setCategoryBudget(category, Number(limit));
        }
      }

      // Apply theme
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);

      // Call onComplete to hide modal - do this immediately after profile save
      onComplete?.();
    } catch (err) {
      console.error("Failed to complete onboarding:", err.message);
      alert("Error saving your profile. Please try again.");
      setIsSubmitting(false);
    }
  }

  // Calculate total and check if within budget
  const totalSpent = Object.values(categoryLimits).reduce(
    (sum, val) => sum + Number(val || 0),
    0
  );
  const budgetNum = Number(monthlyBudget || 0);
  const isWithinBudget = totalSpent <= budgetNum;

  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3000,
      fontFamily: "var(--font-sans, sans-serif)",
    },
    card: {
      background: "white",
      maxWidth: "460px",
      width: "90%",
      borderRadius: "20px",
      padding: "36px",
      border: "2px solid var(--color-primary-mid, #e0b1d6)",
      boxSizing: "border-box",
      maxHeight: "90vh",
      overflowY: "auto",
      position: "relative",
    },
    header: {
      marginBottom: "24px",
    },
    progressDots: {
      display: "flex",
      gap: "8px",
      justifyContent: "center",
      marginBottom: "20px",
    },
    dot: (filled) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: filled ? "var(--color-primary, #E91E8C)" : "#D3D3D3",
      transition: "background 0.2s ease",
    }),
    title: {
      fontSize: "24px",
      fontWeight: 700,
      color: "var(--color-text-primary, #000)",
      marginBottom: "8px",
      textAlign: "center",
    },
    subtitle: {
      fontSize: "13px",
      color: "var(--color-text-muted, #666)",
      textAlign: "center",
      marginBottom: "12px",
    },
    label: {
      fontSize: "13px",
      fontWeight: 600,
      color: "var(--color-text-primary, #000)",
      marginBottom: "8px",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      fontSize: "14px",
      borderRadius: "8px",
      border: "1px solid var(--color-border-primary, #e0e0e0)",
      background: "var(--color-background-primary, #fff)",
      color: "var(--color-text-primary, #000)",
      boxSizing: "border-box",
      outline: "none",
      fontFamily: "inherit",
    },
    inputWrapper: {
      position: "relative",
      marginBottom: "16px",
    },
    currencyPrefix: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--color-primary, #E91E8C)",
      fontWeight: 500,
      fontSize: "14px",
      pointerEvents: "none",
    },
    currencyInput: {
      paddingLeft: "28px",
    },
    helperText: {
      fontSize: "12px",
      color: "var(--color-text-muted, #666)",
      marginTop: "-12px",
      marginBottom: "16px",
    },
    button: {
      width: "100%",
      padding: "12px",
      fontSize: "14px",
      fontWeight: 600,
      borderRadius: "8px",
      border: "none",
      background: "var(--color-primary, #E91E8C)",
      color: "white",
      cursor: "pointer",
      transition: "background 0.2s ease",
      marginTop: "20px",
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    backButton: {
      background: "none",
      border: "none",
      color: "var(--color-text-muted, #666)",
      fontSize: "13px",
      cursor: "pointer",
      marginBottom: "16px",
      padding: "0",
      fontFamily: "inherit",
    },
    optionGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginBottom: "16px",
    },
    optionCard: (selected) => ({
      border: `1.5px solid ${
        selected
          ? "var(--color-primary, #E91E8C)"
          : "var(--color-primary-mid, #e0b1d6)"
      }`,
      borderRadius: "12px",
      padding: "14px 16px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      textAlign: "center",
      background: selected
        ? "var(--color-primary-light, #fff0f7)"
        : "transparent",
      transition: "border-color 0.15s, background 0.15s",
      userSelect: "none",
    }),
    themeGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginBottom: "16px",
    },
    themeCard: (selected) => ({
      border: `1.5px solid ${
        selected
          ? "var(--color-primary, #E91E8C)"
          : "var(--color-primary-mid, #e0b1d6)"
      }`,
      borderRadius: "12px",
      padding: "14px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      textAlign: "center",
      background: selected
        ? "var(--color-primary-light, #fff0f7)"
        : "transparent",
      transition: "border-color 0.15s, background 0.15s",
    }),
    totalRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      fontSize: "13px",
      fontWeight: 600,
      borderTop: "1px solid var(--color-border-primary, #e0e0e0)",
      marginBottom: "16px",
    },
    totalText: (valid) => ({
      color: valid ? "#2ECC71" : "#E24B4A",
    }),
    categoryLimitRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    categoryName: {
      fontSize: "13px",
      fontWeight: 500,
      color: "var(--color-text-primary, #000)",
    },
    categoryInput: {
      width: "140px",
    },
    divider: {
      height: "1px",
      background: "var(--color-border-primary, #e0e0e0)",
      margin: "16px 0",
    },
  };

  // Render based on step
  let content;

  if (step === 1) {
    content = (
      <div style={{ animation: "fadeIn 0.2s ease" }}>
        <div style={styles.progressDots}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <div key={dot} style={styles.dot(dot <= step)} />
          ))}
        </div>
        <div style={styles.title}>Welcome to Spendwise! 👋</div>
        <div style={styles.subtitle}>Let's get you set up. This takes about a minute.</div>

        <label style={styles.label}>What's your first name?</label>
        <input
          type="text"
          placeholder="e.g. Priya"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoFocus
          style={styles.input}
        />

        <button
          onClick={handleNext}
          disabled={!firstName.trim()}
          style={{
            ...styles.button,
            ...((!firstName.trim()) && styles.buttonDisabled),
          }}
        >
          Continue →
        </button>
      </div>
    );
  } else if (step === 2) {
    content = (
      <div style={{ animation: "fadeIn 0.2s ease" }}>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back
        </button>

        <div style={styles.progressDots}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <div key={dot} style={styles.dot(dot <= step)} />
          ))}
        </div>
        <div style={styles.title}>Nice to meet you, {firstName}! 😊</div>

        <label style={styles.label}>What's your last name?</label>
        <input
          type="text"
          placeholder="e.g. Sharma"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoFocus
          style={styles.input}
        />

        <button
          onClick={handleNext}
          disabled={!lastName.trim()}
          style={{
            ...styles.button,
            ...((!lastName.trim()) && styles.buttonDisabled),
          }}
        >
          Continue →
        </button>
      </div>
    );
  } else if (step === 3) {
    content = (
      <div style={{ animation: "fadeIn 0.2s ease" }}>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back
        </button>

        <div style={styles.progressDots}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <div key={dot} style={styles.dot(dot <= step)} />
          ))}
        </div>
        <div style={styles.title}>Almost there!</div>

        <label style={styles.label}>What's your occupation?</label>
        <div style={styles.optionGrid}>
          {occupationOptions.map((opt) => (
            <div
              key={opt}
              style={styles.optionCard(occupation === opt)}
              onClick={() => setOccupation(opt)}
            >
              {opt}
            </div>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!occupation}
          style={{
            ...styles.button,
            ...(!occupation && styles.buttonDisabled),
          }}
        >
          Continue →
        </button>
      </div>
    );
  } else if (step === 4) {
    content = (
      <div style={{ animation: "fadeIn 0.2s ease" }}>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back
        </button>

        <div style={styles.progressDots}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <div key={dot} style={styles.dot(dot <= step)} />
          ))}
        </div>
        <div style={styles.title}>Let's talk money 💰</div>

        <label style={styles.label}>What's your monthly budget?</label>
        <div style={styles.inputWrapper}>
          <div style={styles.currencyPrefix}>₹</div>
          <input
            type="number"
            min="0"
            step="100"
            placeholder="e.g. 10000"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            autoFocus
            style={{ ...styles.input, ...styles.currencyInput }}
          />
        </div>

        <div style={styles.helperText}>
          This helps us track how much you have left to spend each month
        </div>

        <button
          onClick={handleNext}
          disabled={!monthlyBudget || Number(monthlyBudget) <= 0}
          style={{
            ...styles.button,
            ...(!monthlyBudget || Number(monthlyBudget) <= 0 ? styles.buttonDisabled : {}),
          }}
        >
          Continue →
        </button>
      </div>
    );
  } else if (step === 5) {
    content = (
      <div style={{ animation: "fadeIn 0.2s ease" }}>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back
        </button>

        <div style={styles.progressDots}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <div key={dot} style={styles.dot(dot <= step)} />
          ))}
        </div>
        <div style={styles.title}>Set your spending limits 🎯</div>
        <div style={styles.subtitle}>
          How much do you want to spend on each category per month?
          <br />
          (must add up to ≤ your budget of ₹{budgetNum.toLocaleString("en-IN")})
        </div>

        {CATEGORIES.map((category) => (
          <div key={category} style={styles.categoryLimitRow}>
            <span style={styles.categoryName}>{category}</span>
            <div style={styles.inputWrapper}>
              <div style={styles.currencyPrefix}>₹</div>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="0"
                value={categoryLimits[category] || ""}
                onChange={(e) =>
                  setCategoryLimits((prev) => ({
                    ...prev,
                    [category]: e.target.value,
                  }))
                }
                style={{
                  ...styles.input,
                  ...styles.currencyInput,
                  ...styles.categoryInput,
                }}
              />
            </div>
          </div>
        ))}

        <div style={styles.totalRow}>
          <span>Total:</span>
          <span style={styles.totalText(isWithinBudget)}>
            ₹{totalSpent.toLocaleString("en-IN")} of ₹{budgetNum.toLocaleString("en-IN")}
          </span>
        </div>

        <div style={styles.divider} />

        <label style={styles.label}>Choose your default theme</label>
        <div style={styles.themeGrid}>
          <div
            style={styles.themeCard(theme === "light")}
            onClick={() => setTheme("light")}
          >
            ☀️ Light mode
          </div>
          <div
            style={styles.themeCard(theme === "dark")}
            onClick={() => setTheme("dark")}
          >
            🌙 Dark mode
          </div>
        </div>

        <button
          onClick={handleComplete}
          disabled={!isWithinBudget || isSubmitting}
          style={{
            ...styles.button,
            ...((!isWithinBudget || isSubmitting) && styles.buttonDisabled),
          }}
        >
          {isSubmitting ? "Saving..." : "Let's go! 🚀"}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>{content}</div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
