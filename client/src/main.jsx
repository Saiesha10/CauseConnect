import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme";

const Root = () => {
  const [mode, setMode] = useState("light"); // default

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={getTheme(mode)}>
        <CssBaseline />
        <App mode={mode} setMode={setMode} />
      </ThemeProvider>
    </ApolloProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
