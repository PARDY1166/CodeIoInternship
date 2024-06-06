import express from "express";
import { signin, signup } from "../../controllers/studentController";
import { Request, Response } from "express";
import prisma from "../../utils/db";

// Any endpoint here hits the /student/ endpoint

const getAllStudents = async (req: Request, res: Response) => {
  // Implement authentication to check if user is admin
  // If user is admin, return the address and phNo also, otherwise dont send the address and phNo
  try {
    const studs =
      await prisma.$queryRaw`SELECT name, email, usn, age, gender, address, yearofadmission, phNo FROM student INNER JOIN student_details on student.studentid = student_details.studentid;`;

    return res.status(200).json(studs);
  } catch (e: any) {
    return res.status(400).json({
      err: "error occured: " + e.message,
    });
  }
};

const getSpecificStudent = async (req: Request, res: Response) => {
  const { usn } = req.params;
  // Check user is either admin, or is the owner of the data being requested

  try {
    const result: Array<object> =
      await prisma.$queryRaw`SELECT name, email, usn, age, gender, address, yearofadmission, phNo FROM student INNER JOIN student_details on student.studentid = student_details.studentid where usn = ${usn};`;

    if (!result || !result.length)
      return res.status(404).json({
        err: "no such user exists!",
      });

    return res.status(200).json(result[0]);
  } catch (e: any) {
    res.status(400).json({
      err: "Error: " + e.message,
    });
  }
};

export const api = express();
api.post("/signin", signin);
api.post("/signup", signup);

api.get("/", getAllStudents);
api.get("/:usn", getSpecificStudent);