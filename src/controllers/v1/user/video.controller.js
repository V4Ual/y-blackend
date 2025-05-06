import { userService } from "../../../services/index.js";

class VideoController {
  #videosService;
  constructor() {
    this.#videosService = userService.userService.videosService;
  }

  transcodeUploadedVideo = async (req, res) => {
    const {
      userDetails: { userId },
    } = req.headers;
    const { title, description } = req.body;
    const files = req.files;

    const prepareData = new Object();
    prepareData.title = title;
    prepareData.user_id = userId;
    prepareData.description = description;

    const result = await this.#videosService.videoTranscode(prepareData, files);

    return result;
  };

  videoList = async (req, res) => {
    const {
      userDetails: { userId },
    } = req.headers;
    const { currentPage, pageSize, isAll } = req.query;

    const result = await this.#videosService.getVideosList(
      userId,
      currentPage,
      pageSize,
      isAll
    );

    return result;
  };

  videoDetailsGet = async (req, res) => {
    const { videoId } = req.query;

    console.log(videoId);
    const result = await this.#videosService.videoDetails({ videoId });
    return result;
  };
}

export default VideoController;
