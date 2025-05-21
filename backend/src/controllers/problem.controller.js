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
        constraints , 
        testcases , 
        codeSnippets , 
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
        for(const [language , solutionCode] of Object.entries(referenceSolutions)){
            const languageId = getJudge0LanguageId(language) ;

            if(!languageId){
                return res.status(400).json({ error : `Language ${language} is not supported`})
            }

            const submissions = testcases.map(({input , output}) => ({
                source_code : solutionCode ,
                language_id : languageId ,
                stdin : input ,
                expected_output : output 
            })) 

            const submissionResult = await submitBatch(submissions) ;

            const token = submissionResult.map((res) => res.token) ;
            
            // polling
            
            const results = await pollBatchResults(token) ;

            for (let i = 0 ; i < results.length ; i++ ) {
                const result = results[i] ;
                console.log("result------" , result) ;

                if(result.status.id !== 3){
                    return res.status(400).json({error : `Testcases ${i+1} failed for language ${language}`})

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
                    constraints , 
                    testcases , 
                    codeSnippets , 
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




export const getAllProblems = async (req , res) => {
    try {
        const problem = await db.problem.findMany() ;

        if (!problem){
            return res.status(404).json({
                error : "No problem Found"
            }) ;
        }

        res.status(201).json({
            success : true ,
            message : "Message Fetched Successfully",
            problem

        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error : "Error While Fetching Problems"
        }) ;
        
    }
} ;

export const getProblemById = async (req , res) => {
    const {id} = req.params ;
    
    try {
        const problem = await db.problem.findUnique({
            where:{
                id
            }
        })

        if(!problem){
             return res.status(404).json({
                error : "No problem Found"
            }) ; 
        }

         res.status(200).json({
            success : true ,
            message : "Message Fetched Successfully",
            problem
         })

        
    } catch (error) {
         console.log(error);
        return res.status(500).json({
            error : "Error While Fetching Problems"
        }) ;
    }
} ;

export const updateProblem = async (req , res) => {
    const {id} = req.params ;

     const {
        title , 
        description , 
        difficulty , 
        tags , 
        examples , 
        constraints , 
        testcases , 
        codeSnippets , 
        referenceSolutions ,
    } = req.body ;

    try {
        const problem = await db.problem.update({
            where : {
                id,
            },
            data :{
                title , 
                description , 
                difficulty , 
                tags , 
                examples , 
                constraints , 
                testcases , 
                codeSnippets , 
                referenceSolutions ,
            } ,
        }) ;

        res.status(200).json({
            data : problem ,
            success : true ,
            message : "Probelm Updated Successfully"
        }) ;
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error While Updating Problem" });
    }
} ;

export const  deleteProblem = async (req ,res) => {
    const {id} = req.params ;

    try {
        const problem = await db.problem.findUnique({where : {id}}) ;

        if(!problem){
            return res.status(404).json({error : "Problem Not Found"})
        }

        await db.problem.delete({where : {id}}) ;

        res.status(200).json({
            success : true ,
            message : "Problem deleted Successfully"
        }) ;

    } catch (error) {
        console.log(error)
        return res.status(500).json({
        error : "Error While Deleting The Problem"
        })
    }

} ;

export const getAllProblemSlovedByUser = async (req , res) => {} ;
