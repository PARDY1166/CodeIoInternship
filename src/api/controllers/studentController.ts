import { Request, Response } from "express";
import prisma from "../../utils/db";
import jwt from "jsonwebtoken";
import { signInSchema, signupSchemaStudent } from "../../zod";
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
  const { name, usn, email, password, confirmPassword } = req.body;
  try {
    const obj = signupSchemaStudent.safeParse({
      name,
      usn,
      password,
      email,
      confirmPassword,
    });

    if (!obj.success) {
      return res.status(401).json({
        err: JSON.stringify(obj.error.issues[0].message),
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

    try {
      await prisma.studentDetails.create({
        data: {
          studentId: result.studentId,
        },
      });
    } catch (err: any) {
      await prisma.student.delete({
        where: { studentId: result.studentId },
      });

      return res.status(400).json({ err: "error adding data!" });
    }

    return res.status(200).json({ msg: "Success!" });
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

    const result = await bcrypt.compare(password, exists.password);

    if (!result) {
      return res.status(403).json({
        err: "invalid credentials",
      });
    }

    const studentId = exists.studentId;
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

export const getAllStudents = async (req: Request, res: Response) => {
  // Implement authentication to check if user is admin
  // If user is admin, return the address and phNo also, otherwise dont send the address and phNo
  try {
    const studs =
      await prisma.$queryRaw`SELECT name, email, usn, age, gender, address, yearofadmission, phNo FROM student INNER JOIN student_details on student.studentid = student_details.studentid WHERE;`;

    return res.status(200).json(studs);
  } catch (e: any) {
    return res.status(400).json({
      err: "error occured: " + e.message,
    });
  }
};

export const getSpecificStudent = async (req: Request, res: Response) => {
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
