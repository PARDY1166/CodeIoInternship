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
        semester: semester ? ('a' + semester as semesterenum) : undefined,
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
  if(userRole === "student") return res.status(403).json({
    err: "not authorized!"
  });

  const {classId, studentId} = req.body;
  if(userRole === "teacher") {
    
  }
  else {

  }
}