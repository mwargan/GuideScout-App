import { createRouter, createWebHistory } from "vue-router";
import $bus, { eventTypes } from "@/eventBus/events";
import authRoutes from "./authRoutes";
import { ref } from "vue";

export const navIsLoading = ref(true);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      meta: {
        gates: [
          "auth",
          "confirmedEmail",
          "confirmedPhone",
          "hasGivenLocationPermission",
          "hasValidCV",
        ],
        // Notice how we pass the translation key rather than the actual string. This is because Vue Router will cache our meta, so if we just passed the translated string it would not update on language change.
        title: "Home",
      },
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/tours",
      name: "tours",
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
        // Notice how we pass the translation key rather than the actual string. This is because Vue Router will cache our meta, so if we just passed the translated string it would not update on language change.
        title: "Tours",
      },
      component: () => import("../views/SingleView.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/Auth/SettingsView.vue"),
      meta: {
        gates: ["auth"],
      },
    },
    {
      path: "/deals",
      name: "deals",
      component: () => import("../views/DealsView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
    },
    {
      path: "/add-payment-method",
      name: "add-payment-method",
      component: () => import("../views/AddPaymentMethodView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail"],
      },
    },
    {
      path: "/confirm-location-permission",
      name: "confirm-location-permission",
      component: () =>
        import("../views/Auth/ConfirmLocationPermissionView.vue"),
      meta: {
        gates: ["auth"],
      },
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("../views/Admin/UsersView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "isMasterUser"],
      },
    },
    {
      path: "/admin/send-email",
      name: "admin-send-email",
      component: () => import("../views/Admin/SendEmailView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "isMasterUser"],
      },
    },
    {
      path: "/admin/attributes",
      name: "admin-attributes",
      component: () => import("../views/Admin/AttributesView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "isMasterUser"],
      },
    },
    {
      path: "/referrals",
      name: "referrals",
      component: () => import("../views/ReferralsView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
    },

    // A company path /companies/;ID/offers
    {
      path: "/companies/:id/offers",
      name: "company-offers",
      component: () => import("../views/Company/OffersView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
    },

    {
      path: "/companies/:companyId/offers/create",
      name: "company-offers-create",
      component: () => import("../views/Company/CreateOfferView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
      props: true,
    },

    {
      path: "/companies/:companyId/tours/create",
      name: "company-tours-create",
      component: () => import("../views/Company/CreateOrEditTourView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
      props: true,
    },

    {
      path: "/companies/:companyId/tours/:tourId/edit",
      name: "company-tours-edit",
      component: () => import("../views/Company/CreateOrEditTourView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
      props: true,
    },

    {
      path: "/offers/:offerId/passengers/create",
      name: "offer-passengers-create",
      component: () => import("../views/Company/CreateOrEditPaxView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
      props: true,
    },

    {
      path: "/offers/:offerId/passengers/:paxId/edit",
      name: "offer-passengers-edit",
      component: () => import("../views/Company/CreateOrEditPaxView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
      props: true,
    },

    {
      path: "/companies/:companyId",
      name: "company",
      component: () => import("../views/SingleCompanyView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
      props: true,
    },

    {
      path: "/users/:userId",
      name: "user",
      component: () => import("../views/SingleGuideView.vue"),
      meta: {
        gates: ["auth", "confirmedEmail", "confirmedPhone"],
      },
      props: true,
    },
    {
      path: "/about",
      name: "about",
      meta: {
        gates: ["auth", "confirmedPassword"],
      },
      component: () => import("../views/AboutView.vue"),
    },
    // Example routes
    {
      path: "/examples/cartesio",
      name: "CartesIo",
      component: () => import("../views/Examples/CartesIoView.vue"),
    },
    {
      path: "/examples/deals",
      name: "Examples",
      component: () => import("../views/Examples/DealsView.vue"),
    },
    // Add a catch-all 404 page
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/404View.vue"),
    },
  ].concat(authRoutes as any),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.meta.scrollPosition) {
      return to.meta.scrollPosition as any;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach(() => {
  navIsLoading.value = true;
});

router.afterEach((to, from, failure) => {
  navIsLoading.value = false;
  if (!failure) {
    $bus.$emit(eventTypes.viewed_page, {
      ...to,
      name: document.title,
    });
  }
});

export default router;
