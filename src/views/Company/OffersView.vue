<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import type { Offer } from "@/types/offer";
import { useRoute } from "vue-router";
import BaseButton from "@/components/BaseButton.vue";

const offers = ref<Offer[]>([]);

const route = useRoute();

const fetchOffers = async () => {
  const companyIdFromRoute = route.params.id;
  const response = await axios.get(
    `/api/companies/${companyIdFromRoute}/offers`
  );
  offers.value = response.data;
};

// Split the offers into two arrays: past and future
const splitOffers = computed(() => {
  const now = new Date();
  const pastOffers = offers.value.filter((offer) => {
    return new Date(offer.suggested_out_of_office_at) < now;
  });
  const futureOffers = offers.value.filter((offer) => {
    return new Date(offer.suggested_out_of_office_at) >= now;
  });
  return { pastOffers, futureOffers };
});

onMounted(() => {
  fetchOffers();
});
</script>
<template>
  <div>
    <hgroup>
      <h1>{{ $t("Offers") }}</h1>
    </hgroup>
    <div class="actions">
      <base-button to="offers/create">{{ $t("Create offer") }}</base-button>
    </div>
  </div>
  <h2>{{ $t("Current and future offers") }}</h2>
  <div class="overflow-auto full-width">
    <table class="striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tour Name</th>
          <th>Starts at</th>
          <th>Ends at</th>
          <th>Pax</th>
          <th>Guides</th>
          <th>Resources</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="offer in splitOffers.futureOffers" :key="offer.id">
          <td>{{ offer.id }}</td>
          <td>{{ offer.tour.name }}</td>
          <td>{{ new Date(offer.starts_at).toLocaleString() }}</td>
          <td>{{ new Date(offer.ends_at).toLocaleString() }}</td>
          <td>
            <router-link
              v-for="pax in offer.pax"
              :key="pax.id"
              :to="'/offers/' + offer.id + '/passengers/' + pax.id + '/edit'"
              >{{
                pax.primary.name +
                " " +
                pax.primary.surname +
                " " +
                " (" +
                pax.total +
                " guests)"
              }}<br
            /></router-link>
            <router-link :to="'/offers/' + offer.id + '/passengers/create'">{{
              $t("Add pax")
            }}</router-link>
          </td>
          <td>
            <template v-if="offer.assigned_guides.length">
              <router-link
                v-for="guide in offer.assigned_guides"
                :to="'/users/' + guide.user.id"
                :key="guide.id"
                >{{ guide.user.name }}</router-link
              >
            </template>
            <template v-else>
              {{
                "No guides assigned - contacted " +
                offer.sent_guide_requests_count +
                " guides"
              }}
            </template>
          </td>
          <td>
            {{
              offer.assigned_company_resources
                .map((resource) => resource.name)
                .join(", ")
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <h2>{{ $t("Past offers") }}</h2>
  <div class="overflow-auto full-width">
    <table class="striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tour Name</th>
          <th>Starts at</th>
          <th>Ends at</th>
          <th>Pax</th>
          <th>Guides</th>
          <th>Resources</th>
          <th>Hourly guide rate</th>
          <th>Total cost</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="offer in splitOffers.pastOffers" :key="offer.id">
          <td>{{ offer.id }}</td>
          <td>{{ offer.tour.name }}</td>
          <td>{{ new Date(offer.starts_at).toLocaleString() }}</td>
          <td>{{ new Date(offer.ends_at).toLocaleString() }}</td>
          <td>
            <span v-for="pax in offer.pax" :key="pax.id"
              >{{
                pax.primary.name +
                " " +
                pax.primary.surname +
                " " +
                " (" +
                pax.total +
                " guests)"
              }}<br
            /></span>
          </td>
          <td>
            {{
              offer.assigned_guides.length
                ? offer.assigned_guides
                    .map((guide) => guide.user.name)
                    .join(",")
                : "No guides assigned - contacted " +
                  offer.sent_guide_requests_count +
                  " guides"
            }}
          </td>
          <td>
            {{
              offer.assigned_company_resources
                .map((resource) => resource.name)
                .join(", ")
            }}
          </td>
          <td>
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(offer.hourly_rate_eur_cents / 100)
            }}
          </td>
          <td v-if="offer.total_cost && offer.assigned_guides.length">
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(offer.total_cost / 100)
            }}
          </td>
          <td v-else>-</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
th {
  position: sticky;
  top: 0;
}
table {
  position: relative;
  border-collapse: collapse;
}
</style>
