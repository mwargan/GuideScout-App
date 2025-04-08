import { useUserStore } from "@/stores/user";
import { baseGate } from "@m-media/vue3-gate-keeper";

export default class extends baseGate {
  form = "UploadCV";

  async handle() {
    const store = useUserStore();
    await store.isReady;
    const hasValidCV =
      store.user?.latest_cv_status === "accepted" ||
      store.user?.latest_cv_status === "pending";
    if (!hasValidCV) {
      return this.fail();
    }
  }
}
