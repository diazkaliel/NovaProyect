from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.screen_price import ScreenPriceCreate, ScreenPriceResponse
from app.services.screen_price_service import create_screen_price, get_screen_prices

router = APIRouter(prefix="/screen-prices", tags=["screen-prices"])


@router.post("/", response_model=ScreenPriceResponse, status_code=201)
async def create(
    data: ScreenPriceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crea un nuevo precio de pantalla"""
    return await create_screen_price(db, data)


@router.get("/", response_model=list[ScreenPriceResponse])
async def list_prices(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retorna la lista de todos los precios de pantallas"""
    return await get_screen_prices(db)
