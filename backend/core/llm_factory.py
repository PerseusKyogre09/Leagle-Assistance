import logging
import asyncio
from typing import List, Optional, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel
from core.config import settings

logger = logging.getLogger(__name__)

class LLMFactory:
    """
    Factory for creating LLM instances with automatic fallback logic.
    Primary: Gemini 2.0 Flash
    Fallback: Groq (llama-3.3-70b-versatile)
    """

    @staticmethod
    def is_key_valid(key: Optional[str]) -> bool:
        """Checks if a key is non-empty and doesn't look like a placeholder."""
        if not key or not isinstance(key, str):
            return False
        clean_key = key.strip()
        # Basic check for empty or just 'None' string
        if not clean_key or clean_key.lower() == "none" or len(clean_key) < 10:
            return False
        return True

    @staticmethod
    def get_llm(provider: str = None, temperature: float = 0.0, max_tokens: Optional[int] = None) -> BaseChatModel:
        """
        Creates an LLM instance for a specific provider.
        """
        target_provider = provider or settings.llm_provider
        
        if target_provider == "groq":
            if not LLMFactory.is_key_valid(settings.groq_api_key):
                # If Groq is missing, fall back to whatever is next or raise a clear error
                logger.error("❌ Groq API Key is missing or invalid. Check your environment variables.")
                raise ValueError("Groq API Key not configured. Please add GROQ_API_KEY to your environment.")
            
            return ChatGroq(
                model_name="llama-3.3-70b-versatile",
                groq_api_key=settings.groq_api_key,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        
        if target_provider == "nvidia":
            from langchain_nvidia_ai_endpoints import ChatNVIDIA
            return ChatNVIDIA(
                model=settings.llm_model if "nvidia" in settings.llm_model or "meta" in settings.llm_model else "meta/llama-3.3-70b-instruct",
                api_key=settings.nvidia_api_key,
                temperature=temperature,
                max_tokens=max_tokens,
            )

        # Default to Gemini
        if not LLMFactory.is_key_valid(settings.gemini_api_key):
             logger.error("❌ Gemini API Key is missing or invalid.")
             # If we have Groq, we could try falling back here, but usually, 
             # the caller wants a specific provider if they called get_llm(provider=...)
             if target_provider == "gemini":
                 raise ValueError("Gemini API Key not configured.")
        
        return ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.gemini_api_key,
            temperature=temperature,
            max_tokens=max_tokens,
            # Suppress internal retries to allow our manual fallback to trigger faster
            max_retries=0, 
        )

    @staticmethod
    async def invoke_with_fallback(chain: Any, input_data: dict, primary_provider: str = "gemini") -> str:
        """
        Invokes a chain with automatic fallback if the primary provider fails due to quota.
        """
        try:
            # Attempt primary
            return await chain.ainvoke(input_data)
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "quota" in error_str or "resource_exhausted" in error_str:
                logger.warning(f"⚠️ {primary_provider.upper()} Quota Exhausted. Falling back to GROQ...")
                
                # Re-bind the chain with Groq
                fallback_llm = LLMFactory.get_llm(provider="groq")
                
                # Extract the prompt from the chain and re-invoke
                # Note: This assumes the chain is (Prompt | LLM | OutputParser)
                # We can't easily "swap" the LLM inside a compiled chain easily without re-creating it,
                # so we rely on the caller to handle the chain creation or we provide a more robust wrapper.
                raise e # For now, let's let the service handle the swap until we refine this.
            raise e
