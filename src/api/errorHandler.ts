import router from "@/router";
import { useUserStore } from "@/stores/user";

export function handle403Error(error: any) {
  alert("You are not allowed to do this action.");
  router.go(-1);
}

export function handle401Error(error: any) {
  if (error.config.url === "api/user") return;
  // Set the userStore isAuthenticated to false
  const userStore = useUserStore();
  userStore.isAuthenticated = false;
  router.push({
    name: "login",
  });
}

export function handle500Error(error: any) {
  alert("An error occurred. Please try again later.");
  router.go(-1);
}
