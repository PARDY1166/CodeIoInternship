import express from "express";
import { getAllTeachers, getSpecificTeacher, signin, signup, updateTeacherDetails } from "../controllers/teacherController";
import { authMiddleware } from "../controllers/middleware";

// Endpoint here hits the /api/t/ endpoint

export const api = express();

api.post("/signin", signin);
api.post("/signup", signup);
api.use(authMiddleware);
api.get("/", getAllTeachers);
api.get("/:teacherId", getSpecificTeacher);
api.put("/:teacherId", updateTeacherDetails)