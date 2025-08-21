from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

from app.functions import api_key_auth
from app.manager import Inline_Outline_Manager
from app.schemas.inline_outline import (
    Department_Section,
    Department_Section_Result,
    Department_Section_Result_Response,
    Defect_Summary,
    Defect_Summary_cause,
    Defect_Summary_Result,
    Defect_Summary_Result_Response,
    Default_Defect_Summary_Result_Response,
    Cause_Of_Abnormal_Result_Response,
    Defect_Pareto_Chart_Result_Response,
    Export_Abnormal,
    Export_Description,
    Export_Description_Result,
    Export_Description_Result_Response,
)

def inline_outline_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    inline_outline_manager = Inline_Outline_Manager()

    @router.get("/default_defect_summary",response_model=Default_Defect_Summary_Result_Response,dependencies=[Depends(api_key_auth)],)
    async def default_defect_summary():
        
        return Default_Defect_Summary_Result_Response(default_defect_summary_result = await inline_outline_manager.get_default_defect_summary())
        
    @router.post("/department_section_change",response_model=Department_Section_Result_Response,dependencies=[Depends(api_key_auth)],)
    async def department_section_change(text_data: Department_Section, db: AsyncSession = Depends(db)):
        '''
        Example
        \nexp1: { "department": "Manufacturing", "section": "-" }
        \nexp2: { "department": "Manufacturing", "section": "414454 - Sta. Assy PA70" }
        '''
        return Department_Section_Result_Response(department_section_result = await inline_outline_manager.post_department_change(text_data=text_data, db=db))
                
    @router.post("/defect_summary",response_model=Defect_Summary_Result_Response,dependencies=[Depends(api_key_auth)],)
    async def defect_summary(text_data: Defect_Summary, db: AsyncSession = Depends(db)):
        '''
        Example
        \nexp1: { "month": "November-2024", "department": "Manufacturing", "section": "414454 - Sta. Assy PA70", "line": ["414454 - Starter Assy PA70"] }
        \nexp2: { "month": "November-2024", "department": "Manufacturing", "section": "414454 - Sta. Assy PA70", "line": ["414454 - Mag. Sw. PA", "414454 - Starter Assy PA70"] }
        '''
        return Defect_Summary_Result_Response(defect_summary_result = await inline_outline_manager.post_defect_summary(text_data=text_data, db=db)) 
        
    @router.post("/cause_of_abnormal",response_model=Cause_Of_Abnormal_Result_Response,dependencies=[Depends(api_key_auth)],)
    async def cause_of_abnormal(text_data: Defect_Summary_cause, db: AsyncSession = Depends(db)):
        '''
        Example
        \nexp1: { "month": "November-2024", "department": "Manufacturing", "section": "414454 - Sta. Assy PA70", "line": ["414454 - Starter Assy PA70"], "shift": "All" }
        \nexp2: { "month": "November-2024", "department": "Manufacturing", "section": "414454 - Sta. Assy PA70", "line": ["414454 - Mag. Sw. PA", "414454 - Starter Assy PA70"], "shift": "All" }
        '''
        return Cause_Of_Abnormal_Result_Response(cause_of_abnormal_result = await inline_outline_manager.post_cause_of_abnormal(text_data=text_data, db=db)) 
        
    @router.post("/defect_pareto_chart",response_model=Defect_Pareto_Chart_Result_Response,dependencies=[Depends(api_key_auth)],)
    async def defect_pareto_chart(text_data: Defect_Summary, db: AsyncSession = Depends(db)):
        '''
        Example
        \nexp1: { "month": "November-2024", "department": "Manufacturing", "section": "414454 - Sta. Assy PA70", "line": ["414454 - Starter Assy PA70"] }
        \nexp2: { "month": "November-2024", "department": "Manufacturing", "section": "414454 - Sta. Assy PA70", "line": ["414454 - Mag. Sw. PA", "414454 - Starter Assy PA70"] }
        '''
        return Defect_Pareto_Chart_Result_Response(defect_pareto_chart_result = await inline_outline_manager.post_defect_pareto_chart(text_data=text_data, db=db))
        
    @router.post("/export_abnormal_occurrence",dependencies=[Depends(api_key_auth)],)
    async def export_abnormal_occurrence(text_data: Export_Abnormal, db: AsyncSession = Depends(db)):
        '''
        Example
        \nexp1: { "month": "November-2024", "line": ["414454 - Starter Assy PA70"], "shift": "All" }
        \nexp2: { "month": "November-2024", "line": ["414454 - Mag. Sw. PA", "414454 - Starter Assy PA70"], "shift": "All" }
        '''
        return await inline_outline_manager.post_export_abnormal_occurrence(text_data=text_data, db=db)
        
    @router.post("/export_description",dependencies=[Depends(api_key_auth)],)
    async def export_description(text_data: Export_Description, db: AsyncSession = Depends(db)):
        '''
        Example
        \nexp1: { "month": "November-2024", "line": ["414454 - Starter Assy PA70"] }
        \nexp2: { "month": "November-2024", "line": ["414454 - Mag. Sw. PA", "414454 - Starter Assy PA70"] }
        '''
        return await inline_outline_manager.post_export_description(text_data=text_data, db=db)
        
    return router
    
    
    
    
