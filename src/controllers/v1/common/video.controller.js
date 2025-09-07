import { userService } from "../../../services/index.js";

class VideoController {
  #videosService;
  constructor() {
    this.#videosService = userService.userService.videosService;
  }

  videoList = async (req, res) => {
    const { search, currentPage, pageSize } = req.query;

    const result = await this.#videosService.getPaginationAggregate(
      search,
      currentPage,
      pageSize
    );

    return result;
  };
}
export default VideoController;
