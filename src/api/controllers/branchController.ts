import { Request, Response } from "express";
import prisma from "../../utils/db";

export const addNewBranch = async (req: Request, res: Response) => {
  const { userRole } = req;
  if (userRole !== "admin")
    return res.status(403).json({
      err: "only admin can add new branch!",
    });

  const { branchName, branchCode } = req.body;

  try {
    const exists: Array<object> =
      await prisma.$queryRaw`SELECT "branchId" FROM branch WHERE ("branchName" = ${branchName}) OR ("branchCode" = ${branchCode})`;
    console.log("Exists!: ", exists);

    if (exists.length)
      return res.status(400).json({
        err: "branch already exists!",
      });

    await prisma.branch.create({
      data: { branchName, branchCode },
    });

    return res.status(200).json({
      msg: "Success!",
    });
  } catch (e: any) {
    return res.status(400).json({
      err: e.message,
    });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  const { userRole } = req;
  if (userRole !== "admin")
    return res.status(403).json({
      err: "only admin can add new branch!",
    });

  const { branchName, branchCode, branchId } = req.body;
  try {
    await prisma.branch.update({
      where: { branchId },
      data: { branchCode, branchName },
    });

    return res.status(200).json({
      msg: "Success",
    });
  } catch (e: any) {
    return res.status(400).json({
      err: e.message,
    });
  }
};

export const getAllBranches = async (req: Request, res: Response) => {
  if (req.userRole === "student")
    return res.status(403).json({
      err: "students can't access this!",
    });

  try {
    const response = await prisma.branch.findMany();
    return res.status(200).json(response);
  } catch (e: any) {
    return res.status(400).json({
      err: e.message,
    });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  const { userRole } = req;
  const { branchId } = req.body;

  if (userRole !== "admin")
    res.status(403).json({
      err: "only admins can delete a branch",
    });

  try {
    await prisma.branch.delete({
      where: {
        branchId,
      },
    });

    return res.status(200).json({ msg: "successfully deleted branch!" });
  } catch (e: any) {
    return res.status(400).json({
      err: e.message,
    });
  }
};
