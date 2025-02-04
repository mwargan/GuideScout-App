<script lang="ts" setup>
import { onMounted, ref } from "vue";
import axios from "axios";
import CardElement from "@/components/CardElement.vue";
import ReferralLink from "@/components/ReferralLink.vue";
import { useUserStore } from "@/stores/user";

const users = ref([] as any[]);
const loading = ref(true);

const userStore = useUserStore();

const fetchUsers = async () => {
  loading.value = true;
  const response = await axios.get(
    `/api/users/${userStore.user?.id}/referrals`
  );
  users.value = response.data;
  loading.value = false;
};

onMounted(() => {
  fetchUsers();
});
</script>
<template>
  <h1>{{ $t("Referrals") }}</h1>
  <card-element
    :loading="loading"
    v-if="users.length === 0"
    :titleHeadingLevel="2"
    :title="
      $t('Earn €15 for each guide you refer who completes their first booking.')
    "
  >
    <p>
      {{
        $t(
          "Share your unique referral link with friends and earn €15 for each guide who completes their first booking on GuideScout."
        )
      }}
    </p>
    <p>{{ $t("When they sign up, you'll see them here.") }}</p>
  </card-element>
  <card-element
    v-for="user in users"
    :key="user.name"
    :title="'+ €' + user.potential_value"
    :subtitle="'From ' + user.name"
    :titleHeadingLevel="2"
  >
    <p>Signed up on {{ new Date(user.created_at).toLocaleDateString() }}</p>
    <p>
      This is a potential value of €{{ user.potential_value }}, when
      {{ user.name }} gets their first tour!
    </p>
  </card-element>
  <referral-link />
</template>
<style scoped>
th {
  position: sticky;
  top: 0;
}
table {
  position: relative;
  border-collapse: collapse;
}
</style>
