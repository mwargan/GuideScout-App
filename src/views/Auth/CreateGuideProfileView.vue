<script setup lang="ts">
import router from "@/router";
import CreateGuideProfile from "@/forms/CreateGuideProfile.vue";
import { ref } from "vue";

const redirect = () => {
  // Redirect to the home page
  router.push((router.currentRoute.value.query.redirect as string) ?? "/");
};

const title = ref();
const subtitle = ref();

const handleStepChange = ({
  stepData,
}: {
  stepData: { title: string; subtitle: string };
}) => {
  title.value = stepData.title;
  subtitle.value = stepData.subtitle;
};
</script>

<template>
  <hgroup>
    <p>{{ subtitle }}</p>
    <h1>{{ title }}</h1>
  </hgroup>

  <create-guide-profile @success="redirect" @stepChange="handleStepChange" />
</template>
