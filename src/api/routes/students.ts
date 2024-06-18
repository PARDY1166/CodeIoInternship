import express from "express";
import {
  getAllStudents,
  getSpecificStudent,
  getSpecificStudentByUsn,
  signup,
  updateStudentDetails,
} from "../controllers/studentController";
import { authMiddleware } from "../controllers/middleware";
import { Request, Response } from "express";

// Any endpoint here hits the /s/ endpoint

export const api = express();
api.get("/", (req: Request, res: Response) => {console.log("HIHIHIHIHIHIH"); res.status(200).json({msg:"Success"})})
api.post("/register", signup);
api.use(authMiddleware);
api.get("/", getAllStudents);
api.get("/:studentId", getSpecificStudent);
api.get("/usn/:usn", getSpecificStudentByUsn);
api.put("/:studentId", updateStudentDetails);
