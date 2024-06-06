import { Request, Response } from "express";
import prisma from "../utils/db";
import jwt from "jsonwebtoken";
import { signInSchema, signupSchemaStudent } from "../zod";
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
  const { name, usn, email, password } = req.body;
  try {
    const { success } = signupSchemaStudent.safeParse({
      name,
      usn,
      password,
      email,
    });
    if (!success) {
      return res.status(401).json({
        err: "invalid data type",
      });
    }
  } catch (err) {
    return res.status(500).json({
      err: "internal server error",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.student.create({
      data: {
        name,
        usn,
        email,
        password: hashedPassword,
      },
    });
    if (!result) {
      return res.status(401).json({
        err: "couldnt add to the database",
      });
    }
    console.log(result);
  } catch (err: any) {
    return res.status(500).json({
      err: "internal server error" + err.message,
    });
  }
};

export const signin = async (req: any, res: any) => {
  const { usn, password } = req.body;

  try {
    const { success } = signInSchema.safeParse({ usn, password });
    if (!success) {
      return res.status(401).json({
        err: "invalid data type",
      });
    }
  } catch (err) {
    return res.status(500).json({
      err: "internal server error",
    });
  }

  try {
    const exists = await prisma.student.findFirst({
      where: {
        usn,
      },
    });

    if (!exists) {
      return res.status(404).json({
        err: "no user exists",
      });
    }

    const result = await bcrypt.compare(
      exists.password as string,
      await bcrypt.hash(password, 10)
    );

    if (!result) {
      return res.status(403).json({
        err: "invalid credentials",
      });
    }

    const studentId = exists.studentid;
    const userRole = "student";
    const token = jwt.sign(
      { studentId, userRole },
      process.env.JWT_SECRET as string
    );
    return res.status(200).json({
      message: `bearer ${token}`,
    });
  } catch (err) {
    return res.json({
      err: "internal server error",
    });
  }
};
