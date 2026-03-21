export function normalizeDateToWeek(date: string): string | null {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return null;
  }

  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = local.getDay(); // 0 = Sunday
  local.setDate(local.getDate() - day);

  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(local.getDate()).padStart(2, "0");

  return `${year}-${month}-${dayOfMonth}`;
}
