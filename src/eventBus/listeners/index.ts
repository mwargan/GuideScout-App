// import analytics from "./analytics";
import notifications from "./notifications";
import broadcastChannel from "./broadcastChannel";
import { ConsoleListener, Listeners } from "type-safe-event-bus";
// import postMessage from "./postMessage";

export default new Listeners(
  notifications,
  broadcastChannel,
  (import.meta.env.DEV && ConsoleListener) || {}
);
