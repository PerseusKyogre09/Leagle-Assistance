import io
import logging
from pypdf import PdfReader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.regulation import Regulation
from models.policy import Policy
from services.qdrant_service import embed_and_upsert, ensure_collection_exists

logger = logging.getLogger(__name__)

def parse_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text_parts.append(extracted.strip())
    return "\n\n".join(text_parts)

async def ingest_regulation(
    db: AsyncSession,
    title: str,
    text: str,
    source: str | None = None,
    category: str | None = None,
    jurisdiction: str | None = None,
    effective_date=None,
) -> Regulation:
    """
    Full ingestion pipeline for a regulation:
    1. Check if regulation already exists (idempotency)
    2. Save raw text to PostgreSQL
    3. Chunk + embed + upsert to Qdrant
    4. Update PostgreSQL record with Qdrant chunk IDs
    5. Run risk scorer
    """
    ensure_collection_exists()

    # Step 0: Idempotency Check
    existing = await db.execute(
        select(Regulation).where(Regulation.title == title, Regulation.jurisdiction == jurisdiction)
    )
    reg_existing = existing.scalar_one_or_none()
    if reg_existing:
        logger.info(f"⏭️ Skipping existing regulation: {title} ({jurisdiction})")
        return reg_existing

    # Step 1: Create PostgreSQL record (without Qdrant IDs yet)
    try:
        regulation = Regulation(
            title=title,
            raw_text=text,
            source=source,
            category=category,
            jurisdiction=jurisdiction,
            effective_date=effective_date,
        )
        db.add(regulation)
        await db.flush()   # get the UUID without committing

        # Step 2: Embed + store in Qdrant
        metadata = {
            "regulation_id": str(regulation.id),
            "title": title,
            "source": source or "",
            "category": category or "uncategorized",
            "jurisdiction": jurisdiction or "",
        }
        point_ids = embed_and_upsert(text=text, metadata=metadata, source_type="regulation")

        # Step 3: Update record with Qdrant IDs
        regulation.qdrant_ids = point_ids

        # Step 4: Score risk (import here to avoid circular imports)
        from services.risk_scorer import score_regulation
        regulation.risk_level = score_regulation(text)

        await db.commit()
        await db.refresh(regulation)
        
        logger.info(f"Ingested regulation: {title} | Risk: {regulation.risk_level} | Chunks: {len(point_ids)}")
        return regulation
    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Ingestion Failed for {title}: {e}")
        raise e

async def ingest_policy(
    db: AsyncSession,
    title: str,
    content: str,
    department: str | None = None,
    owner: str | None = None,
) -> Policy:
    """Ingest a company policy — same pipeline as regulation."""
    ensure_collection_exists()

    policy = Policy(title=title, content=content, department=department, owner=owner)
    db.add(policy)
    await db.flush()

    metadata = {
        "policy_id": str(policy.id),
        "title": title,
        "department": department or "",
    }
    point_ids = embed_and_upsert(text=content, metadata=metadata, source_type="policy")
    policy.qdrant_ids = point_ids

    await db.commit()
    await db.refresh(policy)
    return policy
