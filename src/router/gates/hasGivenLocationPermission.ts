import { baseGate } from "@m-media/vue3-gate-keeper";
import type { RouteLocationRaw } from "vue-router";
import { useUserStore } from "@/stores/user";

export default class extends baseGate {
  async handle() {
    const store = useUserStore();

    if (!("geolocation" in navigator)) {
      alert(
        "Your browser does not support geolocation. You must use a browser that supports geolocation to continue."
      );
      return this.fail();
    }

    return await navigator.permissions
      .query({ name: "geolocation" })
      .then(async (result) => {
        if (result.state === "prompt") {
          await store
            .fetchAndSaveUserLocation()
            .then(() => {})
            .catch(() => {
              alert(
                "Error: we could not get your location. Your location is used to show you the nearest tours available to you."
              );
              return this.fail();
            });
        } else if (result.state === "denied") {
          alert(
            "You did not give us location permissions. You must give us location permissions to continue. Your location is used to show you the nearest tours available to you."
          );
          return this.fail();
        }
      })
      .catch(() => {
        alert(
          "Error: we could not get your location. Your location is used to show you the nearest tours available to you."
        );
        return this.fail();
      });
  }

  route(): false | RouteLocationRaw {
    return {
      name: "confirm-location-permission",
    };
  }
}
