import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCustom = async (req, res) => {
  const { source_code: sourceCode, language_id: languageId, stdin = "" } = req.body || {};
  const numericLanguageId = Number(languageId);
  if (typeof sourceCode !== "string" || !sourceCode.trim() || sourceCode.length > 50_000 || !getLanguageName(numericLanguageId) || getLanguageName(numericLanguageId) === "Unknown") {
    return res.status(400).json({ error: "Provide supported source code up to 50,000 characters." });
  }
  if (typeof stdin !== "string" || stdin.length > 10_000) return res.status(400).json({ error: "Custom input must be text up to 10,000 characters." });
  try {
    const submissions = await submitBatch([{ source_code: sourceCode, language_id: numericLanguageId, stdin, base64_encoded: false, wait: false }]);
    const [result] = await pollBatchResults(submissions.map((submission) => submission.token));
    return res.status(200).json({
      success: true,
      result: {
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        compileOutput: result.compile_output || "",
        status: result.status?.description || "Unknown",
        time: result.time || null,
        memory: result.memory || null,
      },
    });
  } catch (error) {
    console.error("Custom execution error:", error.message);
    return res.status(error.isAxiosError || /Judge0|execution|timed out/i.test(error.message) ? 503 : 500).json({ error: "Custom code execution is unavailable. Please try again." });
  }
};
