import { useState } from "react";

const CATEGORY_COLORS = {
    Food: "#E91E8C",
    Transport: "#7C3AED",
    Entertainment: "#F48CB6",
    Study: "#F59E0B",
    Rent: "#EC4899",
    Other: "#9CA3AF",
};

export default function ExpenseCalendar({ expenses }) {
    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth(); // 0-indexed

    // ── Navigation ────────────────────────────────────────────────────────
    function prevMonth() {
        setViewDate(new Date(year, month - 1, 1));
    }
    function nextMonth() {
        setViewDate(new Date(year, month + 1, 1));
    }

    // ── Build calendar grid ───────────────────────────────────────────────
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Group expenses by date string "YYYY-MM-DD"
    const byDate = {};
    expenses.forEach((e) => {
        if (!byDate[e.date]) byDate[e.date] = [];
        byDate[e.date].push(e);
    });

    // Pad start with empty cells
    const cells = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const monthLabel = viewDate.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });

    const today = new Date();
    const isToday = (d) =>
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

    const dateKey = (d) =>
        `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const totalForMonth = expenses
        .filter((e) => e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
        .reduce((s, e) => s + e.amount, 0);

    return (
        <>
            {/* ── Trigger button ─────────────────────────────────────────────── */}
            <button className="cal-trigger" onClick={() => setOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
                    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Calendar
            </button>

            {/* ── Overlay ────────────────────────────────────────────────────── */}
            {open && (
                <div className="cal-overlay" onClick={() => setOpen(false)}>
                    <div className="cal-modal" onClick={(e) => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="cal-modal__header">
                            <div>
                                <div className="cal-modal__title">Expense Calendar</div>
                                <div className="cal-modal__sub">
                                    ₹{totalForMonth.toLocaleString("en-IN")} spent in {monthLabel}
                                </div>
                            </div>
                            <button className="cal-modal__close" onClick={() => setOpen(false)}>✕</button>
                        </div>

                        {/* Month navigation */}
                        <div className="cal-nav">
                            <button className="cal-nav__btn" onClick={prevMonth}>‹</button>
                            <span className="cal-nav__label">{monthLabel}</span>
                            <button className="cal-nav__btn" onClick={nextMonth}>›</button>
                        </div>

                        {/* Day-of-week headers */}
                        <div className="cal-grid cal-grid--header">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                <div key={d} className="cal-dow">{d}</div>
                            ))}
                        </div>

                        {/* Calendar cells */}
                        <div className="cal-grid">
                            {cells.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />;
                                const key = dateKey(day);
                                const dayExp = byDate[key] || [];
                                const dayTotal = dayExp.reduce((s, e) => s + e.amount, 0);
                                const hasExp = dayExp.length > 0;

                                return (
                                    <div
                                        key={key}
                                        className={`cal-cell${isToday(day) ? " cal-cell--today" : ""}${hasExp ? " cal-cell--has-exp" : ""}`}
                                    >
                                        <div className="cal-cell__day">{day}</div>

                                        {hasExp && (
                                            <>
                                                <div className="cal-cell__total">
                                                    ₹{dayTotal.toLocaleString("en-IN")}
                                                </div>
                                                <div className="cal-cell__expenses">
                                                    {dayExp.map((e) => (
                                                        <div key={e.id} className="cal-expense">
                                                            <span
                                                                className="cal-expense__dot"
                                                                style={{ background: CATEGORY_COLORS[e.category] ?? "#9CA3AF" }}
                                                            />
                                                            <span className="cal-expense__desc">{e.description}</span>
                                                            <span className="cal-expense__amt">
                                                                ₹{e.amount.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="cal-legend">
                            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                                <div key={cat} className="cal-legend__item">
                                    <span className="cal-legend__dot" style={{ background: color }} />
                                    <span className="cal-legend__label">{cat}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}