import express from "express";

const api = express();
api.use(express.json());


const HOST = "localhost";
const PORT = 3000;
api.listen(PORT, () => console.log(`Server up and running on PORT ${PORT} & HOST ${HOST}`));