import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { NotificationProvider } from "@web3uikit/core";
import { MoralisProvider } from "react-moralis";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <MoralisProvider appId="k4zPQzvEJagiNm7QMoRVE85zZjBGZOnrO1Qp5sOU" serverUrl="https://jaw6r7frvcwq.usemoralis.com:2053/server">
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </MoralisProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
