import httpx
import logging
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from services.ingestion import ingest_regulation
from services.alert_engine import run_impact_analysis
from core.utils import get_random_user_agent

logger = logging.getLogger(__name__)

# Russia uses PRAVO.GOV.RU as the official legal portal
# pravo.gov.ru does not have a public RSS, so we rely on news monitoring
RUSSIA_NEWS_EN_RSS = "https://news.google.com/rss/search?q=Russia+federal+law+regulation+decree+Kremlin&hl=en-RU&gl=RU&ceid=RU:en"
# Garant Legal Portal news (English-accessible)
RUSSIA_GARANT_RSS = "https://www.garant.ru/news/rss/"

async def sync_russia_regulations(db: AsyncSession, limit: int = 10) -> int:
    """Coordinates Russian regulatory sync from Garant and news alerts."""
    count = 0
    count += await _sync_russia_garant(db, limit)
    count += await _sync_russia_news(db, limit // 2)
    return count

async def _sync_russia_garant(db: AsyncSession, limit: int = 10) -> int:
    """Fetches Russian legal news from Garant RSS."""
    logger.info("🇷🇺 Syncing Russia: Garant.ru RSS")
    headers = {"User-Agent": get_random_user_agent()}

    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(RUSSIA_GARANT_RSS)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "xml")
        except Exception as e:
            logger.error(f"❌ Russia Garant RSS Failure: {e}")
            return 0

        items = soup.find_all("item")
        print(f"📡 Found {len(items)} items in Russia Garant RSS.")
        count = 0
        for item in items[:limit]:
            title = item.find("title").text if item.find("title") else "Unknown Russian Regulation"
            link = item.find("link").text if item.find("link") else ""
            description = item.find("description").text if item.find("description") else title

            # Strip HTML from description if present
            try:
                description = BeautifulSoup(description, "html.parser").get_text()
            except Exception:
                pass

            category = "compliance"
            lower = (title + description).lower()
            if "персональных данных" in lower or "personal data" in lower or "privacy" in lower:
                category = "data_privacy"
            elif "финансов" in lower or "central bank" in lower or "банк" in lower or "tax" in lower:
                category = "financial"
            elif "экология" in lower or "environment" in lower:
                category = "environmental"
            elif "здравоохранение" in lower or "health" in lower or "medical" in lower:
                category = "healthcare"

            print(f"📥 Syncing Russia: {title[:60]}... ({category})")
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=title,
                    text=f"{title}\n\n{description[:1000]}\n\nSource: {link}",
                    source="Garant Legal Portal (Russia)",
                    category=category,
                    jurisdiction="RU",
                )
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ Russia Garant Ingest Error: {e}")
        return count

async def _sync_russia_news(db: AsyncSession, limit: int = 5) -> int:
    """Captures real-time Russian regulatory news alerts (English)."""
    logger.info("🇷🇺 Syncing Russia: Google News Alerts (EN)")
    headers = {"User-Agent": get_random_user_agent()}
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(RUSSIA_NEWS_EN_RSS)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "xml")
        except Exception as e:
            logger.error(f"❌ Russia News Sync Failure: {e}")
            return 0

        items = soup.find_all("item")
        count = 0
        for item in items[:limit]:
            title = item.find("title").text if item.find("title") else "Unknown Russian Regulatory Alert"
            link = item.find("link").text if item.find("link") else ""
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=title,
                    text=f"Regulatory Intelligence Alert (Russia).\nFull coverage: {link}",
                    source="Russia Regulatory News Alerts",
                    category="compliance",
                    jurisdiction="RU",
                )
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ Russia News Ingest Error: {e}")
        return count
