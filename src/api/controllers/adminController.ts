import { Request, Response } from "express";
import { signInSchemaTeacher, signupSchemaTeacher } from "../../zod";
import bcrypt from "bcrypt";
import prisma from "../../utils/db";
import jwt from "jsonwebtoken";

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
    const exists = await prisma.admin.findUnique({
      where: { email }
    });
    if(exists) return res.status(400).json({
      err: "user already exists!"
    });
    
    const result = await prisma.admin.create({
      data: {
        name,
        employeeId,
        email,
        password: hashedPassword,
        joiningDate: yoj || new Date(),
      },
    });
    if (!result) {
      return res.status(401).json({
        err: "couldnt add to the database",
      });
    }
    return res.status(200).json({ msg: "Success!" });
  } catch (err: any) {
    return res.status(500).json({
      err: "internal server error: " + err.message,
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
    const exists = await prisma.admin.findUnique({
      where: {
        email,
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

    const adminId = exists.adminId;
    const userRole = "admin";
    const token = jwt.sign(
      { adminId, userRole },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      message: `Bearer ${token}`,
    });
  } catch (err) {
    return res.json({
      err: "internal server error",
    });
  }
};

export const getAdminInfo = async (req: Request, res: Response) => {
  const { userRole } = req;
  const { empid } = req.params;

  if (!empid)
    return res.status(400).json({
      err: "no admin id found!",
    });

  if (!userRole || userRole !== "admin" || req.adminId !== empid) {
    return res.status(403).json({
      err: "Either you are not admin, or not requesting your information!",
    });
  }

  try {
    const response = await prisma.admin.findUnique({
      where: { employeeId: empid },
    });

    return res.status(200).json(response);
  } catch (e: any) {
    return res.status(400).json({
      err: e.message,
    });
  }
};

export const updateInfo = async (req: Request, res: Response) => {
  const { userRole, adminId } = req;
  const { empid } = req.params;
  const { password, dateOfBirth, gender, address, phNo } = req.body;

  if (!empid)
    return res.status(400).json({
      err: "no admin id found!",
    });

  if (!userRole || userRole !== "admin" || req.adminId !== empid) {
    return res.status(403).json({
      err: "Either you are not admin, or not requesting your information!",
    });
  }

  try {
    await prisma.admin.update({
      data: {
        password: await bcrypt.hash(password, 10),
        address,
        dateOfBirth,
        gender,
        phNo,
      },
      where: { adminId },
    });
    return res.status(200).json({
      msg: "successfully updated data!",
    });
  } catch (e: any) {
    return res.status(400).json({
      err: e.message,
    });
  }
};
