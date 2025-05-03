import { userService } from "../../../services/index.js";

class channelController {
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
}

export default channelController;
