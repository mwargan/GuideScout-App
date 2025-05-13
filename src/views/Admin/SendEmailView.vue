<script lang="ts" setup>
import { ref } from "vue";
import { postSendEmail } from "@/api/email";

const to = ref("");
const subject = ref("");
const message = ref("");

const sendEmail = async () => {
  try {
    await postSendEmail({
      email: to.value,
      subject: subject.value,
      body: message.value,
    });
    alert("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    alert("Failed to send email. Please try again.");
    // Handle error (e.g., show a notification)
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
