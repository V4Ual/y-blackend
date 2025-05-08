import { checkRabbitMQConnection } from "./queue/index.js";
import fs from "fs";
import path from "path";
import { Types } from "mongoose";
const ObjectId = Types.ObjectId;

import ffmpeg from "fluent-ffmpeg";
import { spawn } from "child_process";
import { sendToClient } from "./webSocket/index.js";
import { commonUtils } from "./utils/commonUtils.js";
import { db } from "./config/db.config.js";

async function receiveMessages() {
  try {
    const connection = await checkRabbitMQConnection();

    const channel = await connection.createChannel();

    const queue = "videoProcess";
    await channel.purgeQueue(queue);
    await channel.assertQueue(queue, {
      durable: false,
    });

    console.log(
      `[*] Waiting for messages in queue: "${queue}". To exit press CTRL+C`
    );

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        console.log(`[x] Received: ${msg.content}`);
        const videoData = JSON.parse(msg.content.toString());
        console.log({
          inputPath: videoData.inputPath,
          outputDir: videoData.outputDir,
          thumbnailPath: videoData.thumbnailPath,
          userId: videoData.userId,
          videoId: videoData.videoId,
        });

        if (
          videoData.inputPath &&
          videoData.outputDir &&
          videoData.thumbnailPath &&
          videoData.userId &&
          videoData.videoId
        ) {
          const inputPath = videoData.inputPath;
          const outputDir = videoData.outputDir;
          const thumbnailPath = videoData.thumbnailPath;

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
                sendToClient(
                  videoData.userId,
                  JSON.stringify({
                    process: percent,
                    videoId: videoData.videoId,
                  })
                );
              }
            });

            ffmpegProcess.on("close", async (code) => {
              const outputDir = path.resolve(
                "public",
                "videos",
                videoData.videoId
              );
              const masterPath = path.join(outputDir, "master.m3u8");
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
                { video_id: videoData.videoId },
                { $set: { duration: timeOfVideo, status: "Live" } }
              );

              updateMasterPlaylist(masterPath, videoData.videoId);

              thumbnailProcess.on("close", () => {
                sendToClient(
                  videoData.userId,
                  JSON.stringify({
                    process: "100",
                    videoId: videoData.videoId,
                  })
                );
              });

              thumbnailProcess.on("error", (err) => {
                console.error("Thumbnail error:", err);
              });
            });

            ffmpegProcess.on("error", async (err) => {
              console.error("FFmpeg error:", err);
              await db.video.updateOne(
                { video_id: videoData.videoId },
                { $set: { status: "Fail" } }
              );
            });
          });
        }

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error receiving messages:", error);
  }
}

receiveMessages();

export function updateMasterPlaylist(masterPath, videoId) {
  const basePath = `/public/videos/${videoId}`;
  const content = fs.readFileSync(masterPath, "utf-8");

  const updated = content.replace(
    /^\s*\/?stream_(\d+)\.m3u8\s*$/gm,
    (_, num) => `${basePath}/stream_${num}.m3u8`
  );

  fs.writeFileSync(masterPath, updated, "utf-8");
}
