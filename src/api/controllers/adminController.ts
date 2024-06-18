import { Request, Response } from "express";
import { dateCheck } from "../../zod";
import bcrypt from "bcrypt";
import prisma from "../../utils/db";
import jwt from "jsonwebtoken";
import multer from "multer";
import * as xlsx from "xlsx";
import * as path from "path";
import * as fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now() + file.originalname}`);
  },
});

export const upload = multer({ storage });

export const signup = async (req: Request, res: Response) => {
  console.log("HI");
  
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
  } catch (e: any) {
    return res.status(500).json({
      err: "internal server error: " + e.message,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const exists = await prisma.admin.findUnique({
      where: { email },
    });
    if (exists)
      return res.status(400).json({
        err: "user already exists!",
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
      { expiresIn: "12h" }
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
  const { employeeId } = req.params;

  console.log(req);

  if (!employeeId)
    return res.status(400).json({
      err: "no admin id found!",
    });

  if (!userRole || userRole !== "admin" || req.adminId !== employeeId) {
    return res.status(403).json({
      err: "Either you are not admin, or not requesting your information!",
    });
  }

  try {
    const response = await prisma.admin.findUnique({
      where: { adminId: employeeId },
    });

    return res.status(200).json(response);
  } catch (e: any) {
    return res.status(400).json({
      err: e.message,
    });
  }
};

export const updateInfo = async (req: Request, res: Response) => {
  const { userRole } = req;
  const { adminId } = req.params;
  const { password, dateOfBirth, gender, address, phNo } = req.body;

  if (!adminId)
    return res.status(400).json({
      err: "no admin id found!",
    });

  if (!userRole || userRole !== "admin" || req.adminId !== adminId) {
    return res.status(403).json({
      err: "Either you are not admin, or not requesting your information!",
    });
  }

  let dob: Date | undefined = undefined;
  try {
    if (dateOfBirth) {
      const l = dateOfBirth.split("-");
      if (l.length !== 3) {
        dob = new Date(Date.now());
      } else {
        const year = parseInt(l[2], 10);
        const month = parseInt(l[1], 10) - 1;
        const date = parseInt(l[0], 10) + 1;

        dob = new Date(year, month, date);
      }
    } else dob = undefined;

    if (dob) {
      const x = dob.toDateString().split(" ");
      const monthInd =
        "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(x[1]) / 3 + 1;
      const parseDate = `${x[3]}-${(monthInd < 10 ? "0" : "") + monthInd}-${
        x[2]
      }`;

      const obj = dateCheck.safeParse({
        date: parseDate,
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
    }

    await prisma.admin.update({
      data: {
        address,
        dateOfBirth: dob,
        gender,
        phNo,
      },
      where: { adminId },
    });

    if (password) {
      await prisma.admin.update({
        data: { password: await bcrypt.hash(password, 10) },
        where: { adminId },
      });
    }

    return res.status(200).json({
      msg: "successfully updated data!",
    });
  } catch (e: any) {
    return res.status(400).json({
      err: e.message,
    });
  }
};

export const uploadTeacherDetails = async (req: Request, res: Response) => {
  interface Teacher {
    name: string;
    email: string;
    employeeId: string;
    password: string;
    courseUnderataken: string;
    joiningDate: Date;
  }
  const directoryPath = path.join(__dirname, "../../../uploads");
  const files = fs.readdirSync(directoryPath);
  const excelfile = files[0];
  const excelFilePath = path.join(directoryPath, excelfile);
  const workbook = xlsx.readFile(excelFilePath);
  const worksheet = xlsx.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  ) as Teacher[];

  try {
    for (let details of worksheet) {
      const resp = await prisma.teacher.findFirst({
        where: {
          email: details.email,
        },
      });
      if (!resp) {
        const response = await prisma.teacher.create({
          data: {
            name: details.name,
            email: details.email,
            password: details.password,
            employeeId: details.employeeId,
            joiningDate: details.joiningDate
          },
        });
      }
    }
  } catch (err) {
    return res.status(400).json({
      err: "error while uploading " + err,
    });
  }

  for (const file of files) {
    fs.unlink(path.join(directoryPath, file), (err) => {
      if (err) {
        console.log("error while deleting");
      }else{
        console.log("deleted succesfully")
      }
    });
  }

  return res.json({ msg: worksheet });
};
