import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  studentId?: string;
  teacherId?: string;
  adminId?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    userRole?: string;
    studentId?: string;
    teacherId?: string;
    adminId?: string;
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization || "";

  try {
    const jwtToken = token.split(" ")[1];
    const response = jwt?.verify(
      jwtToken,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;
    req.userRole = response.userRole;
    if(response.studentId) req.studentId = response.studentId;
    if(response.teacherId) req.teacherId = response.teacherId;
    if(response.adminId) req.adminId = response.adminId;

    if (
      (response.studentId && response.userRole === "student") ||
      (response.teacherId && response.userRole === "teacher") || 
      (response.adminId && response.userRole === "admin")
    ) {
      next();
    } else {
      return res.json({
        err: "not authorized",
      });
    }
  } catch (e: any) {
    return res.status(403).json({
      err: "not authorized",
    });
  }
}
