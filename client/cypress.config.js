const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://causeconnect-zeta.vercel.app",
    video: false,
    screenshotOnRunFailure: true,
    retries: 1,
    setupNodeEvents(on, config) {
     
    },
  },
});
