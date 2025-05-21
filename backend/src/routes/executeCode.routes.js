import express from "express" ;
import { authmiddleware } from "../middleware/auth.middleware.js";
import { executeCode } from "../controllers/executeCode.controller.js";

const executionRoute = express.Router();

executionRoute.post("/" , authmiddleware , executeCode)

export default executionRoute ;