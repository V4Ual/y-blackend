import { messages } from "../../../constant/index.js";
import responses from "../../../responses/index.js";
import { userService } from "../../../services/index.js";

class userController {
  #userService;
  constructor() {
    this.#userService = userService.userService.userService;
  }

  register = async (req, res) => {
    const { email, password } = req.body;
    const prepareData = {
      email: email,
      password: password,
    };

    const result = await this.#userService.register(prepareData);
    return result;
  };

  details = async (req, res) => {
    const { userId } = req.headers;
    const result = await this.#userService.userDetails({ userId });
    console.log(result)
    return result;
  };
}

export default userController;
