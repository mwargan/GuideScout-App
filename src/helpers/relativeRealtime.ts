import i18n from "../locales/i18n";

import { onUnmounted, ref } from "vue";

/**
 * Automatically updates the relative time string as the time changes.
 *
 * @param date - The date to compare to the current date. Can be a Date object or a string.
 * @param interval - Optional update interval in milliseconds (default is 60 seconds).
 * @returns A ref string representing the relative time that updates in real-time.
 */
export const relativeRealtime = (date: Date | string, interval = 60000) => {
  if (typeof date === "string") {
    date = new Date(date);
  }

  const relativeTimeString = ref(relativeTime(date));
  const updateRelativeTime = () => {
    relativeTimeString.value = relativeTime(date);
  };

  const timer = setInterval(updateRelativeTime, interval);

  onUnmounted(() => {
    clearInterval(timer);
  });

  return relativeTimeString.value;
};

/**
 * This function takes a Date object, and using new Intl.RelativeTimeFormat, returns a string representing the relative time between the input date and the current date. It returns a string like "in 5 days" or "3 months ago" based on the difference between the input date and the current date.
 *
 * @param date - The date to compare to the current date. Can be a Date object or a string. If string, it should be in a format like "2021-08-01T12:00:00Z"
 * @returns A string representing the relative time between the input date and the current date
 */
export const relativeTime = (date: Date | string): string => {
  if (typeof date === "string") {
    date = new Date(date);
  }

  const rtf = new Intl.RelativeTimeFormat(i18n.global.locale.value, {
    numeric: "auto",
  });

  const diff = date.getTime() - Date.now();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);

  const absoluteMinutes = Math.abs(minutes);
  const absoluteHours = Math.abs(hours);
  const absoluteDays = Math.abs(days);

  // Less than 1 hour should be in minutes
  if (absoluteMinutes < 60) {
    return rtf.format(minutes, "minute");
  }

  // Less than 2 day should be in hours
  if (absoluteHours < 49) {
    return rtf.format(hours, "hour");
  }

  // Less than 2 weeks should be in days
  if (absoluteDays < 14) {
    return rtf.format(days, "day");
  }

  // Less than 1 month should be in weeks
  if (absoluteDays < 30) {
    return rtf.format(weeks, "week");
  }

  // Else it should be in months
  return rtf.format(months, "month");
};

export const selectBestUnit = (minutes: number): string => {
  if (minutes % 10080 === 0) {
    return "week";
  } else if (minutes % 1440 === 0) {
    return "day";
  } else if (minutes % 60 === 0) {
    return "hour";
  } else {
    return "minute";
  }
};

export const computeMinutesToUnit = (minutes: number, unit: string): number => {
  switch (unit) {
    case "hour":
      return minutes / 60;
    case "day":
      return minutes / 1440;
    case "week":
      return minutes / 10080;
    default:
      return minutes;
  }
};

/**
 * Uses Intl.NumberFormat to format a number with the current locale and, if provided with unit, appends the unit to the number. It will automatically determine the units to use based on the number. If it is divisible by 60, it will return an hour, if it is divisible by 24, it will return a day, and so on.
 *
 * @param minutes
 * @returns A string representing the number of minutes in a human-readable format
 */
export const formatMinutes = (minutes: number): string => {
  const unit = selectBestUnit(minutes);

  return new Intl.NumberFormat(i18n.global.locale.value, {
    style: "unit",
    unit,
    unitDisplay: "long",
  }).format(computeMinutesToUnit(minutes, unit));
};
