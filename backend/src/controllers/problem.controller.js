import {db} from "../libs/db.js"
import {getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

const difficulties = new Set(["EASY", "MEDIUM", "HARD"]);
const validateProblem = (data, { partial = false } = {}) => {
    const errors = [];
    if (!partial || data.title !== undefined) if (typeof data.title !== "string" || !data.title.trim() || data.title.trim().length > 160) errors.push("title must be 1–160 characters");
    if (!partial || data.description !== undefined) if (typeof data.description !== "string" || !data.description.trim()) errors.push("description is required");
    if (!partial || data.difficulty !== undefined) if (!difficulties.has(data.difficulty)) errors.push("difficulty must be EASY, MEDIUM, or HARD");
    if (!partial || data.tags !== undefined) if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string" || !tag.trim()) || data.tags.length > 10) errors.push("tags must be an array of up to 10 non-empty strings");
    if (!partial || data.constraints !== undefined) if (typeof data.constraints !== "string" || !data.constraints.trim()) errors.push("constraints are required");
    if (!partial || data.testcases !== undefined) if (!Array.isArray(data.testcases) || !data.testcases.length || data.testcases.some((test) => typeof test?.input !== "string" || typeof test?.output !== "string")) errors.push("testcases must contain input and output strings");
    if (!partial || data.codeSnippets !== undefined) if (!data.codeSnippets || typeof data.codeSnippets !== "object" || Array.isArray(data.codeSnippets)) errors.push("codeSnippets must be an object");
    if (!partial || data.referenceSolutions !== undefined) if (!data.referenceSolutions || typeof data.referenceSolutions !== "object" || Array.isArray(data.referenceSolutions)) errors.push("referenceSolutions must be an object");
    return errors;
};

const publicProblem = {
    id: true, title: true, description: true, difficulty: true, tags: true, examples: true,
    constraints: true, hints: true, editorial: true, codeSnippets: true, createdAt: true, updatedAt: true,
};

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
    
    const validationErrors = validateProblem(req.body);
    if (validationErrors.length) return res.status(400).json({ error: validationErrors.join("; ") });
    if (!Object.keys(referenceSolutions).length) return res.status(400).json({ error: "Provide at least one reference solution" });
    //loop through each reference solution for different laguanges ;
    try {
        for(const [language , solutionCode] of Object.entries(referenceSolutions)){
            if (typeof solutionCode !== "string" || !solutionCode.trim()) return res.status(400).json({ error: `Reference solution for ${language} must be non-empty` });
            const languageId = getJudge0LanguageId(language) ;

            if(!languageId){
                return res.status(400).json({ error : `Language ${language} is not supported`})
            }

            const submissions = testcases.map(({input}) => ({
                source_code : solutionCode ,
                language_id : languageId ,
                stdin : input
            })) 

            const submissionResult = await submitBatch(submissions) ;

            const token = submissionResult.map((res) => res.token) ;
            
            // polling
            
            const results = await pollBatchResults(token) ;

            for (let i = 0 ; i < results.length ; i++ ) {
                const result = results[i] ;
                const expected = testcases[i].output.trim();
                if (result.status?.id !== 3 || result.stdout?.trim() !== expected) {
                    return res.status(400).json({ error: `Reference solution failed test case ${i + 1} for ${language}` });

                }
            }

        }
        const newProblem = await db.problem.create({
            data: { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions, userId: req.user.id }
        });
        return res.status(201).json({ success: true, message: "Problem created successfully", problem: newProblem });
    } catch (error) {
        console.log(error);
    return res.status(500).json({
      error: "Error While Creating Problem",
    });
        
    }
}




export const getAllProblems = async (req , res) => {
    try {
        const problem = await db.problem.findMany({ select: { id: true, title: true, difficulty: true, tags: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "desc" } }) ;

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

export const getProblemById = async (req , res) => {
    const {id} = req.params ;
    
    try {
        const problem = await db.problem.findUnique({ where: { id }, select: publicProblem })

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

export const getSimilarProblems = async (req, res) => {
    const { id } = req.params;
    try {
        const current = await db.problem.findUnique({ where: { id }, select: { id: true, tags: true, difficulty: true } });
        if (!current) return res.status(404).json({ error: "No problem Found" });
        const candidates = await db.problem.findMany({
            where: { id: { not: id } },
            select: { id: true, title: true, difficulty: true, tags: true },
        });
        const tags = new Set(current.tags.map((tag) => tag.toLowerCase()));
        const problems = candidates
            .map((problem) => ({ ...problem, overlap: problem.tags.filter((tag) => tags.has(tag.toLowerCase())).length }))
            .filter((problem) => problem.overlap > 0)
            .sort((a, b) => b.overlap - a.overlap || Number(b.difficulty === current.difficulty) - Number(a.difficulty === current.difficulty) || a.title.localeCompare(b.title))
            .slice(0, 5);
        return res.status(200).json({ success: true, problems });
    } catch (error) {
        console.error("Similar problems error:", error);
        return res.status(500).json({ error: "Failed to load similar problems" });
    }
};

export const updateProblem = async (req , res) => {
    const {id} = req.params ;

    const validationErrors = validateProblem(req.body, { partial: true });
    if (validationErrors.length) return res.status(400).json({ error: validationErrors.join("; ") });
    const allowedFields = ["title", "description", "difficulty", "tags", "examples", "constraints", "testcases", "codeSnippets", "referenceSolutions", "hints", "editorial"];
    const data = Object.fromEntries(allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [field, typeof req.body[field] === "string" && ["title", "description", "constraints", "hints", "editorial"].includes(field) ? req.body[field].trim() : req.body[field]]));
    if (!Object.keys(data).length) return res.status(400).json({ error: "No editable problem fields were supplied" });

    try {
        const problem = await db.problem.update({
            where : {
                id,
            },
            data,
        }) ;

        res.status(200).json({
            data : problem ,
            success : true ,
            message : "Probelm Updated Successfully"
        }) ;
    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ error: "Problem not found" });
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

export const getAllProblemSlovedByUser = async (req , res) => {
    try {
        const problems = await db.problem.findMany({
            where :{
                solvedBY:{
                    some:{
                        userId : req.user.id 
                    }
                }
            },
            include :{
                solvedBY:{  
                    where:{
                        userId : req.user.id 
                    }
                }

            }
            
        })
        res.status(200).json({
            success : true ,
            message : "Problem Fetched successfully"
            ,problems
        })
    } catch (error) {
        console.error("Error fetching pronlems :" , error) ;
        res.status(500).json ({error :"Failed To Fetch Problems"} )
    }
} ;
