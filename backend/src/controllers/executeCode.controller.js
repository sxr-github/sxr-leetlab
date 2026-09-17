import { getLanguageName, 
         pollBatchResults, 
         submitBatch } from "../libs/judge0.lib.js";
import {db} from "../libs/db.js"


export const executeCode = async (req , res) => {
    try {
        const { source_code, language_id, problemId } = req.body;

        const userId = req.user.id ;
        const numericLanguageId = Number(language_id);
        if (typeof source_code !== "string" || !source_code.trim() || source_code.length > 50_000 || !problemId || !getLanguageName(numericLanguageId) || getLanguageName(numericLanguageId) === "Unknown") {
            return res.status(400).json({ error: "Provide a supported language, problem id, and source code up to 50,000 characters." });
        }

        // Test inputs and expected results must come from the persisted problem,
        // never from the browser. Otherwise a client could submit its own answer key.
        const problem = await db.problem.findUnique({ where: { id: problemId }, select: { testcases: true } });
        if (!problem) return res.status(404).json({ error: "Problem not found" });
        if (!Array.isArray(problem.testcases) || !problem.testcases.length || !problem.testcases.every((test) => typeof test?.input === "string" && typeof test?.output === "string")) {
            return res.status(422).json({ error: "This problem has invalid test cases." });
        }
        const stdin = problem.testcases.map((test) => test.input);
        const expected_outputs = problem.testcases.map((test) => test.output);

        // Preparing each testcases for judge0 batch submissions 
       
        const submissions = stdin.map((input) =>({
            source_code , 
            language_id: numericLanguageId,
            stdin:input ,
            base64_encoded : false ,
            wait : false
        })) ;

        // Sending this submission batch to Judge0 
        
        const submitResponse = await submitBatch(submissions)

        const token =submitResponse.map((res) => res.token) ;

        // Poll judge0 for results of all submitted test cases
        const results = await  pollBatchResults(token) ;

        // Analyze the test cases
        let allPassed = true ;
        const detailedResults = results.map((result ,i)=> {
        const stdout = result.stdout?.trim() ;
        const expected_output = expected_outputs[i]?.trim();
        const passed = stdout === expected_output ;   

        if (!passed){
            allPassed = false 
        } ;

        return{
            testCase : i + 1 ,
            passed,
            stdout,
            expected : expected_output,
            stderr : result.stderr || null ,      
            compileOutput : result.compile_output || null ,
            status : result.status?.description || "Unknown",      
            memory : result.memory ? `${result.memory} KB`: null,
            time : result.time ? `${result.time} s`: null,

        }

        
        
        
        // console.log(`Testcase #${i+1}`) ;
        // console.log(`Input ${stdin[i]}`) ;
        // console.log(`Expected Output for testcase ${expected_output}`) ;
        // console.log(`Actual output ${stdout}`) ;
        // console.log(`Matched : ${passed}`) ;
    })
   
    
    // Store submission summary 
    
    const submissionWithTesCase = await db.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
            userId,
            problemId,
            sourceCode : source_code,
            language : getLanguageName(numericLanguageId),
            stdin : stdin.join("\n"),
            stdout : JSON.stringify(detailedResults.map((r) => r.stdout)),
            stderr : detailedResults.some((r) => r.stderr)
            ?JSON.stringify(detailedResults.map((r) => r.stderr))
            :null,
            compileOutput : detailedResults.some((r) => r.compileOutput)
            ?JSON.stringify(detailedResults.map((r) => r.compileOutput))
            :null,
            status : allPassed ? "Accepted" : "Wrong answer",
            memory : detailedResults.some((r) => r.memory)
            ?JSON.stringify(detailedResults.map((r) => r.memory))
            :null,
            time : detailedResults.some((r) => r.time)
            ?JSON.stringify(detailedResults.map((r) => r.time))
            :null,
        },
      });


    // if all passed marked the problem as solved for the current user

      if (allPassed) {
        await tx.problemSolved.upsert({
        where : {
            userId_problemId : {
                userId , problemId
            }
        },
        update : {},
        create : {
            userId , problemId
        }
        });
      }
    // Save individual testcases result using detailedresult

    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

      await tx.testCaseResult.createMany({
        data : testCaseResults,
      });

      return tx.submission.findUnique({
        where : {
            id : submission.id ,
        },
        include : {
            testCases: true 
        },
      });
    });
        res.status(200).json({
            success : true ,
            message : "Code Executed Successfully !",
            submission : submissionWithTesCase
        }) ;

    } catch (error) {
        console.error("Error Executing Code: ", error.message);
        const isJudgeError = error.isAxiosError || /execution|Judge0|timed out/i.test(error.message);
        res.status(isJudgeError ? 503 : 500).json({ error: isJudgeError ? "Code execution service is unavailable. Please try again." : "Failed to execute code" });
    }
};
