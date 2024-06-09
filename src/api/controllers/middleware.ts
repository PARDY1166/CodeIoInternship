import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  studentId?: string;
  teacherId?: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization || "";

  const jwtToken = token.split(" ")[1];
  const response = jwt.verify(
    jwtToken,
    process.env.JWT_SECRET as string
  ) as CustomJwtPayload;
  if (response.studentId || response.teacherId) {
    next();
  } else {
    return res.json({
      err: "not authorized",
    });
  }
}
