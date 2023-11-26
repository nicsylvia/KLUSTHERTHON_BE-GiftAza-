import dotenv from "dotenv";

dotenv.config();

export const EnvironmentVariables = {
  PORT: process.env.PORT as string,
  MONGODB_STRING: process.env.LIVE_URL as string,
  API_KEY: process.env.api_key as string,
  API_SECRET: process.env.api_secret as string,
  google_id: process.env.google_id as string,
  google_secret: process.env.google_secret as string,
  google_refreshToken: process.env.google_refreshToken as string,
  google_redirectToken: process.env.google_redirectToken as string,
  accessToken: process.env.accessToken as string,
  from: process.env.from as string,
  subject: process.env.subject as string,
  user: process.env.user as string,
  type: process.env.type as string,
};
