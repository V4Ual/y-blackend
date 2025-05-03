import { Router } from "express";
const userRouteList = Router();
import { authRoute } from "./auth.routes.js";
import { userRoute } from "./user.route.js";
import { channelRoute } from "./channel.routes.js";

userRouteList.use("/auth", authRoute);
userRouteList.use("/", userRoute);
userRouteList.use("/channel", channelRoute);

export { userRouteList };
