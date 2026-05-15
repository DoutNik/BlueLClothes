import { initializeApp } from "firebase/app";

import {
  getMessaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId:
    "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(
  firebaseConfig
);

export const messaging =
  getMessaging(app);