<script setup lang="ts">
import ReferralLink from "@/components/ReferralLink.vue";
</script>

<template>
  <h1>{{ $t("Tour Offers") }}</h1>
  <div>
    <b>{{ $t("Your profile is still being verified.") }}</b>
    <p>{{ $t("Why not refer a friend to earn some money?") }}</p>

    <referral-link />
  </div>
</template>
