import { db } from "../../../config/db.config.js";
import { commonUtils, imageUtils } from "../../../utils/index.js";
import responses from "../../../responses/index.js";
import { Types } from "mongoose";
import { sendVideoInProcess } from "../../../queue/index.js";
import { receiveMessages } from "../../../queue.process.js";
import { envConfig } from "../../../constant/env.variable.js";
import { sentToClientProcess } from "../../../webSocket/index.js";
const ObjectId = Types.ObjectId;

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

    await sendVideoInProcess({
      videoId: video.video_id,
      userId: video.user_id,
      inputPath: inputPath,
      outputDir: outputDir,
      thumbnailPath: thumbnailPath,
    });

    sentToClientProcess(video.user_id, { video: "in-progress" });

    receiveMessages();
    return responses.success("down to convert it", video);
  };

  static getVideosList = async (userId, currentPage, pageSize, isAll) => {
    let videoList;
    if (isAll) {
      videoList = await commonUtils.getPagination({
        model: db.video,
        currentPage,
        pageSize,
      });
    } else {
      const condition = {
        user_id: new ObjectId(userId),
      };
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

  static getPaginationAggregate = async (search, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const videos = await db.video.aggregate([
      {
        $match: {
          status: "Live",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                email: 1,
                channel_name: 1,
                channel_image: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ["$channel_image", null] },
                        { $eq: ["$channel_image", "N/A"] },
                      ],
                    },
                    then: "N/A",
                    else: {
                      $concat: [
                        envConfig.IMAGE_URL,
                        "profileImage/",
                        "$channel_image",
                      ],
                    },
                  },
                },
              },
            },
          ],
          as: "user_details",
        },
      },
      {
        $unwind: "$user_details", // flatten the array to an object
      },
      {
        $project: {
          title: 1,
          description: 1,
          createdAt: 1,
          duration: 1,
          video_id: 1,
          thumbnail: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$thumbnail", null] },
                  { $eq: ["$thumbnail", "N/A"] },
                ],
              },
              then: "N/A",
              else: {
                $concat: [
                  envConfig.IMAGE_URL, // or VIDEO_URL if separate
                  "videos/",
                  "$video_id",
                  "/",
                  "$thumbnail",
                ],
              },
            },
          },
          user_details: 1,
        },
      },
    ]);

    const total = await db.video.countDocuments(searchFilter);

    return responses.success("Get list successfully", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: videos,
    });
  };
}

export default VideoService;
