import express from "express";
import { authMiddleware } from "../controllers/middleware";
import { addNewCourse, createUndertaking, getAllCourses } from "../controllers/courseController";

// Any endpoint here hits the /courses/ endpoint

export const api = express();
api.use(authMiddleware);
api.post("/", addNewCourse);
api.get("/", getAllCourses);
api.post("/addClass", createUndertaking);