// Anchor date: A known Monday that starts a pay period
// December 1, 2025 is a Monday and the start of a pay period
const ANCHOR_DATE = new Date('2025-12-01T00:00:00');

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
  return date.toISOString().split('T')[0];
}

/**
 * Get the current pay period based on today's date
 * Pay periods are 14 days (2 weeks), running Monday-Sunday
 */
export function getCurrentPayPeriod() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getPayPeriodForDate(today);
}

/**
 * Get the pay period that contains the given date
 */
export function getPayPeriodForDate(date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const anchor = new Date(ANCHOR_DATE);
  anchor.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceAnchor = Math.floor((targetDate - anchor) / msPerDay);

  // Each pay period is 14 days
  let periodsSinceAnchor = Math.floor(daysSinceAnchor / 14);

  // Handle dates before anchor (negative periods)
  if (daysSinceAnchor < 0) {
    periodsSinceAnchor = Math.floor(daysSinceAnchor / 14);
  }

  // Calculate period start
  const periodStart = new Date(anchor);
  periodStart.setDate(periodStart.getDate() + (periodsSinceAnchor * 14));

  // Week 1: Days 0-6 (Monday-Sunday)
  const week1Start = new Date(periodStart);
  const week1End = new Date(periodStart);
  week1End.setDate(week1End.getDate() + 6);

  // Week 2: Days 7-13 (Monday-Sunday)
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

/**
 * Check if a pay period is the current one
 */
export function isCurrentPeriod(payPeriod) {
  const current = getCurrentPayPeriod();
  return toISODateString(payPeriod.periodStart) === toISODateString(current.periodStart);
}

/**
 * Get display label for a pay period
 */
export function getPayPeriodLabel(payPeriod) {
  return formatDateRange(payPeriod.periodStart, payPeriod.periodEnd);
}
