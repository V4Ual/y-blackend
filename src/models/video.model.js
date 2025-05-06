import mongoose, { Schema } from "mongoose";
import { commonUtils } from "../utils/index.js";
import { envConfig } from "../constant/env.variable.js";

const videoSchema = new Schema(
  {
    user_id: mongoose.Types.ObjectId,
    title: {
      type: String,
      default: "N/A",
    },

    description: {
      type: String,
      default: "N/A",
    },
    thumbnail: {
      type: String,
      default: "N/A",
      get(value) {
        if (!value || value === "N/A") return value;
        return `${envConfig.IMAGE_URL}videos/${this.video_id}/thumbnail.png`;
      },
    },
    views: {
      type: String,
      default: "0",
    },
    subscriber: {
      type: String,
      default: "0",
    },
    duration: {
      type: String,
      default: "N/A",
    },
    video_id: {
      type: String,
      default: "N/A",
    },
    video_path: {
      type: String,
      default: "N/A",
    },
  },
  {
    timestamps: true,
  }
);

// videoSchema.pre("save", async function (next) {
//   this.video_id = commonUtils.generateVideoId();
//   next();
// });

videoSchema.set("toJSON", { getters: true });

videoSchema.virtual("url").get(function () {
  return `${envConfig.IMAGE_URL}videos/${this.video_id}/master.m3u8`;
});

export const video = mongoose.model("videos", videoSchema);
