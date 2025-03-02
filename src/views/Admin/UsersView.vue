<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import axios from "axios";
import type { User } from "@/types/user";
import AttributeDropdown from "@/components/AttributeDropdown.vue";
import MapComponent from "@/components/MapComponent.vue";

const users = ref<User[]>([]);
const attributeIds = ref<string[]>([]);

const fetchUsers = async () => {
  const response = await axios.get("/api/users", {
    params: {
      attributes: attributeIds.value,
    },
  });
  users.value = response.data;
};

const keys = computed<(keyof User)[]>(() => {
  if (!users.value.length) {
    return [];
  }

  return Object.keys(users.value[0]).filter((key) => {
    const value = users.value[0][key as keyof User];
    return typeof value !== "object";
  }) as (keyof User)[];
});

const verifyGuideProfile = async (id: number) => {
  const response = await axios.post(`/api/guide-profiles/${id}/verify`);
  if (response.data) {
    alert("Guide profile verified");
    fetchUsers();
  }
};

const updateUsersAttributes = async (
  userId: number,
  newAttributeIds: string[]
) => {
  await axios.put(`/api/users/${userId}/attributes`, {
    attributeIds: newAttributeIds,
  });

  // Refresh the users list
  await fetchUsers();
};

watch(
  attributeIds,
  () => {
    fetchUsers();
  },
  { immediate: true }
);

function hasCoordinates(user: User): user is Omit<
  User,
  "latitude" | "longitude"
> & {
  latitude: number;
  longitude: number;
} {
  return user.latitude !== null && user.longitude !== null;
}

const userMarkers = computed(() => {
  return users.value.filter(hasCoordinates).map((user) => ({
    latitude: user.latitude,
    longitude: user.longitude,
    markerName: user.name ?? user.email,
  }));
});
</script>
<template>
  <h1>{{ users.length }} {{ $t("Users") }}</h1>
  <details v-if="userMarkers.length">
    <summary>{{ $t("Map") }}</summary>
    <map-component
      class="full-width"
      :markers="userMarkers"
      :showOpenInGoogleMaps="false"
    />
  </details>
  <attribute-dropdown v-model="attributeIds"></attribute-dropdown>
  <div class="overflow-auto">
    <table>
      <thead>
        <tr>
          <th v-for="key in keys" :key="key">{{ key }}</th>
          <th>{{ $t("Attributes") }}</th>
          <th>{{ $t("Actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td v-for="key in keys" :key="key">{{ user[key as keyof User] }}</td>
          <td v-if="user.id" style="min-width: 296px">
            <attribute-dropdown
              :modelValue="
                user.user_attributes?.map((attr) =>
                  attr.attribute_id.toString()
                ) ?? []
              "
              @update:modelValue="updateUsersAttributes(user.id, $event)"
            ></attribute-dropdown>
          </td>
          <td>
            <button
              v-if="user.id && !user.guide_profile?.verified_at"
              @click="verifyGuideProfile(user.id)"
            >
              {{ $t("Verify guide profile") }}
            </button>
          </td>
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
