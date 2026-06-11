require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "hello" }],
        model: "deepseek-v4-flash",
        stream: false,
    });

    console.log(completion.choices[0].message.content);
}

main();
