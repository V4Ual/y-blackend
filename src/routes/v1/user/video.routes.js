import { Router } from "express";
import { userModule } from "../../../controllers/index.js";
import { errorUtil, imageUtils } from "../../../utils/index.js";
import { authCheck } from "../../../middleware/index.js";
const videoRoute = Router();
const videoCtl = new userModule.videoCtl();
const upload = imageUtils.uploadImage();

videoRoute.post(
  "/create",
  upload.fields([
    { name: "video", maxCount: "1" },
    { name: "thumbnail", maxCount: "1" },
  ]),
  errorUtil(authCheck),
  async (req, res) => {
    const result = await videoCtl.transcodeUploadedVideo(req, res);
    return res.status(result.statusCode).send(result);
  }
);

videoRoute.get(
  "/list",
  errorUtil(authCheck),
  errorUtil(async (req, res) => {
    const result = await videoCtl.videoList(req, res);
    return res.status(result.statusCode).send(result);
  })
);

videoRoute.get(
  "/details",
  errorUtil(authCheck),
  errorUtil(async (req, res) => {
    const result = await videoCtl.videoDetailsGet(req, res);
    return res.status(result.statusCode).send(result);
  })
);

export { videoRoute };
