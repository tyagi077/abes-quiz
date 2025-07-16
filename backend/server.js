import express from "express"
import axios from "axios";
import dotenv from "dotenv";
import Groq from 'groq-sdk';
import cors from "cors"
import mongoose from "mongoose";
import  {UserModel}  from "./db/user.js";
dotenv.config()
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const client = new Groq({
    apiKey: GROQ_API_KEY
});

const app = express();
app.use(express.json());
app.use(cors())
mongoose.connect(process.env.DB_URL);


const QUIZ_API_URL = "https://faas-blr1-8177d592.doserverless.co/api/v1/web/fn-1c23ee6f-939a-44b2-9c4e-d17970ddd644/abes/getQuestionsForQuiz";
const SUBMIT_ANSWER_URL = "https://faas-blr1-8177d592.doserverless.co/api/v1/web/fn-1c23ee6f-939a-44b2-9c4e-d17970ddd644/abes/submitAnswer";
// const QUIZ_FETCH_URL = "https://faas-blr1-8177d592.doserverless.co/api/v1/web/fn-1c23ee6f-939a-44b2-9c4e-d17970ddd644/abes/fetchQuizDetails";



app.post("/api/v1/fetch", async (req, res) => {

    const { quiz_uc, user_unique_code, pin } = req.body;

    if (!quiz_uc || !user_unique_code || !pin) {
        return res.json({
            success: false,
            msg: "Missing fields"
        });
    }

    try {

        const response = await axios.post(QUIZ_API_URL, {
            quiz_uc,
            user_unique_code,
            pin
        });

        const quizData = response?.data?.response?.data || [];

        if (!Array.isArray(quizData)) {
            return res.status(200).json({
                success: false,
                msg: "Quiz has not started yet",
                quiz_details: quizData,
            });
        }

        if (quizData.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Invalid quiz details",
            });
        }
        const formattedPrompt = quizData.map((q, index) =>
            `Q: ${q.question} (ID: ${q.id})\nOptions: ${q.options.map((opt, optIndex) => `${optIndex + 1}. ${opt.replace(/<\/?pre>/g, "")}`).join(", ")}`
        ).join("\n\n");

        try {
            const prompt = `You are an expert quiz solver. Provide the answers only in JSON format. Do not include any other text, explanations, or introductions. Please output only the JSON response like this:

            [{ "id": <QUESTION_ID>, "correct_option": <CORRECT_OPTION_NUMBER> }]
             
            ${formattedPrompt}`;


            const completion = await client.chat.completions.create({
                model: "llama3-70b-8192", 
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.7,
            });

            let text = completion.choices[0]?.message?.content?.trim();
           
            

            let parsedData;
            try {
                parsedData = JSON.parse(text);
            } catch (jsonError) {
                return res.status(500).json({
                    success: false,
                    msg: "Invalid response format",
                    rawData: text
                });
            }


            try {
                const user = await UserModel.findOne({ admission_id: user_unique_code });
                if (!user) {
                  await UserModel.create({ admission_id: user_unique_code });
                }
              } catch (error) {
                console.error("MongoDB Error: ", error.message);
              }

            

            for (const answer of parsedData) {
                try {
                    await axios.post(SUBMIT_ANSWER_URL, {
                        answer: answer.correct_option,
                        pin: pin,
                        question_id: answer.id,
                        quiz_uc: quiz_uc,
                        user_unique_code: user_unique_code
                    });
                    

                } catch (error) {
                    console.error(` Failed to submit answer for question ${answer.id}:`, error.response?.data || error);
                    return res.status(500).json({
                        success: false,
                        error: error.response?.data || error.message
                    });

                }
            }
            res.status(200).json({
                success: true,
                msg: "All answers have been successfully marked! Now, please click 'Final Submit' on the original quiz page to complete the process."
            });



        } catch (error) {
            return res.status(500).json({
                success: false,
                error: "Too many vibes at once 😅 Just wait 60 seconds — your timer starts now. Try again when this toast disappears! It will work, I promise!"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }

})


app.listen(3000);