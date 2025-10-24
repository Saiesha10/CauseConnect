// src/instrument.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://9ddd3281b1c13074e7346e79fcaad23c@o4510243783049216.ingest.us.sentry.io/4510243817914368",
  sendDefaultPii: true,
});
