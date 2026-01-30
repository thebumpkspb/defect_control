import ipaddress
import uvicorn

# from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# from fastapi.staticfiles import StaticFiles

from app.dependencies import (
    get_app_pg_async_db,
    get_common_pg_async_db,
    get_prod_ms_db,
    get_epddev_pg_async_db,
    get_prod_my_db,
)

from app.routers import (
    productions_routers,
    search_routers,
    approval_routers,
    settings_routers,
    schemas_routers,
    users_routers,
)

from app.routers import (
    settings_target_routers,
    settings_target_org_routers,
    settings_defect_mode_routers,
    settings_subpart_routers,
    p_chart_record_routers,
    inline_outline_routers,
    export_p_chart_routers,
)

from app.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI()

origins = ["*"]

allowed_ip_ranges = [
    # ? "192.168.1.0/24",  # 192.168.1.0 to 192.168.1.255
    # ? "10.0.0.0/8",  # 10.0.0.0 to 10.255.255.255
    "172.23.36.159",
    "172.23.36.0/24",
    "45.32.106.201",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# app.include_router(users_routers(get_common_pg_async_db), prefix="/api/users", tags=["Users"])
# app.include_router(settings_routers(get_app_pg_async_db), prefix="/api/settings", tags=["Settings"])
# app.include_router(productions_routers(get_prod_my_db, get_common_pg_async_db), prefix="/api/prods", tags=["Productions"])
# app.include_router(search_routers(get_common_pg_async_db), prefix="/api/search", tags=["Searching"])

app.include_router(
    productions_routers(
        get_prod_my_db,
        get_prod_ms_db,
        get_common_pg_async_db,
    ),
    prefix="/api/prods",
    tags=["Productions"],
)
app.include_router(
    search_routers(get_common_pg_async_db), prefix="/api/search", tags=["Searching"]
)
app.include_router(
    approval_routers(get_epddev_pg_async_db), prefix="/api/approval", tags=["Approval"]
)
app.include_router(
    settings_routers(get_common_pg_async_db, get_prod_ms_db, get_epddev_pg_async_db),
    prefix="/api/settings",
    tags=["Settings"],
)
# app.include_router(schemas_routers(), prefix="/api/schemas", tags=["Schemas"])
app.include_router(
    users_routers(get_common_pg_async_db), prefix="/api/users", tags=["Users"]
)

app.include_router(
    settings_target_routers(
        get_epddev_pg_async_db, get_common_pg_async_db, get_prod_ms_db, get_prod_my_db
    ),
    prefix="/api/settings_target",
    tags=["Settings Target"],
)
app.include_router(
    settings_target_org_routers(
        get_epddev_pg_async_db, get_common_pg_async_db, get_prod_ms_db, get_prod_my_db
    ),
    prefix="/api/settings_target_org",
    tags=["Settings Target Org"],
)
app.include_router(
    settings_defect_mode_routers(
        get_epddev_pg_async_db, get_common_pg_async_db, get_prod_ms_db, get_prod_my_db
    ),
    prefix="/api/settings_defect_mode",
    tags=["Settings Defect Mode"],
)
app.include_router(
    settings_subpart_routers(
        get_epddev_pg_async_db, get_common_pg_async_db, get_prod_ms_db, get_prod_my_db
    ),
    prefix="/api/settings_sub_part",
    tags=["Settings Sub Part"],
)

app.include_router(
    p_chart_record_routers(
        get_epddev_pg_async_db, get_common_pg_async_db, get_prod_ms_db, get_prod_my_db
    ),
    prefix="/api/p_chart_record",
    tags=["P-Chart Record"],
)
app.include_router(
    inline_outline_routers(
        get_epddev_pg_async_db, get_common_pg_async_db, get_prod_ms_db, get_prod_my_db
    ),
    prefix="/api/inline_outline",
    tags=["Inline & Outline Defect Summary"],
)
app.include_router(
    export_p_chart_routers(
        get_epddev_pg_async_db, get_common_pg_async_db, get_prod_ms_db, get_prod_my_db
    ),
    prefix="/api/export_p_chart",
    tags=["Export P-Chart"],
)

# app.include_router(app_search_routers(get_app_pg_async_db), prefix="/api/search")
# app.include_router(app_routers(get_app_pg_async_db), prefix="/api/app")


@app.post("/validate-ip")
async def validate_ip(request: Request):
    x_forwarded_for = request.headers.get("x-forwarded-for")
    client_ip = (
        x_forwarded_for.split(",")[0] if x_forwarded_for else request.client.host
    )

    client_ip_address = ipaddress.ip_address(client_ip)
    for allowed_range in allowed_ip_ranges:
        try:
            network = ipaddress.ip_network(allowed_range, strict=False)
        except ValueError:
            network = ipaddress.ip_network(f"{allowed_range}/32")

        if client_ip_address in network:
            return {"status": "allowed"}
    raise HTTPException(status_code=403, detail="IP not allowed")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
