import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Box } from "./screens/Box/Box";

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error('Could not find the root element "#app".');
}

createRoot(rootElement).render(
  <StrictMode>
    <Box />
  </StrictMode>
);
