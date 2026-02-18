import os
import aiohttp
import logging
from livekit.agents import llm

logger = logging.getLogger("rag-tool")

class LoreTool:
    def __init__(self):
        self.api_url = os.getenv("INTERNAL_API_URL", "http://localhost:3000/api/internal/rag")
        self.api_secret = os.getenv("INTERNAL_API_SECRET")

    @llm.function_tool(description="Consult the Archives of Bharatvarsh to answer questions about the novel's lore, characters, or history.")
    async def lookup_lore(self, query: str, spoiler_mode: str = "S1") -> str:
        """
        Queries the internal RAG API to retrieve relevant context from the vector store.

        Args:
            query: The specific question or topic to search in the archives.
            spoiler_mode: The spoiler tier to use: 'S1' (spoiler-free), 'S2' (minor spoilers), 'S3' (full spoilers).
        """
        logger.info(f"Looking up lore: {query} [Mode: {spoiler_mode}]")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    json={"query": query, "spoilerMode": spoiler_mode},
                    headers={"Authorization": f"Bearer {self.api_secret}"},
                    timeout=5.0
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"RAG API Error ({response.status}): {error_text}")
                        return "I cannot access the archives at this moment. My connection is hazy."

                    data = await response.json()
                    context = data.get("context", "")
                    
                    if not context:
                        return "The archives are silent on this matter. I find no records matching your query."
                        
                    return f"FOUND ARCHIVE RECORDS:\n{context}"

        except Exception as e:
            logger.error(f"Failed to query RAG API: {e}")
            return "A disturbance in the Mesh prevents me from accessing the archives."
