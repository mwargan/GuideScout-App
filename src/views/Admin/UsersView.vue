<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import type { User } from "@/types/user";

const users = ref([] as User[]);

const fetchUsers = async () => {
  const response = await axios.get("/api/users");
  users.value = response.data;
};

const keys = computed(() => {
  if (!users.value.length) {
    return [];
  }
  //   Return all keys, except other objects or arrays
  return Object.keys(users.value[0]).filter(
    (key) => typeof users.value[0][key as any] !== "object"
  );
});

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
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td v-for="key in keys" :key="key">{{ user[key as any] }}</td>
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
