export const getAllSubmission = async(req ,res ) => {
    try {
        const userId = req.user.id ;
        const submissions = await db.submission.findMany({
            where:{
                userId :userId,
            }
        })
        
        res.status(200).json({
            success : true ,
            message : "submission fetched successfully",
            submissions
        })
    } catch (error) {
       console.error("Fetch Submission Error", error) ;
       res.status(500).json({error : "Fialed To Fetch Submission"}) ;
    }
}


export const getSubmissionForProblem = async(req ,res) => {
     try {
        const userId = req.user.id ;
        const problemId = req.params.problemId ;
        const submissions = await db.submission.findMany({
            where:{
                userId : userId,
                problemId : problemId,
            }
        })
        
        res.status(200).json({
            success : true ,
            message : "submission fetched successfully",
            submissions
        })
    } catch (error) {
       console.error("Fetch Submission Error", error) ;
       res.status(500).json({error : "Fialed To Fetch Submission"}) ;
    }
}


export const getAllTheSubmissionForProblem = async(req,res) => {
    try {
        const problemId = req.params.problemId ; 
        const submissions = await db.submission.count({
            where:{
                problemId : problemId,
            }
        })
         res.status(200).json({
            success : true ,
            message : "Submissions fetched successfully",
            count : submissions
        })

    } catch (error) {
       console.error("Fetch Submission Error", error) ;
       res.status(500).json({error : "Fialed To Fetch Submission"}) ; 
    }
}