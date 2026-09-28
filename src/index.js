import { HelmetProvider } from "react-helmet-async";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "./App.js";

const QUERY_STALE_TIME_MS = 60_000;

// Keep previously shared #/ links working after moving to crawlable paths.
if (window.location.hash.startsWith("#/")) {
  const oldPath = window.location.hash.slice(1);
  window.history.replaceState(null, "", `${oldPath}${window.location.search}`);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
