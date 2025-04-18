<script setup lang="ts">
const props = defineProps({
  /** The user ID */
  status: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <h1>{{ status }}</h1>
  <div>You've connected with an OAuth provider.</div>
</template>
