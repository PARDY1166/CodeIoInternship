import express from "express";
import {
  getAllStudents,
  getSpecificStudent,
  getSpecificStudentByUsn,
  signup,
  updateStudentDetails,
} from "../controllers/studentController";
import { authMiddleware } from "../controllers/middleware";

// Any endpoint here hits the /s/ endpoint

export const api = express();

api.post("/register", signup);
api.use(authMiddleware);
api.get("/", getAllStudents);
api.get("/:studentId", getSpecificStudent);
api.get("/usn/:usn", getSpecificStudentByUsn);
api.put("/:studentId", updateStudentDetails);
