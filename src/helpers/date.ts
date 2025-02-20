export const formatDateTimeForInput = (date: Date | string) => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}T${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export const formatDateTimeToTime = (date: Date | string) => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};
