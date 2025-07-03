import experss from "express"
import { authmiddleware } from "../middleware/auth.middleware.js";
import { getAllSubmission,
     getAllTheSubmissionForProblem, 
     getSubmissionForProblem } from "../controllers/submission.controller.js";


const submissionRoutes = experss.Router() ;

submissionRoutes.get("/get-all-submissions" , authmiddleware , getAllSubmission) ;
submissionRoutes.get("/get-submission/:problemId" ,authmiddleware , getSubmissionForProblem) ;

submissionRoutes.get("/get-submissions-count/:problemId" , authmiddleware , getAllTheSubmissionForProblem)


export default submissionRoutes ;