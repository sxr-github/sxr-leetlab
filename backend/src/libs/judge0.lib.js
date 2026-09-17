import axios from "axios" ;
export const getJudge0LanguageId = (Language) => {
    const languageMap = {
        "PYTHON" : 71 ,
        "JAVA" : 62 ,
        "JAVASCRIPT" : 63
    }
    return languageMap [Language.toUpperCase()]
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve , ms));
const judgeUrl = () => {
    const url = process.env.JUDGE0_API_URL?.replace(/\/$/, "");
    if (!url) throw new Error("Code execution is not configured. Set JUDGE0_API_URL.");
    return url;
};

export const pollBatchResults = async (tokens) => {
    if (!Array.isArray(tokens) || !tokens.length) throw new Error("Judge0 did not return submission tokens.");
    const deadline = Date.now() + 60_000;
    while(Date.now() < deadline){
        const {data} = await axios.get(`${judgeUrl()}/submissions/batch` , {
            params :{
                tokens:tokens.join(",") ,
                base64_encoded : false ,
            },
            // Without a request timeout a broken Judge0 connection can leave
            // this endpoint waiting forever and tie up a Node request.
            timeout: 20_000,

        })
        
        const results = data.submissions;
        if (!Array.isArray(results) || results.length !== tokens.length) throw new Error("Judge0 returned an invalid batch result.");

        const isAlldone =results.every(
            (r) => r.status?.id !== 1 && r.status?.id !==2
        )

        if(isAlldone) return results
        await sleep(1000);
    }
    throw new Error("Code execution timed out. Please try again.");
}


export const submitBatch = async (submissions) => {
    if (!Array.isArray(submissions) || !submissions.length) throw new Error("At least one test case is required.");
    const  {data} = await axios.post(`${judgeUrl()}/submissions/batch?base64_encoded=false`,{
        submissions
        }, { timeout: 20_000 });
        return data ;
}

export function getLanguageName(LanguageId){
    const LANGUAGE_NAME = {
        71 : "Python",
        62 : "Java",
        63 : "JavaScript",
    }

    return LANGUAGE_NAME[LanguageId] || "Unknown" ;
}
