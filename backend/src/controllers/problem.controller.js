import {db} from "../libs/db.js"
import {getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const createProblem = async (req , res) => { 
    
// getting all the data rom the request body ;
    const {
        title , 
        description , 
        difficulty , 
        tags , 
        examples , 
        contraints , 
        testcases , 
        codesnippet , 
        referenceSolutions ,
    } = req.body ;
    
    //checking the role of the user again ;
    if(req.user.role !== "ADMIN"){
        return res.status(403).json({
            message : "You are not allowed to create a problem"
        })
    }
    //loop through each reference solution for different laguanges ;
    try {
        for(const [laguange , solutionCode] of object.entries(referenceSolutions)){
            const languageId = getJudge0LanguageId(laguange) ;

            if(!languageId){
                return res.status(400).json({ error : `Language ${language} is not supported`})
            }

            const submissions = testcases.map(({input , output}) => ({
                source_code : solutionCode ,
                laguange_id : languageId ,
                stdin : input ,
                expected_output : output 
            })) 

            const submissionResult = await submitBatch(submissions) ;

            const token = submissionResult.map((res) => res.token) ;
            
            // polling
            
            const results = await pollBatchResults(token) ;

            for (let i = 0 ; i < results.lenght ; i++ ) {
                const result = result[i] ;
                console.log("result------" , result) ;

                if(result.status.id !== 3){
                    return res.status(400).json({error : `Testcases ${i+1} failed for language ${laguange}`})

                }
            }

            // Save the problem into database :

            const newProblem = await db.problem.create({
                data : {
                    title ,
                    description ,
                    difficulty ,
                    tags , 
                    examples , 
                    contraints , 
                    testcases , 
                    codesnippet , 
                    referenceSolutions , 
                    userId:req.user.id ,
                }
            })

            return res.status(201).json({
                sucess: true,
                message: "Message Created Successfully",
                problem: newProblem,
            }) ;
            
        }
    } catch (error) {
        console.log(error);
    return res.status(500).json({
      error: "Error While Creating Problem",
    });
        
    }
}




export const getAllProblems = async (req , res) => {} ;

export const getProblemById = async (req , res) => {} ;

export const updateProblem = async (req , res) => {} ;

export const  deleteProblem = async (req ,res) => {} ;

export const getAllProblemSlovedByUser = async (req , res) => {} ;
