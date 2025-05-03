import { userService } from "../../../services/index.js";
import { commonUtils, imageUtils } from "../../../utils/index.js";

class channelController {
  #channelService;
  constructor() {
    this.#channelService = userService.userService.channelService;
  }

  register = async (req, res) => {
    const {
      userDetails: { userId },
    } = req.headers;
    const { channelName, description } = req.body;
    const files = req.files;

    const prepareData = new Object();
    prepareData.channel_name = channelName;
    prepareData.description = description;

    if (files?.banner?.length > 0) {
      let imageName = commonUtils.generateImageName();
      imageUtils.createImage("banner", files.banner[0].buffer, imageName);
      prepareData.banner_image = imageName;
    }

    if (files?.profilePic?.length > 0) {
      let imageName = commonUtils.generateImageName();
      imageUtils.createImage(
        "profileImage",
        files.profilePic[0].buffer,
        imageName
      );
      prepareData.channel_image = imageName;
    }

    const result = await this.#channelService.register(userId, prepareData);
    return result;
  };
}

export default channelController;
