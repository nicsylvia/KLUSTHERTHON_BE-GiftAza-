import mongoose from "mongoose";
import { EnvironmentVariables } from "./EnvironmentVariables";

const db_Url = "mongodb://0.0.0.0:27017/GiftAzaHackThon";

const LIVEURI = EnvironmentVariables.MONGODB_STRING;

export const DBCONNECTION = async () => {
  try {
    const conn = await mongoose.connect(db_Url);
    console.log("");
    console.log(`Database is connected to ${conn.connection.host}`);
  } catch (error) {
    console.log("An error occured in connecting to DB");
  }
};