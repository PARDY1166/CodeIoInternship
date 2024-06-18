import { Request, Response } from "express";
import prisma from "../../utils/db";
import { dateCheck } from "../../zod";
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, admissionDate } = req.body;
  console.log("HEREEEEE");
  
  console.log(name, email, password, admissionDate);
  
  let yoj: Date | undefined;
  try {
    const l = admissionDate.split("-");
    if (l.length !== 3) {
      yoj = new Date(Date.now());
    } else {
      const year = parseInt(l[2], 10);
      const month = parseInt(l[1], 10) - 1;
      const date = parseInt(l[0], 10) + 1;

      if (year < 1900) throw new Error("Invalid date 1");

      yoj = new Date(year, month, date);
      if (yoj > new Date()) throw new Error("Invalid date 2");
    }
  } catch (e: any) {
    yoj = undefined;
  }

  try {
    if (!yoj) throw new Error("invalid admission date provided");
  } catch (e: any) {
    return res.status(500).json({
      err: "error: " + e.message,
    });
  }

  let allowed;
  try {
    allowed = await prisma.adminAddedStudentEmail.findUnique({
      where: { email },
    });
    if (!allowed) return res.status(403).json({ error: "email unauthorized!" });
  } catch (e: any) {
    return res.status(500).json({ error: "error: " + e.message });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const exists = await prisma.student.findFirst({
      where: {
        OR: [{ usn: allowed.usn }, { email }],
      },
    });

    if (exists)
      return res.status(400).json({
        err: "student already exists!",
      });

    const result = await prisma.student.create({
      data: {
        name,
        usn: allowed.usn,
        email,
        password: hashedPassword,
        admissionDate: yoj,
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
          admissionDate: yoj as Date,
        },
      });

      await prisma.adminAddedStudentEmail.update({
        where: {
          email
        },
        data: {
          userId: result.studentId
        }
      })
    } catch (err: any) {
      await prisma.student.delete({
        where: { studentId: result.studentId },
      });

      return res.status(400).json({ err: "error adding data!" });
    }
    console.log("DONE");
    
    return res.status(200).json({ msg: "Success!" });
  } catch (err: any) {
    return res.status(500).json({
      err: "internal server error" + err.message,
    });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  const { userRole } = req;

  if (!userRole || userRole === "student")
    return res.status(403).json({ err: "not authorized!" });

  let studs: Array<object>;
  try {
    if (userRole === "teacher") {
      studs = await prisma.student.findMany({
        select: {
          name: true,
          email: true,
          usn: true,
        },
      });
    } else {
      studs = await prisma.student.findMany({
        include: {
          studentDetails: true,
        },
      });
      if (!studs.length)
        return res.status(404).json({
          err: "no students found!",
        });
    }
    return res.status(200).json(studs);
  } catch (e: any) {
    return res.status(400).json({
      err: "error occured: " + e.message,
    });
  }
};

export const getSpecificStudent = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { userRole } = req;

  if (!userRole || (userRole === "student" && studentId !== req.studentId))
    return res.status(403).json({
      err: "you are neither admin nor requesting your information",
    });

  let studs: object | null;
  try {
    if (userRole === "teacher") {
      studs = await prisma.student.findUnique({
        select: {
          name: true,
          email: true,
          usn: true,
        },
        where: {
          studentId,
        },
      });
    } else {
      studs = await prisma.student.findUnique({
        include: {
          studentDetails: true,
        },
        where: {
          studentId,
        },
      });
      if (!studs)
        return res.status(404).json({
          err: "student not found!",
        });
    }

    return res.status(200).json(studs);
  } catch (e: any) {
    return res.status(400).json({
      err: "error occured: " + e.message,
    });
  }
};

export const getSpecificStudentByUsn = async (req: Request, res: Response) => {
  const { usn } = req.params;
  const { userRole } = req;

  try {
    const exists = await prisma.student.findUnique({
      where: { usn },
    });

    if (!exists)
      return res.status(404).json({
        err: "student not found!",
      });

    if (
      !userRole ||
      (userRole === "student" && exists?.studentId !== req.studentId)
    )
      return res.status(403).json({
        err: "you are neither admin nor requesting your information",
      });
  } catch (e: any) {
    return res.status(500).json({
      err: "error: " + e.message,
    });
  }

  let studs: object | null;
  try {
    if (userRole === "teacher") {
      studs = await prisma.student.findUnique({
        select: {
          name: true,
          email: true,
          usn: true,
        },
        where: {
          usn,
        },
      });
    } else {
      studs = await prisma.student.findUnique({
        include: {
          studentDetails: true,
        },
        where: {
          usn,
        },
      });
      if (!studs)
        return res.status(402).json({
          err: "student not found!",
        });
    }

    return res.status(200).json(studs);
  } catch (e: any) {
    return res.status(400).json({
      err: "error occured: " + e.message,
    });
  }
};

export const updateStudentDetails = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { password, dateOfBirth, gender, address, phNo } = req.body;

  if (password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.student.update({
        data: {
          password: hashedPassword,
        },
        where: { studentId },
      });
    } catch (e: any) {
      console.log("error updatinng password!");
    }
  }

  try {
    let dob: Date | undefined = undefined;
    if (dateOfBirth) {
      const l = dateOfBirth.split("-");
      if (l.length === 3) {
        const year = parseInt(l[2], 10);
        const month = parseInt(l[1], 10) - 1;
        const date = parseInt(l[0], 10) + 1;

        dob = new Date(year, month, date);
      } else dob = undefined;

      if (dob) {
        const x = dob.toDateString().split(" ");
        const monthInd =
          "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(x[1]) / 3 + 1;
        const parseDate = `${x[3]}-${(monthInd < 10 ? "0" : "") + monthInd}-${
          x[2]
        }`;
        if (
          !dateCheck.safeParse({
            date: parseDate,
          }).success
        )
          throw new Error("invalid date of birth provided!");
      }
    }

    await prisma.studentDetails.update({
      data: {
        gender,
        address,
        phNo,
        dateOfBirth: dob,
      },
      where: { studentId },
    });

    return res.status(200).json({
      msg: "success!",
    });
  } catch (e: any) {
    return res.status(400).json({
      err: "error updating profile! " + e.message,
    });
  }
};
