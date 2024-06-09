import express from "express";
import { authMiddleware } from "../controllers/middleware";
import { addNewClass, addStudent, getAllClasses } from "../controllers/classController";

// Any endpoint here hits the /c/ endpoint

export const api = express();
api.use(authMiddleware);
api.get("/", getAllClasses);
api.post("/", addNewClass);
api.post("/addStudent", addStudent);