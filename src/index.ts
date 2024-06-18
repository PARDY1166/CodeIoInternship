import express from "express";
import { api as indexRouter } from "./api/routes/index";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const api = express();
api.use(cors);
api.use(express.json());
api.use(indexRouter);

const HOST = "localhost";
const PORT = 3000;
api.listen(PORT, () =>
  console.log(`Server up and running on PORT ${PORT} & HOST ${HOST}`)
);
