import type { Pickup, Resource, Tour } from "@/types/tour";

export const getTimeStringFromMinutes = (inputMinutes: number): string => {
  let hours = Math.floor(inputMinutes / 60);

  if (hours >= 24) {
    // If the hours are 24, 48, 72, etc., we want to show the time as 00:00
    hours = hours % 24;
  }

  const minutes = inputMinutes % 60;

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

export const getTimeAsMinutesFromMidnight = (time: string): number => {
  const timeAsArray = time.split(":");
  return parseInt(timeAsArray[0]) * 60 + parseInt(timeAsArray[1]);
};

export const filterOutCancelledPickups = (tour: Tour): Tour => {
  const newTourPax = tour.pax.filter((pax) => !pax.cancelled_at);
  return {
    ...tour,
    pax: newTourPax,
  };
};

export const sortPickupTimes = (tour: Tour, ascending = true): Tour => {
  // We have to create a new array to avoid mutating the original tour
  const pax = [...tour.pax].sort((a, b) => {
    const aTime = a.pickup.time
      ? getTimeAsMinutesFromMidnight(a.pickup.time)
      : 0;
    const bTime = b.pickup.time
      ? getTimeAsMinutesFromMidnight(b.pickup.time)
      : 0;

    if (aTime < bTime) {
      return ascending ? -1 : 1;
    } else if (aTime > bTime) {
      return ascending ? 1 : -1;
    }

    return 0;
  });

  return {
    ...tour,
    pax,
  };
};

// Night time work is considered after 18:00

// @todo write test
export const sortToursByPickupTime = (
  tours: Tour[],
  ascending = true
): Tour[] => {
  return [...tours].sort((a, b) => {
    const earliestPickup = getEarliestPickupTime(a);
    if (!earliestPickup) {
      return 0;
    }

    const earliestPickupB = getEarliestPickupTime(b);
    if (!earliestPickupB) {
      return 0;
    }

    const aTime = getTimeAsMinutesFromMidnight(earliestPickup);
    const bTime = getTimeAsMinutesFromMidnight(earliestPickupB);

    if (aTime < bTime) {
      return ascending ? -1 : 1;
    } else if (aTime > bTime) {
      return ascending ? 1 : -1;
    }

    return 0;
  });
};

// @todo test the cancelled pax works
export const getEarliestPickup = (tour: Tour): Pickup | undefined => {
  const sortedTour = sortPickupTimes(filterOutCancelledPickups(tour));
  return sortedTour.pax[0]?.pickup;
};

export const getEarliestPickupTime = (tour: Tour): string | undefined => {
  return getEarliestPickup(tour)?.time ?? undefined;
};

export const getLatestPickup = (tour: Tour): Pickup | undefined => {
  const sortedTour = sortPickupTimes(filterOutCancelledPickups(tour), false);
  return sortedTour.pax[0]?.pickup;
};

export const getLatestPickupTime = (tour: Tour): string | undefined => {
  return getLatestPickup(tour)?.time ?? undefined;
};

export const getTotalPickupDurationInMinutes = (tour: Tour): number => {
  const earliestTime = getEarliestPickupTime(tour);
  const latestTime = getLatestPickupTime(tour);

  if (!earliestTime || !latestTime) {
    return 0;
  }

  const earliestTimeAsMinutesFromMidnight =
    getTimeAsMinutesFromMidnight(earliestTime);
  const latestTimeAsMinutesFromMidnight =
    getTimeAsMinutesFromMidnight(latestTime);

  return latestTimeAsMinutesFromMidnight - earliestTimeAsMinutesFromMidnight;
};

/**
Returns the expected tour start time. If pickups are not included in the tour duration, the tour start time will be the latest pickup time. If pickups are included in the tour duration, the tour start time will be the earliest pickup time.
*/
export const getTourStartTime = (
  tour: Tour,
  includePickupsInDuration = false,
  includePrepTime = false,
  includePickupDriveTime = false
): string | undefined => {
  const tourStartTime = includePickupsInDuration
    ? getEarliestPickupTime(tour)
    : getLatestPickupTime(tour);

  if (!tourStartTime) {
    return new Date(tour.starts_at).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  let tourStartTimeAsMinutesFromMidnight =
    getTimeAsMinutesFromMidnight(tourStartTime);

  // @todo write test for this
  if (includePickupDriveTime) {
    const driveTimeToFirstPickup = includePickupsInDuration
      ? getEarliestPickup(tour)?.minutesAwayFromOffice
      : getLatestPickup(tour)?.minutesAwayFromOffice;

    tourStartTimeAsMinutesFromMidnight -= driveTimeToFirstPickup ?? 0;
  }

  if (includePrepTime) {
    const prepTime = tour.tour.prepMinutes;

    tourStartTimeAsMinutesFromMidnight -= prepTime;

    return getTimeStringFromMinutes(tourStartTimeAsMinutesFromMidnight);
  }

  return tourStartTime;
};

export const getTourStartDayOfWeek = (tour: Tour): string => {
  return new Date(tour.starts_at).toLocaleString(undefined, {
    weekday: "short",
  });
};

export const getSuggestedTimeInOffice = (tour: Tour): string | undefined => {
  return getTourStartTime(tour, true, true, true);
};

export const getSuggestedLeaveTimeForFirstPickup = (tour: Tour): string => {
  // Get the first pickup time, subtract the drive time to the first pickup, and return the result
  const sortedTour = sortPickupTimes(tour);
  const firstPickup = sortedTour.pax[0]?.pickup;

  const firstPickupTime = firstPickup?.time;

  if (!firstPickupTime) {
    return new Date(tour.starts_at).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const firstPickupTimeAsMinutesFromMidnight =
    getTimeAsMinutesFromMidnight(firstPickupTime);
  const minutesToFirstPickup = firstPickup.minutesAwayFromOffice;
  const suggestedLeaveTimeForFirstPickupAsMinutesFromMidnight =
    firstPickupTimeAsMinutesFromMidnight - (minutesToFirstPickup ?? 0);

  return getTimeStringFromMinutes(
    suggestedLeaveTimeForFirstPickupAsMinutesFromMidnight
  );
};

export const getTourEndTime = (
  tour: Tour,
  includePickupsInDuration = false,
  includeCleanupTime = false
): string | undefined => {
  const tourStartTime = getTourStartTime(tour, includePickupsInDuration);
  const tourDuration = tour.tour.minutesDuration;

  if (!tourStartTime) {
    return;
  }

  const tourStartTimeAsMinutesFromMidnight =
    getTimeAsMinutesFromMidnight(tourStartTime);
  const tourEndTimeAsMinutesFromMidnight =
    tourStartTimeAsMinutesFromMidnight + tourDuration;

  if (includeCleanupTime) {
    const cleanupTime = tour.tour.cleanupMinutes;
    const tourEndTimeWithCleanupTimeAsMinutesFromMidnight =
      tourEndTimeAsMinutesFromMidnight + cleanupTime;

    return getTimeStringFromMinutes(
      tourEndTimeWithCleanupTimeAsMinutesFromMidnight
    );
  }

  return getTimeStringFromMinutes(tourEndTimeAsMinutesFromMidnight);
};

// Computes the total worked time, from the arrival to the office to the end of the tour (including cleanup time)
export const getTotalWorkedTime = (tour: Tour): number => {
  const suggestedTimeInOffice = getSuggestedTimeInOffice(tour);
  const tourEndTime = getTourEndTime(tour, false, true);

  if (!suggestedTimeInOffice || !tourEndTime) {
    return 0;
  }

  const suggestedTimeInOfficeAsMinutesFromMidnight =
    getTimeAsMinutesFromMidnight(suggestedTimeInOffice);
  let tourEndTimeAsMinutesFromMidnight =
    getTimeAsMinutesFromMidnight(tourEndTime);

  if (
    suggestedTimeInOfficeAsMinutesFromMidnight >
    tourEndTimeAsMinutesFromMidnight
  ) {
    tourEndTimeAsMinutesFromMidnight += 1440;
  }
  return (
    tourEndTimeAsMinutesFromMidnight -
    suggestedTimeInOfficeAsMinutesFromMidnight
  );
};

export const getStringTimeAsTodaysDate = (time: string): Date => {
  const timeAsArray = time.split(":");
  const hours = parseInt(timeAsArray[0]);
  const minutes = parseInt(timeAsArray[1]);

  const now = new Date();
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  //   Set seconds and milliseconds to 0
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

export const getToursForResource = (
  tours: Tour[],
  resourceName: Resource["name"],
  resource: Resource["type"] = "van",
  caseSensitive = false
): Tour[] => {
  return tours.filter(
    (item) =>
      item.resources?.some((r) => {
        if (caseSensitive === false) {
          return r.name.toLowerCase() === resourceName.toLowerCase();
        }

        return r.name === resourceName;
      }) && item.resources?.some((r) => r.type === resource)
  );
};

// @todo write test
export const nextTourResourceRequiredOn = (
  tours: Tour[],
  tour: Tour,
  resource: Resource["type"] = "van",
  resourceName: Resource["name"]
): Tour | null => {
  const toursForResource = getToursForResource(tours, resourceName, resource);
  const sortedTours = sortToursByPickupTime(toursForResource);

  const tourIndex = sortedTours.findIndex((t) => t === tour);
  const nextTour = sortedTours[tourIndex + 1];

  if (nextTour) {
    return nextTour;
  }

  return null;
};

export const previousTourResourceRequiredOn = (
  tours: Tour[],
  tour: Tour,
  resource: Resource["type"] = "van",
  resourceName: Resource["name"]
): Tour | null => {
  const toursForResource = getToursForResource(tours, resourceName, resource);
  const sortedTours = sortToursByPickupTime(toursForResource, false);

  const tourIndex = sortedTours.findIndex((t) => t === tour);
  const previousTour = sortedTours[tourIndex + 1];

  if (previousTour) {
    return previousTour;
  }

  return null;
};
