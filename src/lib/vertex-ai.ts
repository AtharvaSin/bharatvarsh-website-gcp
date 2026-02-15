import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI
// Note: Requires GOOGLE_APPLICATION_CREDENTIALS or ADC
const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT || 'bharatvarsh-website',
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

// Models
const model = process.env.VERTEX_MODEL || 'gemini-2.0-flash-001';
const embeddingModel = process.env.VERTEX_EMBEDDING_MODEL || 'text-embedding-004';

export const getEmbedding = async (text: string): Promise<number[]> => {
    // Fallback to REST API because SDK v1.10.0 lacks embedContent on GenerativeModel
    const project = process.env.GOOGLE_CLOUD_PROJECT || 'bharatvarsh-website';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const modelId = embeddingModel;

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${modelId}:predict`;

    // Get Auth Token
    // @ts-ignore - Accessing underlying auth client
    const authClient = vertexAI.googleAuth;
    const token = await authClient.getAccessToken();

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instances: [{ content: text }],
        }),
    });

    if (!response.ok) {
        throw new Error(`Vertex AI Embedding Error: ${response.status} ${response.statusText} - ${await response.text()}`);
    }

    const data = await response.json();
    const embedding = data.predictions?.[0]?.embeddings?.values;

    if (!embedding) {
        throw new Error(`Failed to generate embedding (no predictions). Response: ${JSON.stringify(data)}`);
    }

    return embedding;
};

// Helper to get token
async function getToken() {
    // @ts-ignore
    return await vertexAI.googleAuth.getAccessToken();
}

export const generateContent = async (prompt: string, systemInstruction?: string) => {
    const project = process.env.GOOGLE_CLOUD_PROJECT || 'bharatvarsh-website';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const modelId = model;

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

    console.log(`[Vertex] Calling endpoint: ${endpoint}`); // DEBUG

    const token = await getToken();

    const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? {
            role: 'system',
            parts: [{ text: systemInstruction }]
        } : undefined,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
        }
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`[Vertex] Error Body: ${errText}`); // DEBUG
        throw new Error(`Vertex AI Generation Error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    // Handle Safety Blocks
    if (candidate?.finishReason === 'SAFETY') {
        console.warn(`[Vertex] Response blocked by safety filters for prompt: "${prompt.slice(0, 50)}..."`);
        return "I’m sorry, traveler. Some parts of our history are shrouded in a darkness I cannot peel back. Perhaps we should speak of other things?";
    }

    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
        console.error(`[Vertex] No content generated. Data:`, JSON.stringify(data));
        throw new Error(`No content generated. Response: ${JSON.stringify(data)}`);
    }

    return text;
};

// Polyfill streamContent using generateContent (non-streaming for now to fix errors)
export const streamContent = async (prompt: string, systemInstruction?: string) => {
    const text = await generateContent(prompt, systemInstruction);

    // Create a fake generator that yields the text in chunks
    async function* generator() {
        // Simulate chunks
        const chunkSize = 20;
        for (let i = 0; i < text.length; i += chunkSize) {
            yield {
                candidates: [{
                    content: {
                        parts: [{
                            text: text.slice(i, i + chunkSize)
                        }]
                    }
                }]
            };
            await new Promise(r => setTimeout(r, 10)); // tiny delay for effect
        }
    }

    return generator();
};
