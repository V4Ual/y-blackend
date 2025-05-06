import mongoose from "mongoose";
import { styleText } from "util";
import { envConfig } from "../constant/index.js";

mongoose
  .connect("mongodb://localhost:27017")
  .then(() => {
    console.log(
      styleText("blue", `DB CONNECTION SUCCESSFULLY URL: ${envConfig.DB_URL}`)
    );
  })
  .catch((error) => {
    console.log(styleText("red", `DB CONNECTION FAIL: ${error.message}`));
  });

// models

import { user, video } from "../models/index.js";
export const db = {
  user,
  video,
};
