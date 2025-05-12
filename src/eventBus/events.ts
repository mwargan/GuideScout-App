import { type App, inject } from "vue";
import EventBus from "type-safe-event-bus";
import type { RouteLocationNormalized } from "vue-router";

declare module "type-safe-event-bus" {
  export interface EventTypesPayloads {
    enabled_analytics: { data: string; bravo: string };
    disabled_analytics: void;
    went_offline: void;
    came_online: void;
    viewed_page: { url: string; name: string } & RouteLocationNormalized;
    logged_in: void;
    logged_out: void;
    sent_reset_password_email: { email: string };
    reset_password: { email: string };
    confirmed_password: void;
    confirmed_email: void;
    sent_phone_otp: { phone: string | null };
    confirmed_phone: void;
    updated_user: { changes: Record<string, any> };
    registered: void;
    created_personal_access_token: { tokenId: string };
    deleted_personal_access_token: { tokenId: string };
    added_payment_method: { methodId: string };
    changed_locale: string;
    changed_theme: string;
    uploaded_cv: void;
  }
}

export const eventsBusKey = Symbol.for("eventsBusKey");

export const useEventsBus = () => {
  return inject(eventsBusKey) as typeof EventBus;
};

// Currently unused
export const EventsPlugin = {
  install: (app: App<any>) => {
    app.provide(eventsBusKey, EventBus);
  },
};

export default EventBus;
