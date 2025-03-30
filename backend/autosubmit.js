import dotenv from "dotenv";
dotenv.config()
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const QUIZ_API_URL = "https://faas-blr1-8177d592.doserverless.co/api/v1/web/fn-1c23ee6f-939a-44b2-9c4e-d17970ddd644/abes/getQuestionsForQuiz";
const SUBMIT_ANSWER_URL = "https://your-api-url-to-submit-answer";
const QUIZ_UC = "5OUB"; 
const USER_UNIQUE_CODE = "2022B1531150";
const PIN = "1234";

// 🔹 Step 1: Fetch quiz questions
async function fetchQuizQuestions() {
    try {
        const response = await axios.post(QUIZ_API_URL, {
            quiz_uc: QUIZ_UC,
            user_unique_code: USER_UNIQUE_CODE,
            pin: PIN
        });
        return response.data.response.data;
    } catch (error) {
        console.error("Error fetching quiz questions:", error.response?.data || error);
        return [];
    }
}

// 🔹 Step 2: Get AI-generated answers
async function getAIAnswers(questions) {
    const formattedPrompt = questions.map((q, index) => 
        `Q: ${q.question} (ID: ${q.id})\nOptions: ${q.options.map((opt, optIndex) => `${optIndex + 1}. ${opt.replace(/<\/?pre>/g, "")}`).join(", ")}`
    ).join("\n\n");
    

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(`You are an expert quiz solver. Answer these in JSON format:
        [{ "id": <QUESTION_ID>, "correct_option": <CORRECT_OPTION_NUMBER> }] ${formattedPrompt}`);

        const response = await result.response;
        let text = await response.text();

        // 🔹 Fix: Remove code block syntax from response
        text = text.replace(/```json|```/g, "").trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Error getting AI answers:", error);
        return { answers: [] };
    }
}


// 🔹 Step 3: Submit answers
async function submitAnswers(answers) {
    // console.log(answers); 

    console.log("✅ All answers submitted! Now click Final Submit manually.");
}

// async function submitAnswers(answers) {
//     for (const answer of answers) {
//         try {
//             await axios.post(SUBMIT_ANSWER_URL, {
//                 quiz_uc: QUIZ_UC,
//                 user_unique_code: USER_UNIQUE_CODE,
//                 question_id: answer.id,
//                 selected_answer: answer.correct_option
//             });
//             console.log(`✅ Answer submitted for question ${answer.id}`);
//         } catch (error) {
//             console.error(`❌ Failed to submit answer for question ${answer.id}:`, error.response?.data || error);
//         }
//     }
//     console.log("✅ All answers submitted! Now click Final Submit manually.");
// }

// 🔹 Step 4: Main function
async function main() {
    console.log("📥 Fetching quiz questions...");
    const questions = await fetchQuizQuestions();
    if (questions.length === 0) return;

    console.log("🤖 Sending questions to AI for answers...");
    const answers = await getAIAnswers(questions);

    console.log("📤 Submitting answers...");
    await submitAnswers(answers);
}

main();
