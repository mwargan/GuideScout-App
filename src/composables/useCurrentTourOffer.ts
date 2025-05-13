import { getUsersCurrentTours } from "@/api/user";
import { useUserStore } from "@/stores/user";
import { useQuery } from "@tanstack/vue-query";

const userStore = useUserStore();
export const useCurrentTourOffer = () => {
  const currentTourQuery = useQuery({
    queryKey: ["currentTour"],
    queryFn: () => {
      return userStore.isReady.then(() => {
        return getUsersCurrentTours({ userId: userStore.user?.id });
      });
    },

    enabled: userStore.isAuthenticated,

    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 10,
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    currentTourQuery,
  };
};
