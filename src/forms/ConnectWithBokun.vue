<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";

const success = ref(false);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const userStore = useUserStore();
// The submit function. If there is just the password, check if the password is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  const bokunAuthUrl = `${import.meta.env.VITE_API_URL}bokun/auth/redirect`;
  window.location.href = bokunAuthUrl;
};
</script>

<template>
  <base-form
    v-if="userStore.isAuthenticated"
    ref="baseFormRef"
    @submit="submitForm"
    :disabled="success"
    submitText="Connect with Bokun"
  >
  </base-form>
  <div v-else>{{ $t("Login or sign up to continue") }}</div>
</template>
