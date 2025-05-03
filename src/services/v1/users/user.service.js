import { db } from "../../../config/db.config.js";
import { messages } from "../../../constant/index.js";
import responses from "../../../responses/index.js";

class UserService {
  static register = async (registerData) => {
    const isExist = await db.user.findOne({ email: registerData.email });

    if (isExist) {
      return responses.badRequest(messages.alredyRegisterEmail, {});
    }
    const createUser = await db.user.create(registerData);
    if (createUser) {
      return responses.success(messages.registerSuccess, createUser);
    }
  };

  static userDetails = async ({ userId }) => {
    const isUserExist = await db.user.findOne({ _id: userId });
    if (isUserExist) {
      return responses.success(messages.userDetails, isUserExist);
    } else {
      return responses.badRequest(messages.userNotFound);
    }
  };
}

export default UserService;
