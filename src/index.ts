import express from "express";
import {indexRouter} from "./routes/index";

const api = express();
api.use(express.json());
api.use(indexRouter);


const HOST = "localhost";
const PORT = 3000;
api.listen(PORT, () => console.log(`Server up and running on PORT ${PORT} & HOST ${HOST}`));