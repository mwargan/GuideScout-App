<script lang="ts" setup>
import { ref } from "vue";
import ApiClient from "@/api/client";

const to = ref("");
const subject = ref("");
const message = ref("");

const sendEmail = async () => {
  const response = await ApiClient.post(`/api/emails/${to.value}/send`, {
    subject: subject.value,
    message: message.value,
  });

  if (response.status === 200) {
    alert("Email sent!");
  } else {
    alert("Email failed to send.");
  }
};
</script>
<template>
  <h1>{{ $t("Send Email") }}</h1>
  <label for="to">{{ $t("To") }}</label>
  <input
    type="email"
    id="to"
    name="to"
    :placeholder="$t('To')"
    v-model="to"
    required
  />
  <label for="subject">{{ $t("Subject") }}</label>
  <input
    type="text"
    id="subject"
    name="subject"
    :placeholder="$t('Subject')"
    v-model="subject"
    required
  />
  <label for="message">{{ $t("Message") }}</label>
  <textarea
    id="message"
    name="message"
    :placeholder="$t('Message')"
    v-model="message"
    required
    rows="10"
  ></textarea>
  <button @click="sendEmail" :disabled="!to || !subject || !message">
    {{ $t("Send Email") }}
  </button>
</template>
