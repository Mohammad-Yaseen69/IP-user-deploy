// shortcut: totals only the earliest unpaid bill's currency, convert to one currency when users save bills in several
export const summariseUnpaid = (bills, now = new Date()) => {
  const due = bills
    .filter((bill) => bill.status === "due")
    .sort((a, b) => new Date(a.statement.due_date || 0) - new Date(b.statement.due_date || 0));
  const currency = due[0]?.statement.balance.currency;
  const total = due
    .filter((bill) => bill.statement.balance.currency === currency)
    .reduce((sum, bill) => sum + bill.statement.balance.value, 0);

  return {
    count: due.length,
    total,
    currency,
    nextDue: due[0]?.statement.due_date,
    month: buildMonthTimeline(bills, now),
  };
};

const MAX_TIMELINE_BILLS = 4;

// One point per bill paid or due this month, plus today; the fill covers the days already gone.
const buildMonthTimeline = (bills, now) => {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const positionOf = (day) => ((day - 1) / (daysInMonth - 1)) * 100;
  const dayInThisMonth = (date) => {
    if (!date) return null;
    const value = new Date(date);
    return value.getMonth() === now.getMonth() && value.getFullYear() === now.getFullYear()
      ? value.getDate()
      : null;
  };

  const today = now.getDate();
  const dueToday = [];
  const paidToday = [];
  const points = [];
  bills.forEach((bill) => {
    const paidDay = bill.status === "paid" ? dayInThisMonth(bill.last_paid_at) : null;
    const dueDay = bill.status === "due" ? dayInThisMonth(bill.statement.due_date) : null;
    if (dueDay === today) dueToday.push(bill.nickname);
    else if (paidDay === today) paidToday.push(bill.nickname);
    else if (dueDay) points.push({ id: bill.id, day: dueDay, name: bill.nickname, tone: "due" });
    else if (paidDay) points.push({ id: bill.id, day: paidDay, name: bill.nickname, tone: "paid" });
  });

  const monthName = now.toLocaleDateString(undefined, { month: "short" });
  const ticks = [1, 8, 16, 23, daysInMonth].map((day) => ({
    day,
    position: positionOf(day),
    label: day === 1 || day === daysInMonth ? `${day} ${monthName}` : String(day),
  }));

  return {
    fill: positionOf(today),
    ticks,
    points: [
      ...points
        .sort((a, b) => a.day - b.day)
        .slice(0, MAX_TIMELINE_BILLS)
        .map((point) => ({
          ...point,
          label: `${point.day} · ${point.name}`,
          position: positionOf(point.day),
        })),
      // A bill paid today takes the today point so the two labels never sit on top of each other.
      {
        id: "today",
        tone: paidToday.length ? "paid" : "today",
        isToday: true,
        position: positionOf(today),
        label: ["Today", ...(paidToday.length ? paidToday : dueToday).slice(0, 1)].join(" · "),
      },
    ],
  };
};
