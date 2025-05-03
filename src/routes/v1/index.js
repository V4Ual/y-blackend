import { Router } from "express";
const versionV1RouteList = Router();
import { userRouteList } from "./user/index.js";

versionV1RouteList.use("/user", userRouteList);

export { versionV1RouteList };
