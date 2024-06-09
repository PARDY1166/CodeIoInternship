import { Request, Response } from "express";
import prisma from "../../utils/db";
import jwt from "jsonwebtoken";
import { signInSchemaTeacher, signupSchemaTeacher } from "../../zod";
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
  const { name, employeeId, email, password, confirmPassword, joiningDate } =
    req.body;
  let yoj: Date;
  try {
    if (joiningDate) {
      const l = joiningDate.split("-");
      if (l.length !== 3) {
        yoj = new Date(Date.now());
      } else {
        const year = parseInt(l[2], 10);
        const month = parseInt(l[1], 10) - 1;
        const date = parseInt(l[0], 10) + 1;

        yoj = new Date(year, month, date);
      }
    } else yoj = new Date(Date.now());

    const x = yoj.toDateString().split(" ");
    const monthInd =
      "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(x[1]) / 3 + 1;
    const parseDate = `${x[3]}-${(monthInd < 10 ? "0" : "") + monthInd}-${
      x[2]
    }`;

    console.log("date: ", parseDate);

    const obj = signupSchemaTeacher.safeParse({
      name,
      employeeId,
      password,
      email,
      confirmPassword,
      joiningDate: parseDate,
    });

    if (!obj.success) {
      return res.status(401).json({
        err:
          "zod schema err: " +
          JSON.stringify(
            "code: " +
              obj.error.issues[0].code +
              "\nmsg: " +
              obj.error.issues[0].message
          ),
      });
    }
  } catch (e: any) {
    return res.status(500).json({
      err: "internal server error: " + e.message,
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

    await prisma.teacherDetails.create({
      data: { joiningDate: yoj, teacherId: result.teacherId },
    });

    return res.status(200).json({
      msg: "Success",
    });
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

    const result = await bcrypt.compare(password, exists.password as string);

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
  const { userRole } = req;
  if (!userRole || userRole !== "admin")
    return res.status(400).json({
      err: "only admin access!",
    });

  try {
    const result: Array<object> = await prisma.teacher.findMany({
      include: {
        teacherDetails: true,
      },
    });

    console.log(result);

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
  const { userRole } = req;
  const { teacherId } = req.params;
  if (userRole !== "admin" && teacherId != req.teacherId)
    return res.status(403).json({
      err: "neither are you admin, nor requesting for your own info",
    });

  try {
    const result: Array<object> = await prisma.teacher.findMany({
      include: {
        teacherDetails: true,
      },
    });

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

export const updateTeacherDetails = async (req: Request, res: Response) => {
  const { teacherId } = req.params;
  const { password, dateOfBirth, gender, address, joiningDate, phNo } =
    req.body;

  const { userRole } = req;
  if (userRole !== "admin" && teacherId !== req.teacherId)
    return res.status(403).json({
      err: "neither are you the admin, nor are you requesting for your own information!",
    });

  if (password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.teacher.update({
        data: {
          password: hashedPassword,
        },
        where: { teacherId },
      });
    } catch (e: any) {
      console.log("error updatinng password!");
    }

    try {
      const l = dateOfBirth.split("-");
      const m = joiningDate.split("-");
      let dob: Date | undefined;
      let yoj: Date | undefined;
      if (l.length === 3) {
        const year = parseInt(l[2], 10);
        const month = parseInt(l[1], 10) - 1;
        const date = parseInt(l[0], 10) + 1;

        dob = new Date(year, month, date);
      } else dob = undefined;

      if (m.length === 3) {
        const year = parseInt(l[2], 10);
        const month = parseInt(l[1], 10) - 1;
        const date = parseInt(l[0], 10) + 1;

        yoj = new Date(year, month, date);
      } else yoj = undefined;

      await prisma.teacherDetails.update({
        data: {
          gender,
          address,
          phNo,
          dateOfBirth: dob,
          joiningDate: yoj,
        },
        where: { teacherId },
      });
    } catch (e: any) {
      return res.status(400).json({
        err: "error updating profile!",
      });
    }
  }
};

export const makeClassTeacher = async (req: Request, res: Response) => {
  const { userRole } = req;
  if (userRole !== "admin")
    return res.status(403).json({
      err: "not authorized for this action!",
    });

  const { classId } = req.body;
  const { teacherId } = req.params;
  
  try {
    await prisma.classTeacher.create({
      data: {
        teacherId,
        classId,
      },
    });

    return res.status(200).json({
      msg: "success!",
    });
  } catch (e: any) {
    return res.status(500).json({
      err: "error: " + e.message,
    });
  }
};
