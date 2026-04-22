import logging
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from services.uk_legis_service import sync_uk_feed
from services.us_legis_service import sync_us_regulations
from services.eu_legis_service import sync_eu_regulations
from services.india_legis_service import sync_india_regulations
from services.australia_legis_service import sync_australia_regulations

logger = logging.getLogger(__name__)

async def sync_all_jurisdictions(db: AsyncSession, limit_per_source: int = 100):
    """
    Coordinates synchronization across all supported legal jurisdictions.
    """
    logger.info("🚀 Starting Global Regulatory Sync")
    
    results = {
        "uk": 0,
        "us": 0,
        "eu": 0,
        "india": 0,
        "australia": 0,
        "total": 0
    }
    
    # Run syncs in sequence to avoid overwhelming the database/Qdrant
    # (parallel could be done with asyncio.gather if needed)
    
    try:
        results["uk"] = await sync_uk_feed(db, limit=limit_per_source)
        logger.info(f"✅ UK Sync Complete: {results['uk']} items")
    except Exception as e:
        logger.error(f"❌ UK Sync Failed: {e}")

    try:
        results["us"] = await sync_us_regulations(db, limit=limit_per_source)
        logger.info(f"✅ US Sync Complete: {results['us']} items")
    except Exception as e:
        logger.error(f"❌ US Sync Failed: {e}")

    try:
        results["eu"] = await sync_eu_regulations(db, limit=limit_per_source)
        logger.info(f"✅ EU Sync Complete: {results['eu']} items")
    except Exception as e:
        logger.error(f"❌ EU Sync Failed: {e}")

    try:
        results["india"] = await sync_india_regulations(db, limit=limit_per_source)
        logger.info(f"✅ India Sync Complete: {results['india']} items")
    except Exception as e:
        logger.error(f"❌ India Sync Failed: {e}")

    try:
        results["australia"] = await sync_australia_regulations(db, limit=limit_per_source)
        logger.info(f"✅ Australia Sync Complete: {results['australia']} items")
    except Exception as e:
        logger.error(f"❌ Australia Sync Failed: {e}")

    results["total"] = sum([v for k, v in results.items() if k != "total"])
    logger.info(f"🏁 Global Sync Finished. Total items ingested: {results['total']}")
    
    return results
