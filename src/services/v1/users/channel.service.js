import { db } from "../../../config/db.config.js";
import { messages } from "../../../constant/index.js";
import responses from "../../../responses/index.js";
import { Types } from "mongoose";
import { commonUtils, imageUtils } from "../../../utils/index.js";
const ObjectId = Types.ObjectId;

class ChannelService {
  static register = async (userId, registerData, files) => {
    if (files?.banner?.length > 0) {
      let imageName = commonUtils.generateImageName();
      imageUtils.createImage("banner", files.banner[0].buffer, imageName);
      registerData.banner_image = imageName;
    }

    if (files?.profilePic?.length > 0) {
      let imageName = commonUtils.generateImageName();
      imageUtils.createImage(
        "profileImage",
        files.profilePic[0].buffer,
        imageName
      );
      registerData.channel_image = imageName;
    }
    const createUser = await db.user.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: registerData,
      },
    );
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
