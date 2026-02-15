
import { generateContent } from './src/lib/vertex-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
    const queries = [
        "who is bharatvarsh hero",
        "how do you look like in person?",
        "tell me"
    ];

    for (const q of queries) {
        console.log(`\nTesting query: "${q}"`);
        try {
            const res = await generateContent(q, "You are Bhoomi, consciousness of the land.");
            console.log("Response:", res);
        } catch (e: any) {
            console.error("Error:", e.message);
        }
    }
}

test();
