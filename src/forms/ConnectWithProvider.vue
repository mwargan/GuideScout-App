<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";

const props = defineProps({
  /** The user ID */
  provider: {
    type: String,
    required: true,
  },
});

const success = ref(false);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const userStore = useUserStore();
// The submit function. If there is just the password, check if the password is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  await userStore.loginWithProvider(props.provider);
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
    :disabled="success"
    :submitText="$t('Connect with PROVIDER', { provider })"
  >
  </base-form>
</template>
