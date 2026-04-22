import httpx
import logging
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from services.ingestion import ingest_regulation
from services.alert_engine import run_impact_analysis
from core.utils import get_random_user_agent

logger = logging.getLogger(__name__)

# e-Gov Japan legislation feed (English portal) and news
JAPAN_LAWS_RSS = "https://news.google.com/rss/search?q=Japan+Ministry+regulation+ordinance+law+amendment&hl=en-JP&gl=JP&ceid=JP:en"
# e-Gov has a REST API for law data (public, no auth needed)
JAPAN_EGOV_API = "https://lic.e-gov.go.jp/api/1/lawdata/search?keyword=%E8%A6%8F%E5%88%99&limit=20&format=json"

async def sync_japan_regulations(db: AsyncSession, limit: int = 10) -> int:
    """Coordinates Japanese regulatory sync from e-Gov and news alerts."""
    count = 0
    count += await _sync_japan_egov(db, limit)
    count += await _sync_japan_news(db, limit // 2)
    return count

async def _sync_japan_egov(db: AsyncSession, limit: int = 10) -> int:
    """Fetches Japanese law data from the e-Gov Law API."""
    logger.info("🇯🇵 Syncing Japan: e-Gov Law API")
    headers = {"User-Agent": get_random_user_agent()}

    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(JAPAN_EGOV_API)
            if response.status_code != 200:
                logger.warning(f"⚠️ e-Gov API unavailable ({response.status_code}), skipping.")
                return 0
            data = response.json()
        except Exception as e:
            logger.error(f"❌ Japan e-Gov API Failure: {e}")
            return 0

        law_list = data.get("laws", data.get("LawData", []))
        if not law_list:
            logger.warning("⚠️ No laws returned from e-Gov API.")
            return 0

        print(f"📡 Found {len(law_list)} entries from Japan e-Gov API.")
        count = 0
        for law in law_list[:limit]:
            title = (
                law.get("LawTitle")
                or law.get("law_title")
                or law.get("title")
                or "Unknown Japanese Regulation"
            )
            law_no = law.get("LawNo") or law.get("law_no") or ""
            law_type = law.get("LawType") or law.get("law_type") or "Regulation"

            category = "compliance"
            lower = title.lower()
            if "個人情報" in title or "privacy" in lower or "data" in lower:
                category = "data_privacy"
            elif "金融" in title or "finance" in lower or "bank" in lower:
                category = "financial"
            elif "環境" in title or "environment" in lower:
                category = "environmental"
            elif "医療" in title or "health" in lower or "medical" in lower:
                category = "healthcare"

            print(f"📥 Syncing Japan: {title[:60]}... ({category})")
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=f"{title} ({law_type} {law_no})",
                    text=f"Japanese Law: {title}\nType: {law_type}\nNumber: {law_no}",
                    source="Japan e-Gov Law API",
                    category=category,
                    jurisdiction="JP",
                )
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ Japan e-Gov Ingest Error: {e}")
        return count

async def _sync_japan_news(db: AsyncSession, limit: int = 5) -> int:
    """Captures real-time Japanese regulatory news alerts."""
    logger.info("🇯🇵 Syncing Japan: Google News Alerts")
    headers = {"User-Agent": get_random_user_agent()}
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(JAPAN_LAWS_RSS)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "xml")
        except Exception as e:
            logger.error(f"❌ Japan News Sync Failure: {e}")
            return 0

        items = soup.find_all("item")
        count = 0
        for item in items[:limit]:
            title = item.find("title").text if item.find("title") else "Unknown Japanese Regulatory Alert"
            link = item.find("link").text if item.find("link") else ""
            try:
                regulation = await ingest_regulation(
                    db=db,
                    title=title,
                    text=f"Regulatory Intelligence Alert (Japan).\nFull coverage: {link}",
                    source="Japan Regulatory News Alerts",
                    category="compliance",
                    jurisdiction="JP",
                )
                await run_impact_analysis(db, regulation)
                count += 1
            except Exception as e:
                logger.error(f"❌ Japan News Ingest Error: {e}")
        return count
