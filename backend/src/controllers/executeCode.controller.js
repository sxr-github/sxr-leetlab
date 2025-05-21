import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async (req , res) => {
    try {
        const{source_code , language_id , stdin , expected_outputs , problemId} = req.body ;

        const userId = req.user.id ;

        // Validating test cases 

        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ){
            return res.status(400).json({error : "Invalid or Missing Test Cases"})
        }

        // Preparing each testcases for judge0 batch submissions 
        const submissions = stdin.map((input) =>({
            source_code , 
            language_id ,
            stdin:input ,
            base64_encoded : false ,
            wait : false
        })) ;

        // Sending this submission batch to Judge0 
        const submitResponse = await submitBatch()

        const token =submitResponse.map((res) => res.token) ;

        // Poll judge0 for results of all submitted test cases
        const result = await  pollBatchResults(token) ;

        console.log('Result ------------>')
        console.log(result)

        res.status(200).json({
            message : "Code Executedd !"
        })

    } catch (error) {
        
    }
}