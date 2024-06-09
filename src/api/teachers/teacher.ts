import express from "express";
import { getAllTeachers, getSpecificTeacher, signin, signup } from "../controllers/teacherController";
import { authMiddleware } from "../controllers/middleware";

export const api = express();

api.post("/signin", signin);
api.post("/signup", signup);
api.use(authMiddleware);
api.get("/", getAllTeachers);
api.get("/:empid", getSpecificTeacher);