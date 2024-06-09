import express from "express";
import { getAllStudents, getSpecificStudent, signin, signup } from "../controllers/studentController";
import { authMiddleware } from "../controllers/middleware";

// Any endpoint here hits the /students/ endpoint


export const api = express();
api.post("/signin", signin);
api.post("/signup", signup);
api.use(authMiddleware);
api.get("/", getAllStudents);
api.get("/:usn", getSpecificStudent);