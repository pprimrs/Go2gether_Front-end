// app.config.ts
import "dotenv/config";
import { ExpoConfig } from "expo/config";

export default (): ExpoConfig => ({
  name: "Go2gether",
  slug: "go2gether",
  scheme: "go2gether",
  extra: {
    API_URL: process.env.API_URL ?? "http://localhost:8080",
  },
});
