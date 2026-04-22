import httpx
import logging
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from services.ingestion import ingest_regulation
from services.alert_engine import run_impact_analysis
from core.utils import get_random_user_agent

logger = logging.getLogger(__name__)

# National People's Congress legislation portal
CHINA_NEWS_EN_RSS = "https://news.google.com/rss/search?q=China+regulation+SAMR+PIPL+CSRC+PBOC+law&hl=en-CN&gl=CN&ceid=CN:en"
# China Law Translate covers major PRC regulations in English
CHINA_CLT_RSS = "https://www.chinalawtranslate.com/feed/"

async def sync_china_regulations(db: AsyncSession, limit: int = 10) -> int:
    """Coordinates Chinese regulatory sync from China Law Translate and news alerts."""
    count = 0
    count += await _sync_china_clt(db, limit)
    count += await _sync_china_news(db, limit // 2)
    return count

async def _sync_china_clt(db: AsyncSession, limit: int = 10) -> int:
    """Fetches PRC regulatory translations from China Law Translate RSS."""
    logger.info("🇨🇳 Syncing China: China Law Translate RSS")
    headers = {"User-Agent": get_random_user_agent()}

    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(CHINA_CLT_RSS)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "xml")
        except Exception as e:
            logger.error(f"❌ China Law Translate RSS Failure: {e}")
            return 0

        items = soup.find_all("item")
        print(f"📡 Found {len(items)} items in China Law Translate RSS.")
        count = 0
        for item in items[:limit]:
            title = item.find("title").text if item.find("title") else "Unknown Chinese Regulation"
            link = item.find("link").text if item.find("link") else ""
            description = item.find("description").text if item.find("description") else title

            # Strip HTML from description
            try:
                description = BeautifulSoup(description, "html.parser").get_text()
            except Exception:
                pass

            category = "compliance"
            lower = (title + description).lower()
            if "personal information" in lower or "pipl" in lower or "data" in lower or "privacy" in lower:
                category = "data_privacy"
            elif "financial" in lower or "csrc" in lower or "pboc" in lower or "banking" in lower:
                category = "financial"
            elif "environment" in lower or "carbon" in lower or "climate" in lower:
                category = "environmental"
            elif "health" in lower or "medical" in lower or "drug" in lower:
                category = "healthcare"
            elif "cybersecurity" in lower or "network" in lower or "security" in lower:
                category = "security"

            print(f"📥 Syncing China: {title[:60]}... ({category})")
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=title,
                    text=f"{title}\n\n{description[:1000]}\n\nSource: {link}",
                    source="China Law Translate",
                    category=category,
                    jurisdiction="CN",
                )
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ China CLT Ingest Error: {e}")
        return count

async def _sync_china_news(db: AsyncSession, limit: int = 5) -> int:
    """Captures real-time Chinese regulatory news alerts (English)."""
    logger.info("🇨🇳 Syncing China: Google News Alerts (EN)")
    headers = {"User-Agent": get_random_user_agent()}
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(CHINA_NEWS_EN_RSS)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "xml")
        except Exception as e:
            logger.error(f"❌ China News Sync Failure: {e}")
            return 0

        items = soup.find_all("item")
        count = 0
        for item in items[:limit]:
            title = item.find("title").text if item.find("title") else "Unknown Chinese Regulatory Alert"
            link = item.find("link").text if item.find("link") else ""
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=title,
                    text=f"Regulatory Intelligence Alert (China).\nFull coverage: {link}",
                    source="China Regulatory News Alerts",
                    category="compliance",
                    jurisdiction="CN",
                )
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ China News Ingest Error: {e}")
        return count
