import { getEmbedding } from '../src/lib/vertex-ai';

async function main() {
    console.log('Testing Vertex AI connection (REST Fallback)...');
    try {
        const vector = await getEmbedding('Hello, World!');
        console.log('Success! Vector generated:', vector.slice(0, 5));
    } catch (e) {
        console.error('Vertex AI Test Failed:', e);
        process.exit(1);
    }
}

main();
