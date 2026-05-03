import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./REDUX/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111",
              color: "#fff",
              borderRadius: "14px",
              padding: "14px",
            },
          }}
        />
      </>
    </Provider>
  </StrictMode>,
);
