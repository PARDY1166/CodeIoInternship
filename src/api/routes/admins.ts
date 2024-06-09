import express from "express";
import { signin, signup, getAdminInfo, updateInfo } from "../controllers/adminController";
import { authMiddleware } from "../controllers/middleware";

// Any endpoint here hits the /a/ endpoint

export const api = express();
api.post("/signin", signin);
api.post("/signup", signup);
api.use(authMiddleware);
api.get("/:empid", getAdminInfo);
api.put("/:empid", updateInfo);