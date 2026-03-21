export function findClosestDate<T>(
  inputDate: string,
  dataset: Record<string, T>
): T | null {
  const target = new Date(inputDate).getTime();
  if (Number.isNaN(target)) {
    return null;
  }

  const datedEntries = Object.keys(dataset)
    .map((dateKey) => ({ dateKey, ts: new Date(dateKey).getTime() }))
    .filter((entry) => !Number.isNaN(entry.ts))
    .sort((a, b) => a.ts - b.ts);

  if (datedEntries.length === 0) {
    return null;
  }

  let closestKey: string | null = null;

  for (const entry of datedEntries) {
    if (entry.ts <= target) {
      closestKey = entry.dateKey;
    } else {
      break;
    }
  }

  if (closestKey) {
    return dataset[closestKey];
  }

  // If input date is earlier than the first known entry, fallback to earliest.
  return dataset[datedEntries[0].dateKey];
}
