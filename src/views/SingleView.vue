<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { Resource } from "@/types/tour.js";
import MainScreen from "@/components/MainScreen.vue";
import {
  filterOutCancelledPickups,
  getEarliestPickup,
  getTimeStringFromMinutes,
  getTourStartDayOfWeek,
  getTourStartTime,
  nextTourResourceRequiredOn,
  previousTourResourceRequiredOn,
  sortPickupTimes,
  sortToursByPickupTime,
} from "@/helpers/tourHelpers";
import { useRouter } from "vue-router";
import { relativeRealtime } from "@/helpers/relativeRealtime";
import { useUserStore } from "@/stores/user";
import { formatDateTimeToTime } from "@/helpers/date";
import type { Offer } from "@/types/offer";
import { getUsersTours } from "@/api/user";
import { getDriveTime } from "@/api/drive.time";

const router = useRouter();

const data = ref<Offer[]>([]);
const isLoading = ref(true);

const driveTimeFromLocationToOffice = ref<number | null>(null);

const userStore = useUserStore();

const getData = async (setLoadingToTrue = true): Promise<void> => {
  if (setLoadingToTrue) {
    console.log("Called");
    isLoading.value = true;
  }
  const offers = await getUsersTours({ userId: userStore.user?.id });
  data.value = sortToursByPickupTime(offers);
  isLoading.value = false;
};

const getDriveTimeToOffice = () => {
  // If no data, return
  if (!data.value.length) {
    return;
  }

  const success = async (pos: GeolocationCoordinates) => {
    const destinationLat = data.value[0].company?.latitude;
    const destinationLng = data.value[0].company?.longitude;

    if (!destinationLat || !destinationLng) {
      return;
    }

    const destination = {
      lat: destinationLat,
      lng: destinationLng,
    };

    const getData = {
      origin: {
        lat: pos.latitude,
        lng: pos.longitude,
      },
      destination,
    };

    driveTimeFromLocationToOffice.value = await getDriveTime(getData);
  };

  const error = () => {
    console.log("error");
  };

  userStore.fetchAndSaveUserLocation().then((location) => {
    if (location) {
      success(location);
    } else {
      error();
    }
  });
};

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    getData(false);
    getDriveTimeToOffice();
  }
};

onMounted(async () => {
  await getData();
  getDriveTimeToOffice();
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});

const getIsLateUrlWhatsappMessage = (
  name: string,
  time: string,
  phone?: string
) => {
  const message = `Hi - guest "${name}" has not shown up at ${time} as planned. Please call them${
    phone ? ` ${phone}` : ""
  }.`;

  return `https://wa.me/358407583316?text=${encodeURIComponent(message)}`;
};

const selectedTourIndex = ref<number | null>(
  localStorage.getItem("selectedTour")
    ? parseInt(localStorage.getItem("selectedTour")!)
    : null
);

const selectedTour = computed(() => {
  if (selectedTourIndex.value === null) {
    return null;
  }

  return data.value[selectedTourIndex.value];
});

const selectedScreen = ref(
  localStorage.getItem("selectedScreen")
    ? parseInt(localStorage.getItem("selectedScreen")!)
    : 0
);

watch(selectedTourIndex, (value) => {
  selectedScreen.value = 0;
  localStorage.setItem("selectedScreen", "0");
  if (value === null) {
    localStorage.removeItem("selectedTour");
    return;
  }
  localStorage.setItem("selectedTour", `${value}`);
  getDriveTimeToOffice();
});

const goToNextScreen = () => {
  // If we are moving from the first screen, save the time we started
  if (selectedScreen.value === 0) {
    localStorage.setItem("tourStartTime", new Date().toISOString());
  }
  selectedScreen.value += 1;
  // Save the selected screen to localstorage
  localStorage.setItem("selectedScreen", selectedScreen.value.toString());

  // If the next screen is the last screen, save the time we finished
  if (selectedScreen.value === screens.value.length - 1) {
    localStorage.setItem("tourEndTime", new Date().toISOString());
  }
  getDriveTimeToOffice();
};

const goToPreviousScreen = () => {
  selectedScreen.value -= 1;
  // Save the selected screen to localstorage
  localStorage.setItem("selectedScreen", selectedScreen.value.toString());
};

// Compute the possible screens. The screens are: Pre-working, working, pickups (variable), on-tour, post-tour
const screens = computed(() => {
  if (!selectedTour.value || !selectedTour.value.pax) {
    return [];
  }

  const suggestedStartTime = formatDateTimeToTime(
    selectedTour.value.suggested_in_office_at
  );

  const suggestedStartTimeDate = new Date(
    selectedTour.value.suggested_in_office_at
  );

  const pickupScreens = sortPickupTimes(selectedTour.value)
    .pax.map((pax) => {
      if (!selectedTour.value || pax.cancelled_at) return;

      const pickupTime = new Date(
        `${new Date().toDateString()} ${pax.pickup.time}`
      );

      return {
        title: `${pax.pickup.time} @${pax.pickup.location?.name ?? "Office"}`,
        subtitle: pax.pickup.minutesAwayFromOffice
          ? pax.pickup.minutesAwayFromOffice + " min drive"
          : relativeRealtime(pickupTime),
        justify: "space-between",
        content: [
          ...selectedTour.value.pax
            .filter(
              (tour) =>
                tour.pickup.time === pax.pickup.time &&
                tour.pickup.location?.name === pax.pickup.location?.name
            )
            .map(
              (tour) =>
                `${tour.primary.name} (${tour.total} guests from ${
                  tour.primary.phoneCountryCode || "an undetermined place"
                })`
            ),
          ...selectedTour.value.pax
            .filter(
              (tour) =>
                tour.pickup.time === pax.pickup.time &&
                tour.pickup.location?.name === pax.pickup.location?.name
            )
            .map((tour) => tour.notes),
        ],
        headerActions: [
          pax.pickup.location?.name?.toLowerCase() !== "office"
            ? {
                title: "Open Google Maps",
                action: () => {
                  window.open(
                    "https://www.google.com/maps/dir/?api=1&destination=" +
                      pax.pickup.location?.name +
                      "+rovaniemi&travelmode=driving",
                    "_blank"
                  );
                },
              }
            : null,
        ].filter(Boolean),
        actions: [
          {
            title: "Confirm pickup and start next one",
            action: () => {
              goToNextScreen();
            },
          },
        ],
      };
    })
    // Remove duplicates
    .filter(
      (item, index, self) =>
        item && self.findIndex((i) => i?.title === item.title) === index
    );

  const firstPickupTimeDate = new Date(
    selectedTour.value.leave_for_earliest_pickup_at
  );

  const firstPickupTime = formatDateTimeToTime(firstPickupTimeDate);

  const lastResourceTour = (resource: Resource) => {
    if (!selectedTour.value) return null;
    const prevTour = previousTourResourceRequiredOn(
      data.value,
      selectedTour.value,
      resource.type,
      resource.name
    );

    if (!prevTour) return null;

    console.log(prevTour);

    // @todo
    return `No info`;
  };

  const formattedResources = `${selectedTour.value.resources?.map(
    (resource) => ` ${resource.type} ${resource.name}`
  )}`;

  const resourcesRequired = (() => {
    const nextTour = nextTourResourceRequiredOn(
      data.value,
      selectedTour.value,
      "van",
      selectedTour.value.resources?.find((resource) => resource.type === "van")
        ?.name || ""
    );

    const van = selectedTour.value.resources?.find(
      (resource) => resource.type === "van"
    )?.name;

    if (nextTour) {
      const tourName = nextTour.tour.name;
      // @todo
      const primaryGuide = "Primary guide";
      const finishTime = getTourStartTime(nextTour, true, true);

      return van
        ? `Van ${
            selectedTour.value.resources?.find(
              (resource) => resource.type === "van"
            )?.name
          } required for ${tourName} at ${finishTime} with ${primaryGuide}`
        : "";
    }

    return van ? `Last tour today for van ${van}` : "";
  })();

  const totalGuests = `Total ${selectedTour.value.pax.reduce(
    (acc, pax) => acc + (pax.cancelled_at ? 0 : pax.total),
    0
  )} guests - ${filterOutCancelledPickups(selectedTour.value).pax.map(
    (pax) =>
      ` ${pax.total} ${
        (pax && pax.primary && pax.primary.phoneCountryCode) || "undetermined"
      }` || ""
  )}
          `;

  const screens = [
    {
      title: `${suggestedStartTime} @Office`,
      subtitle: `Start ${relativeRealtime(suggestedStartTimeDate)}`,
      justify: "space-between",
      headerActions: [
        {
          title: "Open Company Page",
          action: () => {
            router.push(`/companies/${selectedTour.value?.company?.id}`);
          },
        },
      ],
      content: [
        selectedTour.value.tour.name,
        `Tour runs ${formatDateTimeToTime(
          selectedTour.value.starts_at
        )} - ${formatDateTimeToTime(selectedTour.value.ends_at)}`,
        totalGuests,
        `${
          filterOutCancelledPickups(selectedTour.value).pax.length
        } pickups, leave for first one at ${firstPickupTime} towards ${
          getEarliestPickup(selectedTour.value)?.location?.name ?? "office"
        }`,
        formattedResources,
        `${driveTimeFromLocationToOffice.value} min drive to office from current location`,
      ],
      actions: [
        // {
        //   title: "Add to calendar",
        //   action: () => {
        //     const url
        //   },
        // },
        {
          title: "Start tour",
          action: () => {
            goToNextScreen();
          },
        },
      ],
    },
    {
      title: `${firstPickupTime} leave for pickups`,
      subtitle: `Leave ${relativeRealtime(firstPickupTimeDate)}`,
      justify: "space-between",
      content: [
        totalGuests,
        // Food restrictions
        `${
          selectedTour.value.pax
            .map((tour) =>
              tour.foodPreferences ? ` ${tour.foodPreferences}` : false
            )
            .filter(Boolean)
            .toString()
            .trim() || "No known dietary restrictions"
        }`,
        `First pickup at ${
          selectedTour.value.pax[0]?.pickup.time ??
          getTourStartTime(selectedTour.value)
        } at ${selectedTour.value.pax[0]?.pickup.location?.name ?? "office"}`,
        formattedResources,
      ],
      headerActions: [],
      actions: [
        {
          title: "Start pickups",
          action: () => {
            goToNextScreen();
          },
        },
      ],
    },
    ...pickupScreens,
    {
      title: `${formatDateTimeToTime(selectedTour.value.ends_at)} @Office`,
      subtitle: `End ${relativeRealtime(new Date(selectedTour.value.ends_at))}`,
      justify: "space-between",
      content: [
        selectedTour.value.tour.name,
        resourcesRequired,
        `${driveTimeFromLocationToOffice.value} min drive to office from current location`,
        `Picked up at ${
          filterOutCancelledPickups(selectedTour.value)
            .pax.filter((item) => item.pickup.location?.name !== "Office")
            .map((item) => item.pickup.location?.name)
            .join(", ") || "office"
        }`,
      ],
      headerActions: [],
      actions: [
        {
          title: "End tour",
          action: () => {
            goToNextScreen();
          },
        },
      ],
    },
    {
      title: `${formatDateTimeToTime(
        selectedTour.value.suggested_in_office_at
      )} - ${formatDateTimeToTime(
        selectedTour.value.suggested_out_of_office_at
      )}`,
      subtitle:
        getTimeStringFromMinutes(selectedTour.value.total_duration_in_minutes) +
        " worked",
      justify: "center",
      content: [
        selectedTour.value.tour.name,
        // Determine when the van resource is next needed
        resourcesRequired,
        "Estimated earnings: €" +
          ((selectedTour.value.total_cost_per_guide ?? 0) / 100).toFixed(2),
      ],
      headerActions: [],
      actions: [
        {
          title: "Go to next tour",
          action: () => {
            goToNextScreen();
          },
        },
      ],
    },
  ];

  return screens;
});

const activeScreen = computed(() => {
  return screens.value[selectedScreen.value];
});

const selectTour = (index: number | null) => {
  selectedTourIndex.value = index;
  selectedScreen.value = 0;
  getDriveTimeToOffice();
};
</script>

<template>
  <h1 v-if="!activeScreen">{{ $t("Your Tours") }}</h1>
  <main-screen
    id="default"
    v-if="!isLoading && activeScreen"
    :title="activeScreen.title"
    :subtitle="activeScreen.subtitle"
    :justify="activeScreen.justify"
  >
    <template v-if="activeScreen.headerActions.length > 0" #headerActions>
      <button
        v-for="action in activeScreen.headerActions"
        @click="action?.action"
        :key="action?.title"
        class="outline"
      >
        {{ action?.title }}
      </button>
    </template>
    <ul>
      <template v-for="(content, index) in activeScreen.content" :key="index">
        <li v-if="content">
          {{ content }}
        </li>
      </template>
    </ul>
    <template v-if="activeScreen.actions" #actions>
      <button
        v-for="action in activeScreen.actions"
        @click="action.action"
        :key="action.title"
      >
        {{ action.title }}
      </button>
      <a v-if="selectedScreen > 0" href="#" @click="goToPreviousScreen"
        >Go back</a
      >
      <a v-else href="#" @click="selectTour(null)"> Choose another tour </a>
    </template>
  </main-screen>
  <div v-else-if="!isLoading">
    <template v-for="(option, index) in data" :key="option.offer_id">
      <input
        @click="selectTour(index)"
        type="button"
        :value="
          getTourStartDayOfWeek(option) +
          ' ' +
          formatDateTimeToTime(option.suggested_in_office_at) +
          ' - ' +
          option.tour.name
        "
      />
    </template>
  </div>
  <article v-else :aria-busy="true"></article>
</template>
<style scoped>
.two-column-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
