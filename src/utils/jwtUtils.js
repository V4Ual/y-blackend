import jwt from "jsonwebtoken";
import { envConfig } from "../constant/index.js";

export const jwtUtil = {
  generateToken: async (encrypt, time) => {
    return await jwt.sign(encrypt, envConfig.JWT_SECRET, {
      algorithm: envConfig.JWT_ALGO,
      expiresIn: time,
    });
  },

  verity: async (token) => {
    return await jwt.verify(token, envConfig.JWT_SECRET);
  },
};
