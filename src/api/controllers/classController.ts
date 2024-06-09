import { Request, Response } from "express";
import prisma from "../../utils/db";
import { semesterenum } from "@prisma/client";

export const getAllClasses = async (req: Request, res: Response) => {
  const { userRole } = req;

  if (userRole === "student")
    return res.status(403).json({
      err: "not authorized!",
    });

  const { branchId, semester, section, yearOfAdmission } = req.query;

  try {
    const response: Array<object> = await prisma.class.findMany({
      where: {
        branchId: branchId ? (branchId as string) : undefined,
        semester: semester ? (("a" + semester) as semesterenum) : undefined,
        section: section ? (section as string) : undefined,
        yearOfAdmission: yearOfAdmission
          ? (yearOfAdmission as unknown as number)
          : undefined,
      },
    });
    if (!response.length)
      return res.status(404).json({
        err: "no such class!",
      });

    return res.status(200).json(response);
  } catch (e: any) {
    return res.status(500).json({
      err: "error: " + e.message,
    });
  }
};

export const addNewClass = async (req: Request, res: Response) => {
  const { branchId, semester, section, yearOfAdmission } = req.body;
  const { userRole } = req;
  if (userRole !== "admin")
    return res.status(403).json({
      err: "only admin access!",
    });

  try {
    await prisma.class.create({
      data: {
        branchId,
        semester: ("a" + semester) as semesterenum,
        section,
        yearOfAdmission,
      },
    });
    res.status(200).json({
      msg: "successfully added new class!",
    });
  } catch (e: any) {
    return res.status(500).json({
      err: "error: " + e.message,
    });
  }
};

export const addStudent = async (req: Request, res: Response) => {
  const { userRole } = req;
  if (userRole === "student")
    return res.status(403).json({
      err: "not authorized!",
    });

  const { classId, studentId } = req.body;
  if (userRole === "teacher") {
    try {
      const CT = await prisma.classTeacher.findFirst({
        where: { classId },
      });
      if (req.teacherId !== CT?.teacherId)
        return res.status(403).json({
          err: "you are not the class teacher!",
        });
    } catch (e: any) {
      return res.status(500).json({
        err: "error: " + e.message,
      });
    }
  }

  try {
    const exists = await prisma.class.findFirst({
      where: { classId },
      select: { studentIds: true },
    });
    if (!exists)
      return res.status(400).json({
        err: "class does not exist!",
      });

    const prevStudents: Array<string> = exists.studentIds;
    prevStudents.forEach((elem) => {
      if(elem === studentId) throw new Error("student already added!");
    })

    const response = await prisma.class.update({
      data: {
        studentIds: {
          set: [...prevStudents, studentId],
        },
      },
      where: { classId },
    });
    return res.status(200).json(response);
  } catch (e: any) {
    return res.status(500).json({
      err: "error: " + e.message,
    });
  }
};
