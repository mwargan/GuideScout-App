<script setup lang="ts">
import ReferralLink from "@/components/ReferralLink.vue";
import { useUserStore } from "@/stores/user";
import { Vue3Lottie } from "vue3-lottie";
import radarJSON from "@/assets/lottie/radar.json";

const userStore = useUserStore();
</script>

<template>
  <h1>{{ $t("Tour Offers") }}</h1>
  <div v-if="!userStore.user?.guide_profile?.verified_at">
    <b>{{ $t("Your profile is still being verified.") }}</b>
    <p>{{ $t("Why not refer a friend to earn some money?") }}</p>
    <referral-link />
  </div>
  <div v-else>
    <div class="empty-state">
      <Vue3Lottie :animationData="radarJSON" :height="200" :width="200" />
      <b>{{ $t("Looking for tours around you") }}</b>
      <p>{{ $t("Check back regularly for new offers") }}</p>
    </div>

    <p>{{ $t("Why not refer a friend to earn some money?") }}</p>
    <referral-link />
  </div>
</template>
<style scoped>
.empty-state {
  text-align: center;
  padding: 7rem 0;
}
</style>
