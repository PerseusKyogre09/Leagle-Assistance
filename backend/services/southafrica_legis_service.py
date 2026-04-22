import httpx
import logging
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from services.ingestion import ingest_regulation
from services.alert_engine import run_impact_analysis
from core.utils import get_random_user_agent

logger = logging.getLogger(__name__)

# South Africa: Government Gazette and news
SOUTHAFRICA_NEWS_RSS = "https://news.google.com/rss/search?q=South+Africa+regulation+law+FSCA+SARB+POPIA&hl=en-ZA&gl=ZA&ceid=ZA:en"
# SA Government Gazette RSS (gpwonline.co.za publishes gazette notices)
SOUTHAFRICA_GAZETTE_RSS = "https://www.gpwonline.co.za/Gazettes/Pages/Published-National-Government-Gazettes.aspx"

async def sync_southafrica_regulations(db: AsyncSession, limit: int = 10) -> int:
    """Coordinates South African regulatory sync from news alerts (primary channel)."""
    count = 0
    count += await _sync_southafrica_news(db, limit)
    return count

async def _sync_southafrica_news(db: AsyncSession, limit: int = 10) -> int:
    """Captures real-time South African regulatory news alerts."""
    logger.info("🇿🇦 Syncing South Africa: Google News Alerts (EN)")
    headers = {"User-Agent": get_random_user_agent()}

    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(SOUTHAFRICA_NEWS_RSS)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "xml")
        except Exception as e:
            logger.error(f"❌ South Africa News Sync Failure: {e}")
            return 0

        items = soup.find_all("item")
        print(f"📡 Found {len(items)} items in South Africa News RSS.")
        count = 0
        for item in items[:limit]:
            title = item.find("title").text if item.find("title") else "Unknown South African Regulatory Alert"
            link = item.find("link").text if item.find("link") else ""

            category = "compliance"
            lower = title.lower()
            if "popia" in lower or "data" in lower or "privacy" in lower or "information" in lower:
                category = "data_privacy"
            elif "fsca" in lower or "sarb" in lower or "financial" in lower or "banking" in lower or "nca" in lower:
                category = "financial"
            elif "environment" in lower or "climate" in lower or "carbon" in lower:
                category = "environmental"
            elif "health" in lower or "nhls" in lower or "nhi" in lower:
                category = "healthcare"

            print(f"📥 Syncing South Africa: {title[:60]}... ({category})")
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=title,
                    text=f"Regulatory Intelligence Alert (South Africa).\nFull coverage: {link}",
                    source="South Africa Regulatory News Alerts",
                    category=category,
                    jurisdiction="ZA",
                )
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ South Africa News Ingest Error: {e}")
        return count
