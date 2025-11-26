// Anchor date: A known Sunday that starts a pay period
// November 16, 2025 is a Sunday and the start of a pay period
const ANCHOR_DATE = new Date('2025-11-16T00:00:00');

/**
 * Format a date as "Mon DD, YYYY" or "Mon DD"
 */
export function formatDate(date, includeYear = false) {
  const options = { month: 'short', day: 'numeric' };
  if (includeYear) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date range as "Mon DD - Mon DD, YYYY"
 */
export function formatDateRange(start, end) {
  const startStr = formatDate(start);
  const endStr = formatDate(end, true);
  return `${startStr} - ${endStr}`;
}

/**
 * Format a date as ISO date string (YYYY-MM-DD)
 */
export function toISODateString(date) {
  // Use local date to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the current pay period based on today's date
 * Pay periods are 14 days (2 weeks), running Sunday-Saturday
 */
export function getCurrentPayPeriod() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getPayPeriodForDate(today);
}

/**
 * Get the pay period that contains the given date
 * Pay periods run Sunday-Saturday for 2 weeks
 */
export function getPayPeriodForDate(date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const anchor = new Date(ANCHOR_DATE);
  anchor.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceAnchor = Math.floor((targetDate - anchor) / msPerDay);

  // Each pay period is 14 days
  const periodsSinceAnchor = Math.floor(daysSinceAnchor / 14);

  // Calculate period start (always a Sunday)
  const periodStart = new Date(anchor);
  periodStart.setDate(periodStart.getDate() + (periodsSinceAnchor * 14));

  // Week 1: Days 0-6 (Sunday-Saturday)
  const week1Start = new Date(periodStart);
  const week1End = new Date(periodStart);
  week1End.setDate(week1End.getDate() + 6);

  // Week 2: Days 7-13 (Sunday-Saturday)
  const week2Start = new Date(periodStart);
  week2Start.setDate(week2Start.getDate() + 7);
  const week2End = new Date(periodStart);
  week2End.setDate(week2End.getDate() + 13);

  return {
    periodStart: week1Start,
    periodEnd: week2End,
    week1: { start: week1Start, end: week1End },
    week2: { start: week2Start, end: week2End }
  };
}

/**
 * Get the pay period key (used for database lookups)
 * Returns the ISO date string of the period start
 */
export function getPayPeriodKey(payPeriod) {
  return toISODateString(payPeriod.periodStart);
}

/**
 * Check if the current date is in week 1 or week 2 of the pay period
 */
export function getCurrentWeek(payPeriod) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const week1End = new Date(payPeriod.week1.end);
  week1End.setHours(23, 59, 59, 999);

  return today <= week1End ? 1 : 2;
}

/**
 * Get the previous pay period
 */
export function getPreviousPayPeriod(payPeriod) {
  const prevStart = new Date(payPeriod.periodStart);
  prevStart.setDate(prevStart.getDate() - 14);
  return getPayPeriodForDate(prevStart);
}

/**
 * Get the next pay period
 */
export function getNextPayPeriod(payPeriod) {
  const nextStart = new Date(payPeriod.periodStart);
  nextStart.setDate(nextStart.getDate() + 14);
  return getPayPeriodForDate(nextStart);
}

/**
 * Check if a pay period is the current one
 */
export function isCurrentPeriod(payPeriod) {
  const current = getCurrentPayPeriod();
  return toISODateString(payPeriod.periodStart) === toISODateString(current.periodStart);
}

/**
 * Check if a pay period is in the future
 */
export function isFuturePeriod(payPeriod) {
  const current = getCurrentPayPeriod();
  return payPeriod.periodStart > current.periodStart;
}

/**
 * Get display label for a pay period
 */
export function getPayPeriodLabel(payPeriod) {
  return formatDateRange(payPeriod.periodStart, payPeriod.periodEnd);
}

/**
 * Get past pay periods (for history view)
 */
export function getPastPayPeriods(count = 6) {
  const current = getCurrentPayPeriod();
  const periods = [];

  for (let i = 1; i <= count; i++) {
    const pastStart = new Date(current.periodStart);
    pastStart.setDate(pastStart.getDate() - (i * 14));
    periods.push(getPayPeriodForDate(pastStart));
  }

  return periods;
}
