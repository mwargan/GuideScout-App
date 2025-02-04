<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import type { User } from "@/types/user";

const users = ref<User[]>([]);

const fetchUsers = async () => {
  const response = await axios.get("/api/users");
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

onMounted(() => {
  fetchUsers();
});
</script>
<template>
  <h1>{{ $t("Users") }}</h1>
  <div class="overflow-auto">
    <table>
      <thead>
        <tr>
          <th v-for="key in keys" :key="key">{{ key }}</th>
          <th>{{ $t("Actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td v-for="key in keys" :key="key">{{ user[key as keyof User] }}</td>
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
