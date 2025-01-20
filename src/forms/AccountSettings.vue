<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";

const userStore = useUserStore();

// Email, password, and remember me
const email = ref(userStore.user?.email);
const isEmailVerified = ref(userStore.user?.email_verified_at !== null);

// Name, Surname
const name = ref(userStore.user?.name);
const surname = ref(userStore.user?.surname);

const phone = ref(userStore.user?.phone);

const baseFormRef = ref();

const emit = defineEmits(["updated"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!email.value || !name.value || !surname.value || !phone.value) {
    return;
  }

  // Create an object containing only the changed values
  const changedValues = {} as Record<string, string>;
  if (userStore.user?.name !== name.value) {
    changedValues.name = name.value;
  }
  if (userStore.user?.surname !== surname.value) {
    changedValues.surname = surname.value;
  }
  if (userStore.user?.email !== email.value) {
    changedValues.email = email.value;
  }
  if (userStore.user?.phone !== phone.value) {
    changedValues.phone = phone.value;
  }

  // If there are no changed values, return
  if (Object.keys(changedValues).length === 0) {
    baseFormRef.value.setSuccessOnInputs();
    return;
  }

  const response = await userStore.update(
    name.value,
    surname.value,
    email.value,
    phone.value
  );

  if (response === true) {
    // Emit the updated event with the changed fields
    emit("updated", changedValues);
    baseFormRef.value.setSuccessOnInputs();
  } else if (typeof response === "object") {
    // We want to show the user the correct fields to the user so they feel better
    baseFormRef.value.setSuccessOnInputs();

    // Show the fields with errors
    baseFormRef.value.setInputErrors(response.data.errors);
  }
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
    :isLoading="userStore.isLoading"
    submitText="Save"
  >
    <!-- The form starts with just the email. The user presses a button and we check if we should show the register or login inputs -->
    <!-- <TransitionGroup> -->

    <!-- Name, Surname, and new password inputs NOTE THE PATTERN - needed to trigger validity on non-dirty (script added) inputs, see https://stackoverflow.com/a/53261163/7410951 -->
    <label for="name">{{ $t("Name") }}</label>
    <input
      type="text"
      id="name"
      name="name"
      :placeholder="$t('Name')"
      v-model="name"
      minlength="2"
      pattern=".{2,}"
      autofocus
      required
    />
    <label for="surname">{{ $t("Surname") }}</label>
    <input
      type="text"
      id="surname"
      name="surname"
      :placeholder="$t('Surname')"
      v-model="surname"
      minlength="2"
      pattern=".{2,}"
      required
    />
    <label for="email">{{ $t("Email") }}</label>
    <input
      type="email"
      id="email"
      name="email"
      :placeholder="$t('Email')"
      v-model="email"
      pattern="[^@]+@[^@]+\.[^@]+"
      autofocus
      required
    />
    <small v-if="!isEmailVerified">
      {{
        $t(
          "You have not confirmed your email address. Please check your inbox for the confirmation email."
        )
      }}
    </small>
    <small v-else>{{
      $t("If you change your email address you will have to confirm it again.")
    }}</small>

    <label for="phone">{{ $t("Phone Number (starting with +)") }}</label>
    <input
      type="tel"
      id="phone"
      name="phone"
      :placeholder="$t('Phone')"
      v-model="phone"
      required
    />

    <!-- </TransitionGroup> -->
  </base-form>
</template>
