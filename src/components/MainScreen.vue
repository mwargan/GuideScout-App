<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  /** The title */
  title: {
    type: String,
    required: true,
  },
  /** The subtitle */
  subtitle: {
    type: String,
    required: true,
  },
  justify: {
    type: String as PropType<
      "space-between" | "center" | "flex-start" | "flex-end" | string
    >,
    default: "space-between",
  },
});
</script>
<template>
  <div class="mainscreen" :style="{ justifyContent: justify }">
    <div class="heading">
      <hgroup>
        <p>{{ subtitle }}</p>
        <h1>{{ title }}</h1>
      </hgroup>
      <slot name="headerActions"></slot>
      <slot> </slot>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%">
      <slot name="actions">
        <button>{{ $t("Start tour") }}</button>
      </slot>
    </div>
  </div>
</template>
<style>
.mainscreen {
  min-height: 85svh;
  width: 100%;

  /* Space between vertically */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  max-width: 70ch;
  margin: 0 auto;

  > .heading {
    /* Frame 1 */
    width: 100%;

    /* Auto layout */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    gap: 16px;

    margin: 0 auto;

    /* Inside auto layout */
    flex: none;
    order: 0;
    flex-grow: 0;

    > hgroup {
      margin-bottom: 0;
    }
  }

  hgroup > h1,
  hgroup > :not(:first-child):last-child {
    font-style: normal;
    font-weight: 700;
    font-size: 48px;
    line-height: 120%;
    /* identical to box height, or 58px */
    letter-spacing: -0.02em;

    color: var(--pico-colors-text-primary);

    /* Inside auto layout */
    flex: none;
    order: 1;
    flex-grow: 0;
  }

  hgroup > p {
    /* Subtitle */
    font-style: normal;
    font-weight: 400;
    font-size: 32px;
    line-height: 120%;
    /* or 38px */

    /* Inside auto layout */
    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
  }

  p,
  ul,
  li {
    /* Body Base */
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 140%;
    /* or 22px */

    /* Inside auto layout */
    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
  }

  ul {
    padding-left: 1rem;
  }

  button,
  a {
    width: 100%;
  }
}
</style>
