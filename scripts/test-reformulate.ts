import { reformulateQuery } from '../src/lib/vertex-ai';

async function main() {
    const history = [
        { role: 'user', content: 'Tell me about the Council in Bharatvarsh.' },
        { role: 'assistant', content: 'There is no Council, only the General Directorate.' },
        { role: 'user', content: 'Who leads it?' }
    ];

    const result = await reformulateQuery(history);
    console.log("Original: ", history[history.length - 1].content);
    console.log("Reformulated: ", result);
}
main().catch(console.error);
