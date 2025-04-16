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
          <base-badge class="success rectangular">
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(user.user.earnings ? user.user.earnings / 100 : 0)
            }}</base-badge
          >

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
              <base-avatar
                :name="`${user.user.name} ${user.user.surname}`"
                :src="user.user.gravatar"
              />
            </summary>
            <ul
              @click="blur()"
              style="left: unset; right: -3rem; min-width: 13rem"
            >
              <li>
                <router-link to="/settings">{{ $t("Settings") }}</router-link>
              </li>
              <li>
                <router-link to="/logout">{{ $t("Logout") }}</router-link>
              </li>
              <template v-if="user.user.companies?.length">
                <li>
                  <hr />
                  <b>{{ $t("Manage company") }}</b>
                </li>
                <li>
                  <router-link
                    :to="'/companies/' + user.activeTeamId + '/offers/create'"
                    >{{ $t("Create new offer") }}</router-link
                  >
                </li>
                <li>
                  <router-link
                    :to="'/companies/' + user.activeTeamId + '/offers'"
                    >{{ $t("See all offers") }}</router-link
                  >
                </li>
                <li>
                  <router-link
                    :to="'/companies/' + user.activeTeamId + '/tours/create'"
                    >{{ $t("Create new tour type") }}</router-link
                  >
                </li>
                <template v-if="user.user.companies?.length > 1">
                  <li>
                    <hr />
                    <b>{{ $t("Switch company") }}</b>
                  </li>

                  <template
                    v-for="company in user.user.companies"
                    :key="company.id"
                  >
                    <li
                      v-if="company.pivot.role !== 'guide'"
                      @click="user.setActiveTeam(company.id)"
                    >
                      <router-link
                        :to="'/companies/' + company.id + '/offers'"
                        >{{ company.name }}</router-link
                      >
                    </li>
                  </template>
                </template>
              </template>
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
