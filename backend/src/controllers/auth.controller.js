import bcrypt from "bcryptjs" ;
import {db} from "../libs/db.js" ;
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken" ;
import { createAvailableUsername } from "../libs/username.lib.js";

// A Docker deployment can still be served over plain HTTP on localhost.  Do
// not mark the session cookie `Secure` unless HTTPS is actually enabled,
// otherwise browsers silently discard it and every protected API call fails.
const sessionCookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: 1000 * 60 * 60 * 24 * 7,
};

export const register = async (req , res) => {
    const{email , password , name} = req.body ;
    try {
        if (!email || !password || !name || password.length < 6) {
            return res.status(400).json({ error: "Name, a valid email, and a password of at least 6 characters are required" });
        }
        const existingUser = await db.user.findUnique({
            where:{
                email
            }
        })

        if(existingUser){
            return res.status(400).json({
                error : "User already exist" 
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10) ;
        const username = await createAvailableUsername(db, name, email);

        const newUser = await db.user.create({
            data : {
                email ,
                username,
                password : hashedPassword ,
                name , 
                role:UserRole.USER
            }
        })

        const token = jwt.sign({id:newUser.id} , process.env.JWT_SECRET , {
            expiresIn : "7d"
        })

        res.cookie("jwt", token, sessionCookieOptions)

        res.status(201).json({
            message : "user created successfully" , 
            user :{
            
            id : newUser.id ,
            email : newUser.email ,
            username: newUser.username,
            name : newUser.name ,
            role : newUser.role ,
            image :newUser.image
        
        }
        })
        
    } catch (error) {
        console.error("Error creating user" , error) ;
        res.status(500).json({
            error : "Error creating user"
        })
        
    }
}


export const login = async (req , res) => {
    const {email , password} = req.body ;

    try {
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
        const user = await db.user.findUnique({
            where :{
            email
    }})
    
    if (!user){
        return res.status(401).json({
            error : "User  not found " 

        })
    }

    const Ismatch  = await bcrypt.compare(password , user.password) ;

    if (!Ismatch){
        return res.status(401).json({
            error : " Invalid Credentials"
        })
    }

    const token = jwt.sign({id:user.id} , process.env.JWT_SECRET , {
        expiresIn : "7d"
    })

    res.cookie("jwt", token, sessionCookieOptions)

    res.status(200).json({
        message : "user logged in successfully" , 
            user :{
            
            id : user.id ,
            email : user.email ,
            username: user.username,
            name : user.name ,
            role : user.role ,
            image :user.image
        
        }
    })
    } catch (error) {
        console.error("Error login  user" , error) ;
        res.status(500).json({
            error : "Error login user"
        })
    }
}



export const logout = async (req , res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: sessionCookieOptions.httpOnly,
            sameSite: sessionCookieOptions.sameSite,
            secure: sessionCookieOptions.secure,
        })

        res.status(200).json({
            success : true ,
            message : "User logout successfully"
        })
        
    } catch (error) {
        console.error("Error login out user" , error) ;
        res.status(500).json({
            error : "Error login out user"
        })
        
    }
}


export const check = async (req , res) => {
    try {
        res.status(200).json({
            success : true ,
            message :"User authenticated successfully", 
            user:req.user 
        })
    } catch (error) {
        console.error("error checking error ",error);
        res.status(500).json({
            error : "error checkig user"
        })
        
        
    }
}

export const getProfile = async (req, res) => {
    try {
        const [solved, submissions, recentSubmissions] = await Promise.all([
            db.problemSolved.findMany({ where: { userId: req.user.id }, include: { problem: { select: { difficulty: true } } } }),
            db.submission.findMany({ where: { userId: req.user.id }, select: { status: true, language: true } }),
            db.submission.findMany({ where: { userId: req.user.id }, include: { problem: { select: { id: true, title: true, difficulty: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
        ]);
        const byDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 };
        solved.forEach(({ problem }) => { byDifficulty[problem.difficulty] += 1; });
        const languages = submissions.reduce((total, submission) => ({ ...total, [submission.language]: (total[submission.language] || 0) + 1 }), {});
        return res.status(200).json({
            success: true,
            profile: { user: req.user, solved: solved.length, submissions: submissions.length, accepted: submissions.filter((submission) => submission.status === "Accepted").length, byDifficulty, languages, recentSubmissions },
        });
    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({ error: "Failed to load profile" });
    }
};


