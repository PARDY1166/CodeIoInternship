import { Request, Response } from "express";
import prisma from "../../utils/db";
import jwt from "jsonwebtoken";
import { signInSchema, signInSchemaTeacher, signupSchemaTeacher } from "../../zod";
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
  const { name, employeeId, email, password } = req.body;
  try {
    const obj = signupSchemaTeacher.safeParse({
      name,
      employeeId,
      password,
      email,
    });
    if (!obj.success) {
      return res.status(401).json({
        err: obj.error.issues[0].message,
      });
    }
  } catch (err) {
    return res.status(500).json({
      err: "internal server error",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.teacher.create({
      data: {
        name,
        employeeId,
        email,
        password: hashedPassword,
      },
    });
    if (!result) {
      return res.status(401).json({
        err: "couldnt add to the database",
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      err: "internal server error" + err.message,
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { success } = signInSchemaTeacher.safeParse({ email, password });
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
    const exists = await prisma.teacher.findFirst({
      where: {
        email,
      },
    });

    if (!exists) {
      return res.status(404).json({
        err: "no teacher exists",
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

    const teacherId = exists.teacherId;
    const userRole = "teacher";
    const token = jwt.sign(
      { teacherId, userRole },
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

export const getAllTeachers = async (req: Request, res: Response) => {
  // check credentials

  try {
    const result: Array<object> =
      await prisma.$queryRaw`SELECT t.teacherid, name, email, employeeid, age, gender, address, yearOfJoining, phNo, teacher from teacher t INNER JOIN teacherDetails td ON t.teacherId = td.teacherId;`;

    if (!result.length)
      return res.status(404).json({
        err: "No users found!",
      });

    res.status(200).json(result);
  } catch (e: any) {
    return res.status(400).json({
      err: "Error: " + e.message,
    });
  }
};

export const getSpecificTeacher = async (req: Request, res: Response) => {
  const { empid } = req.params;
  // check credentials

  try {
    const result: Array<object> =
      await prisma.$queryRaw`SELECT t.teacherid, name, email, employeeid, age, gender, address, yearOfJoining, phNo, teacher from teacher t INNER JOIN teacherDetails td ON t.teacherId = td.teacherId where t.employeeId = ${empid};`;

    if (!result.length)
      return res.status(404).json({
        err: "No user found!",
      });

    return res.status(200).json(result[0]);
  } catch (e: any) {
    res.status(400).json({
      err: "Error: " + e.message,
    });
  }
};
