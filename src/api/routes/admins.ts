import express from "express";
import { signin, signup, getAdminInfo, updateInfo, uploadTeacherDetails, upload } from "../controllers/adminController";
import { authMiddleware } from "../controllers/middleware";

// Any endpoint here hits the /a/ endpoint

export const api = express();
api.post("/signin", signin);
api.post("/signup", signup);
api.use(authMiddleware);
api.get("/:employeeId", getAdminInfo);
api.put("/:adminId", updateInfo);
api.post("/upload",upload.single('file'),uploadTeacherDetails)