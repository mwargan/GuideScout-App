import { useUserStore } from "@/stores/user";
import { baseGate } from "@m-media/vue3-gate-keeper";
import type { RouteLocationRaw } from "vue-router";

/** A middleware that checks if the user is authenticated */
export default class extends baseGate {
  async handle() {
    const store = useUserStore();
    const shouldNotVerifyPhone = store.user?.phone_verified_at;
    if (shouldNotVerifyPhone) {
      return this.fail();
    }
  }

  route(): false | RouteLocationRaw {
    return {
      path: "/",
    };
  }
}
