import mongoose, { Schema } from "mongoose";
import { bcryptUtil } from "../utils/index.js";

const userScheme = new Schema(
  {
    email: String,
    password: String,
    ["2f_enable"]: {
      type: Boolean,
      default: false,
    },
    ["2f_secret"]: {
      type: String,
      default: "N/A",
    },
    is_channel: {
      type: Boolean,
      default: false,
    },
    channel_name: {
      type: String,
      default: "N/A",
    },
    description: {
      type: String,
      default: "N/A",
    },
    channel_image: {
      type: String,
      default: "N/A",
    },
    banner_image: {
      type: String,
      default: "N/A",
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
    updated_at: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

userScheme.pre("save", async function (next) {
  this.password = await bcryptUtil.hasPassword(this.password);
  next();
});

userScheme.methods.comparePassword = async function (candidatePassword) {
  return await bcryptUtil.comparePassword(candidatePassword, this.password);
};

userScheme.methods.setToken = async function (access_token, refresh_token) {
  this._doc.access_token = access_token;
  this._doc.refresh_token = refresh_token;
};

export const user = mongoose.model("users", userScheme);
