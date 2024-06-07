import express from "express";
import { getAllStudents, getSpecificStudent, signin, signup } from "../controllers/studentController";
import { Request, Response } from "express";
import prisma from "../../utils/db";

// Any endpoint here hits the /student/ endpoint


export const api = express();
api.post("/signin", signin);
api.post("/signup", signup);
api.get("/", getAllStudents);
api.get("/:usn", getSpecificStudent);