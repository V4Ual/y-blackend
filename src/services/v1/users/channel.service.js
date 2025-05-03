import { db } from "../../../config/db.config.js";
import { messages } from "../../../constant/index.js";
import responses from "../../../responses/index.js";

class ChannelService {
  static register = async (userId, registerData) => {
    const createUser = await db.user.updateOne({ _id: userId }, registerData);
    if (createUser) {
      return responses.success(messages.registerSuccess, createUser);
    }
  };

  static userDetails = async ({ userId }) => {
    const isChannelExist = await db.user.findOne({ _id: userId });
    if (isChannelExist) {
      return responses.success(messages.channelDetails, isChannelExist);
    } else {
      return responses.badRequest(messages.userNotFound);
    }
  };
}

export default ChannelService;
