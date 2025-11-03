import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import { ThemeProvider, CssBaseline } from "@mui/material";
import * as Sentry from "@sentry/react";

// Initialize Sentry
Sentry.init({
  dsn: "https://319261d8c3358d1cd9d9a6d24da78fff@o4510243783049216.ingest.us.sentry.io/4510243802710016",
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

const Root = () => {

  return (
    <Sentry.ErrorBoundary fallback={null}>
      <ApolloProvider client={client}>
          <CssBaseline />
          <App/>
      </ApolloProvider>
    </Sentry.ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
