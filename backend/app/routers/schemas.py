import inspect
import sys
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.functions import api_key_auth, get_schema_dict


def schemas_routers() -> APIRouter:
    router = APIRouter()

    @router.get("/users_schemas", dependencies=[Depends(api_key_auth)])
    def get_users_schemas():
        schemas = {}
        for name, obj in inspect.getmembers(sys.modules["app.schemas.users"]):
            if inspect.isclass(obj) and issubclass(obj, BaseModel) and obj != BaseModel:
                schemas[name] = get_schema_dict(obj)
        return {"schemas": schemas}

    @router.get("/setting_schemas", dependencies=[Depends(api_key_auth)])
    def get_settings_schemas():
        schemas = {}
        for name, obj in inspect.getmembers(sys.modules["app.schemas.settings"]):
            if inspect.isclass(obj) and issubclass(obj, BaseModel) and obj != BaseModel:
                schemas[name] = get_schema_dict(obj)
        return {"schemas": schemas}

    return router
