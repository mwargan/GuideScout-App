<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  /**
   * The aria-label for the badge. If not set and the value is numeric, it will default to `${value} New Notifications`.
   */
  ariaLabel: {
    type: String,
    required: false,
    default: "New Notification",
  },

  /** The image URL */
  src: {
    type: String,
    required: false,
  },

  /** The name of the user */
  name: {
    type: String,
    required: false,
    default: "John Doe",
  },

  /** The size, in REM */
  size: {
    type: Number,
    required: false,
    default: 3,
  },
});

const avatarSrc = computed(
  () => props.src || `https://ui-avatars.com/api/?name=${props.name}`
);
</script>
<template>
  <img
    :src="avatarSrc"
    :alt="`Profile picture of ${name}`"
    class="avatar"
    v-bind="$attrs"
    :style="{ height: `${size}rem` }"
  />
</template>
