import { Router } from "express";
import { commonModule } from "../../../controllers/index.js";
import { errorUtil, imageUtils } from "../../../utils/index.js";
import { authCheck } from "../../../middleware/index.js";
const videoRoute = Router();
const videoCtl = new commonModule.videoCtrl();
const upload = imageUtils.uploadImage();

videoRoute.get(
  "/list",
  // errorUtil(authCheck),
  errorUtil(async (req, res) => {
    const result = await videoCtl.videoList(req, res);
    return res.status(result.statusCode).send(result);
  })
);

export { videoRoute };
