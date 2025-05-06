import { userService } from "../../../services/index.js";
import { commonUtils, imageUtils } from "../../../utils/index.js";

class ChannelController {
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
    prepareData.is_channel = true;

    const result = await this.#channelService.register(
      userId,
      prepareData,
      files
    );
    return result;
  };
}

export default ChannelController;
