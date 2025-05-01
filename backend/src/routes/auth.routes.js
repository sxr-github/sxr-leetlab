import express from "express" ;
import { register , login , logout , check  } from "../controllers/auth.controller.js";
import { authmiddleware } from "../middleware/auth.middleware.js";


const authRoutes = express.Router() ;

authRoutes.post("/register" , register) ;

authRoutes.post("/login" , login) ;

authRoutes.post("/logout" ,authmiddleware ,logout) ;

authRoutes.get("/check" ,authmiddleware , check) ;


export default authRoutes  ;