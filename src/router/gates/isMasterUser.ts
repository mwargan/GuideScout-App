import { useUserStore } from "@/stores/user";
import type { RouteLocationRaw } from "vue-router";
import { baseGate } from "@m-media/vue3-gate-keeper";

/** A middleware that checks if the user is authenticated */
export default class extends baseGate {
  form = "LoginOrRegister";

  async handle() {
    const store = useUserStore();
    await store.isReady;

    if (`${store.user?.id}` !== import.meta.env.VITE_MASTER_USER_ID) {
      return this.fail();
    }
  }

  route(): false | RouteLocationRaw {
    return {
      name: "home",
    };
  }
}
