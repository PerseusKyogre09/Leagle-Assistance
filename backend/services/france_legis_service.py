import httpx
import logging
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from services.ingestion import ingest_regulation
from services.alert_engine import run_impact_analysis
from core.utils import get_random_user_agent

logger = logging.getLogger(__name__)

# Légifrance is France's official legal portal — RSS for recent texts
FRANCE_LAWS_RSS = "https://www.legifrance.gouv.fr/rss/derniers-textes.xml"
FRANCE_NEWS_RSS = "https://news.google.com/rss/search?q=France+legislation+reglementation+decret&hl=fr&gl=FR&ceid=FR:fr"
FRANCE_NEWS_EN_RSS = "https://news.google.com/rss/search?q=France+regulation+law+CNIL+AMF&hl=en-FR&gl=FR&ceid=FR:en"

async def sync_france_regulations(db: AsyncSession, limit: int = 10) -> int:
    """Coordinates French regulatory sync from Légifrance and news alerts."""
    count = 0
    count += await _sync_france_laws(db, limit)
    count += await _sync_france_news(db, limit // 2)
    return count

async def _sync_france_laws(db: AsyncSession, limit: int = 10) -> int:
    """Fetches recent French legislative texts from Légifrance RSS."""
    logger.info("🇫🇷 Syncing France: Légifrance RSS")
    headers = {"User-Agent": get_random_user_agent()}

    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(FRANCE_LAWS_RSS)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "xml")
        except Exception as e:
            logger.error(f"❌ France Laws RSS Failure: {e}")
            # Fallback to news-only
            return 0

        items = soup.find_all("item")
        print(f"📡 Found {len(items)} items in France Laws RSS.")
        count = 0
        for item in items[:limit]:
            title = item.find("title").text if item.find("title") else "Unknown French Regulation"
            link = item.find("link").text if item.find("link") else ""
            description = item.find("description").text if item.find("description") else title

            category = "compliance"
            lower = (title + description).lower()
            if "données" in lower or "rgpd" in lower or "cnil" in lower or "privacy" in lower:
                category = "data_privacy"
            elif "financ" in lower or "amf" in lower or "bancaire" in lower or "tax" in lower:
                category = "financial"
            elif "environnement" in lower or "climat" in lower:
                category = "environmental"
            elif "santé" in lower or "health" in lower:
                category = "healthcare"

            print(f"📥 Syncing France: {title[:60]}... ({category})")
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=title,
                    text=f"{title}\n\n{description}\n\nSource: {link}",
                    source="Légifrance (France)",
                    category=category,
                    jurisdiction="France",
                )
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ France Laws Ingest Error: {e}")
        return count

async def _sync_france_news(db: AsyncSession, limit: int = 5) -> int:
    """Captures real-time French regulatory news alerts (English)."""
    logger.info("🇫🇷 Syncing France: Google News Alerts (EN)")
    headers = {"User-Agent": get_random_user_agent()}
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(FRANCE_NEWS_EN_RSS)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "xml")
        except Exception as e:
            logger.error(f"❌ France News Sync Failure: {e}")
            return 0

        items = soup.find_all("item")
        count = 0
        for item in items[:limit]:
            title = item.find("title").text if item.find("title") else "Unknown French Regulatory Alert"
            link = item.find("link").text if item.find("link") else ""
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=title,
                    text=f"Regulatory Intelligence Alert (France).\nFull coverage: {link}",
                    source="France Regulatory News Alerts",
                    category="compliance",
                    jurisdiction="France",
                )
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ France News Ingest Error: {e}")
        return count
