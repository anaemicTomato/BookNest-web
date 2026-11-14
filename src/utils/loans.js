export function dueStatus(daysLeft) {
  if (daysLeft < 0) return { label: "Overdue", color: "error" };
  if (daysLeft === 0) return { label: "Due today", color: "warning" };
  if (daysLeft <= 3) {
    return { label: `Due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`, color: "warning" };
  }
  return { label: "On time", color: "success" };
}

export const peso = (amount) => `₱${Number(amount).toFixed(2)}`;