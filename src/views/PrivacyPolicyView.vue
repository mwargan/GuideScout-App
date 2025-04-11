<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import Markdown from "vue3-markdown-it";
import source from "./PrivacyPolicy.md?raw";
</script>
<template>
  <div>
    <Markdown :source="source" style="font-size: 14px" />
    <base-button to="/">{{ $t("Home") }}</base-button>
  </div>
</template>
