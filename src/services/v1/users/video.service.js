import path from "path";
import { db } from "../../../config/db.config.js";
import { commonUtils, imageUtils } from "../../../utils/index.js";
import responses from "../../../responses/index.js";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { spawn } from "child_process";
import { WebSocketServer } from "ws";
import { Types } from "mongoose";
const ObjectId = Types.ObjectId;

const wss = new WebSocketServer({ port: 3001 });
let sockets = [];
wss.on("connection", (ws) => {
  sockets.push(ws);
  ws.on("close", () => {
    sockets = sockets.filter((s) => s !== ws);
  });
});

function sendProgress(percent) {
  sockets.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ progress: percent }));
    }
  });
}

class VideoService {
  static videoTranscode = async (videoObject, files) => {
    let generateVideoId = commonUtils.generateVideoId();
    let videoPath = `./public/videos/${generateVideoId}/`;
    let thumbnail = commonUtils.generateImageName();

    if (files?.video?.length > 0) {
      let uploadVideo = commonUtils.generateVideoName();
      imageUtils.createImage(
        `videos/${generateVideoId}`,
        files.video[0].buffer,
        uploadVideo
      );
      videoObject.video_path = uploadVideo;
      videoObject.video_id = generateVideoId;
    }

    if (files?.thumbnail?.length > 0) {
      imageUtils.createImage(
        `videos/${generateVideoId}`,
        files.thumbnail[0].buffer,
        thumbnail
      );
      videoObject.thumbnail = thumbnail;
    }

    const video = await db.video.create(videoObject);

    const inputPath = `${videoPath}/${video.video_path}`;
    const outputDir = `${videoPath}`;
    const thumbnailPath = `${videoPath}/thumbnail.png`;

    fs.mkdirSync(outputDir, { recursive: true });

    let duration;

    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return responses.internalServer("Failed to get duration");
      duration = metadata.format.duration;

      const args = [
        "-i",
        inputPath,
        "-filter_complex",
        "[0:v]split=5[v1][v2][v3][v4][v5]; [0:a]asplit=5[a1][a2][a3][a4][a5]; [v1]scale=w=256:h=144[v1out]; [v2]scale=w=640:h=360[v2out]; [v3]scale=w=854:h=480[v3out]; [v4]scale=w=1280:h=720[v4out]; [v5]scale=w=1920:h=1080[v5out]",
        "-map",
        "[v1out]",
        "-map",
        "[a1]",
        "-c:v:0",
        "libx264",
        "-b:v:0",
        "200k",
        "-map",
        "[v2out]",
        "-map",
        "[a2]",
        "-c:v:1",
        "libx264",
        "-b:v:1",
        "500k",
        "-map",
        "[v3out]",
        "-map",
        "[a3]",
        "-c:v:2",
        "libx264",
        "-b:v:2",
        "800k",
        "-map",
        "[v4out]",
        "-map",
        "[a4]",
        "-c:v:3",
        "libx264",
        "-b:v:3",
        "1500k",
        "-map",
        "[v5out]",
        "-map",
        "[a5]",
        "-c:v:4",
        "libx264",
        "-b:v:4",
        "3000k",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-crf",
        "20",
        "-preset",
        "veryfast",
        "-f",
        "hls",
        "-hls_time",
        "4",
        "-hls_playlist_type",
        "vod",
        "-master_pl_name",
        "master.m3u8",
        "-var_stream_map",
        "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3 v:4,a:4",
        `${outputDir}/stream_%v.m3u8`,
      ];

      const ffmpegProcess = spawn("ffmpeg", args);

      ffmpegProcess.stderr.on("data", (data) => {
        const line = data.toString();
        const match = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
        if (match) {
          const [, h, m, s] = match;
          const timeInSeconds = +h * 3600 + +m * 60 + +s;
          const percent = ((timeInSeconds / duration) * 100).toFixed(2);
          sendProgress(percent); // You should define this function if not already
        }
      });

      ffmpegProcess.on("close", async (code) => {
        // ✅ After HLS processing, generate thumbnail
        const thumbnailArgs = [
          "-i",
          inputPath,
          "-ss",
          "00:00:01",
          "-vframes",
          "1",
          thumbnailPath,
        ];

        const thumbnailProcess = spawn("ffmpeg", thumbnailArgs);

        const timeOfVideo = commonUtils.convertSecondsToHHMMSS(duration);

        await db.video.updateOne(
          { _id: new ObjectId(video._id) },
          { $set: { duration: timeOfVideo } }
        );

        thumbnailProcess.on("close", () => {
          sendProgress(100);
        });

        thumbnailProcess.on("error", (err) => {
          console.error("Thumbnail error:", err);
        });
      });

      ffmpegProcess.on("error", (err) => {
        console.error("FFmpeg error:", err);
      });
    });

    return responses.success("down to convert it");
  };

  static getVideosList = async (userId, currentPage, pageSize, isAll) => {
    const condition = {
      user_id: new ObjectId(userId),
    };
    let videoList;
    if (isAll) {
      videoList = await commonUtils.getPagination({
        model: db.video,
        currentPage,
        pageSize,
      });
    } else {
      videoList = await commonUtils.getPagination({
        model: db.video,
        currentPage,
        pageSize,
        condition,
      });
    }

    return responses.success("Video list", videoList);
  };

  static videoDetails = async ({ videoId }) => {
    console.log({ videoId });
    const videoDetails = await db.video.findOne({ video_id: videoId });
    return responses.success("Get video Details", videoDetails);
  };
}

export default VideoService;
