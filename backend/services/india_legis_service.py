import httpx
import logging
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from services.ingestion import ingest_regulation
from services.alert_engine import run_impact_analysis

logger = logging.getLogger(__name__)

from core.utils import get_random_user_agent

PIB_RSS_URL = "https://pib.gov.in/RssMain.aspx" # General RSS, ideally we'd find a more specific one

async def sync_india_regulations(db: AsyncSession, limit: int = 10):
    """
    Fetches the latest Indian government notifications from PIB RSS.
    (Proxy for official gazette until a better API is found)
    """
    logger.info(f"📊 Syncing India Regulations from PIB RSS")
    
    headers = {"User-Agent": get_random_user_agent()}
    
    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        try:
            # PIB RSS often requires some specific headers or just the right URL
            response = await client.get(PIB_RSS_URL)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "xml")
        except Exception as e:
            logger.error(f"❌ Failed to fetch India PIB RSS: {e}")
            return 0

        items = soup.find_all("item")
        print(f"📡 Found {len(items)} items in India PIB RSS.")
        
        count = 0
        for item in items[:limit]:
            title = item.find("title").text if item.find("title") else "Unknown India Regulation"
            link = item.find("link").text if item.find("link") else ""
            description = item.find("description").text if item.find("description") else ""
            
            # Look for keywords to filter only regulatory/policy items
            keywords = ["act", "policy", "gazette", "notification", "regulation", "rules", "amendment"]
            if not any(k in title.lower() or k in description.lower() for k in keywords):
                continue

            category = "compliance"
            if "digital" in title.lower() or "data" in title.lower():
                category = "data_privacy"
            elif "finance" in title.lower() or "tax" in title.lower():
                category = "financial"

            print(f"📥 Syncing India: {title[:60]}... ({category})")
            
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=title,
                    text=f"{title}\n\n{description}",
                    source="PIB India",
                    category=category,
                    jurisdiction="India"
                )
                
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ Error ingesting India regulation: {e}")

    return count
