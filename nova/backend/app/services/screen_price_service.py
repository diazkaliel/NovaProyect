from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.screen_price import ScreenPrice
from app.schemas.screen_price import ScreenPriceCreate


async def create_screen_price(db: AsyncSession, data: ScreenPriceCreate) -> ScreenPrice:
    """Crea un nuevo registro de precio de pantalla en la base de datos"""
    screen_price = ScreenPrice(**data.model_dump())
    db.add(screen_price)
    await db.commit()
    await db.refresh(screen_price)
    return screen_price


async def get_screen_prices(db: AsyncSession) -> list[ScreenPrice]:
    """Retorna la lista completa de precios de pantallas ordenados por marca y modelo"""
    query = select(ScreenPrice).order_by(ScreenPrice.brand, ScreenPrice.model)
    result = await db.execute(query)
    return list(result.scalars().all())
