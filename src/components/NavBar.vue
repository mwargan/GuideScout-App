<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseBadge from "./BaseBadge.vue";
import BaseAvatar from "./BaseAvatar.vue";

const user = useUserStore();

const detailsElement = ref();

const appName = import.meta.env.VITE_APP_NAME;

const blur = () => {
  detailsElement.value.removeAttribute("open");
};
</script>
<template>
  <nav>
    <ul>
      <template v-if="user.isAuthenticated && user.user">
        <li>
          <router-link
            to="/"
            aria-roledescription="logo"
            aria-label="Click the logo to go home"
            ><b>Guide</b>Scout</router-link
          >
        </li>
        <li>
          <base-badge class="success rectangular">€0,00</base-badge>

          <router-link
            to="/referrals"
            aria-roledescription="logo"
            aria-label="Click the logo to go home"
          >
            <base-badge class="success rectangular" style="max-width: unset"
              >+ €{{ user.user.potential_earnings_from_referrals }}
              {{ $t("from referrals") }}</base-badge
            >
          </router-link>
        </li>
      </template>
      <template v-else>
        <li>
          <router-link
            to="/"
            aria-roledescription="logo"
            aria-label="Click the logo to go home"
          >
            <b>Guide</b>Scout
          </router-link>
        </li>
      </template>
    </ul>
    <ul>
      <template v-if="user.isAuthenticated && user.user">
        <li :aria-busy="user.isLoading">
          <details
            class="dropdown"
            ref="detailsElement"
            v-show="!user.isLoading"
          >
            <summary :aria-busy="user.isLoading">
              <base-avatar :name="`${user.user.name} ${user.user.surname}`" />
            </summary>
            <ul @click="blur()" style="left: unset; right: 0">
              <li>
                <router-link to="/settings">{{ $t("Settings") }}</router-link>
              </li>
              <li>
                <router-link to="/logout">{{ $t("Logout") }}</router-link>
              </li>
            </ul>
          </details>
        </li>
      </template>
      <template v-else>
        <li>
          <router-link to="/">{{ $t("Home") }}</router-link>
        </li>
        <li>
          <router-link to="/login">{{ $t("Login") }}</router-link>
        </li>
        <li>
          <router-link to="/sign-up">{{ $t("Sign up") }}</router-link>
        </li>
      </template>
    </ul>
  </nav>
</template>
