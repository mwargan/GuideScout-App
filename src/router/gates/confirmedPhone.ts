import { useUserStore } from "@/stores/user";
import type { RouteLocationRaw } from "vue-router";
import { baseGate } from "@m-media/vue3-gate-keeper";

/** A middleware that checks if the user is authenticated */
export default class extends baseGate {
  async handle() {
    const store = useUserStore();
    const shouldVerifyPhone = !store.user?.phone_verified_at;
    if (shouldVerifyPhone) {
      return this.fail();
    }
  }

  route(): false | RouteLocationRaw {
    return {
      name: "confirm-phone",
    };
  }
}
