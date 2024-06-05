import express, { Request, Response } from "express";
import prisma from "./utils/db";

const api = express();
api.use(express.json());

const HOST = "localhost";
const PORT = 3000;

api.get("/students", async (req: Request, res: Response) => {
	res.send(await prisma.student.findMany());
});

api.get("/students/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	res.send(await prisma.student.findMany());
});

api.listen(PORT, () => console.log(`Server up and running on PORT ${PORT} & HOST ${HOST}`));