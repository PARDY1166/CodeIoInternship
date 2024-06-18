import { Request, Response } from "express";
import prisma from "../../utils/db";

export const updateAttendance = async (req: Request, res: Response) => {
  const { userRole } = req;
  if (userRole === "student")
    return res.status(403).json({
      err: "no student access!",
    });

  const { courseObjId, studentId, classesConducted, classesAttended } = req.body;
	if(!(courseObjId && studentId && classesConducted)) return res.status(400).json({
		err: "provide course object ID, studentID & present status for whom attendance is to be updated!"
	});

  try {
	const exists = await prisma.attendance.findFirst({
		where: {
			courseObjId, studentId
		}
	});

	if(!exists) return res.status(404).json({
		err: "no such student registered!"
	});

	await prisma.attendance.update({
		where: { attendanceId: exists.attendanceId },
		data: {
			classesConducted, classesAttended
		}
	});

	return res.status(200).json({
		msg: "success!"
	})
  }
  catch (e: any) {
	return res.status(400).json({
		err: "error: " + e.message
	});
  }
};

export const fetchFromExcel = async (req: Request, res: Response) => {
	// fetch from uploaded excel sheet and call updateAttendance on all
}