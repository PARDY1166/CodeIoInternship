import { Request, Response } from "express";
import prisma from "../../utils/db";
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, joiningDate } = req.body;
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

    try {
      if (!yoj) throw new Error("invalid admission date provided");
    } catch (e: any) {
      return res.status(500).json({
        err: "error: " + e.message,
      });
    }
  } catch (e: any) {
    return res.status(500).json({
      err: "internal server error: " + e.message,
    });
  }

  let allowed;
  try {
    allowed = await prisma.adminAddedTeacherEmail.findUnique({
      where: { email },
    });
    if (!allowed) return res.status(403).json({ error: "email unauthorized!" });
  } catch (e: any) {
    return res.status(500).json({ error: "error: " + e.message });
  }

  try {
    const exists = await prisma.teacher.findFirst({
      where: {
        OR: [{ email }, { employeeId: allowed.employeeId }],
      },
    });

    if (exists)
      return res.status(400).json({ error: "user already registered!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.teacher.create({
      data: {
        name,
        employeeId: allowed.employeeId,
        email,
        password: hashedPassword,
        joiningDate: yoj,
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
