import { Request, Response } from "express";
import prisma from "../../utils/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { email, usn, password } = req.body;

  if(usn !== "" && email !== "") return res.status(400).json({error: "use only email or usn, not both"})

  if (usn) {
	console.log("HEHE");
	
    try {
      const result = await prisma.student.findUnique({
        where: {
          usn,
        },
      });
	  console.log("Result: ", result);
	  

      if (!result) {
        return res.status(400).json({
          err: "no such user exists!",
        });
      }

      const match = await bcrypt.compare(password, result.password);
	  console.log("Match: ", match);
	  
      if (match) {
        const token = jwt.sign(
          {
            studentId: result.studentId,
            usn: result.usn,
            userRole: "student",
            name: result.name,
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "1h" }
        );
        return res.status(200).json({
          access_token: `${token}`,
        });
      } else
        res.status(400).json({
          err: "invalid credentials!",
        });
    } catch (e: any) {
      return res.status(500).json({
        err: "error: " + e.message,
      });
    }
  } else {
    try {
      const result = await prisma.teacher.findUnique({
        where: {
          email,
        },
      });

      if (!result) {
        return res.status(400).json({
          err: "invalid credentials!",
        });
      }

      const match = await bcrypt.compare(password, result.password);
      if (match) {
        const token = jwt.sign(
          {
            teacherId: result.teacherId,
            employeeId: result.employeeId,
            email: result.email,
            userRole: "teacher",
            name: result.name,
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "1h" }
        );
        return res.status(200).json({
          access_token: `${token}`,
        });
      } else
        res.status(400).json({
          err: "invalid credentials!",
        });
    } catch (e: any) {
      return res.status(500).json({
        err: "error: " + e.message,
      });
    }
  }
};
