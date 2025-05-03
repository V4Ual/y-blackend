import { Router } from "express";
import { userModule } from "../../../controllers/index.js";
import { errorUtil, imageUtils } from "../../../utils/index.js";
import { authCheck } from "../../../middleware/index.js";
const channelRoute = Router();
const channelCtl = new userModule.channelCtl();
const upload = imageUtils.uploadImage();

channelRoute.post(
  "/create",
  upload.fields([
    { name: "banner", maxCount: "1" },
    { name: "profilePic", maxCount: "1" },
  ]),
  errorUtil(authCheck),
  errorUtil (async (req, res) => {
    const result = await channelCtl.register(req, res);
    return res.status(result.statusCode).send(result);
  })
);

export { channelRoute };
