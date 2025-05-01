import jwt from "jsonwebtoken" ;
import {db} from "../libs/db.js"

export const authmiddleware = async (req , res , next) => {
    
    try {
        const token = req.cookies.jwt ;

        if (!token){
           return res.status(401).json({
            message : "Unautorized -- No token provided"
           })
        }


        let decoded;

        try {
            decoded =  jwt.verify(token , process.env.JWT_SECRET) ; 
        } catch (error) {
            return res.status(401).json({
            message : "Unautorized -- Invalid token"
            }) ;
            
        }
        
        const user = await db.user.findUnique({
            where : {
                id : decoded.id
            },
            select : {
                id : true,
                name : true,
                image : true,
                email : true,
                role : true,
            }
        }) ;

        if(!user){
            return res.status(404).json({
                message : "user not found"
            })
        }

        req.user = user ;
        next();


    } catch (error) {
        console.error("error authenticating the user",error) ;
        res.status(500).json({message : "error authenticating the user"}) ; 
        
    }
}