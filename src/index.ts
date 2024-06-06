import express from "express";
import { api as indexRouter } from "./routes/index";
import dotenv from "dotenv";
dotenv.config();

const api = express();
api.use(express.json());
api.use(indexRouter);

const HOST = "localhost";
const PORT = 8888;
api.listen(PORT, () =>
  console.log(`Server up and running on PORT ${PORT} & HOST ${HOST}`)
);
