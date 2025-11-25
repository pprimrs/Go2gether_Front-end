// app.config.ts
import "dotenv/config";
import { ExpoConfig } from "expo/config";

export default (): ExpoConfig => ({
  name: "Go2gether",
  slug: "go2gether",
  scheme: "go2gether",
  plugins: [
    "expo-router"
  ],
  extra: {
    API_URL: process.env.API_URL ?? "https://go2gether.vercel.app",
  },
});
