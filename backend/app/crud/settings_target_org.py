from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text


class Settings_Target_Org_CRUD:
    def __init__(self):
        pass
         
    async def table_view(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        
        target_level = data['target_level']
        
        ## query db
        where_stmt = " active = 'active' "
        if target_level != '':
            where_stmt = where_stmt + " AND target_level = '"+target_level+"' "
            
        stmt = f"SELECT * FROM master_target_org WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        
        return rs
        
    async def table_edit_view(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        
        target_level = data['target_level']
        target_name = data['target_name']
        target_type = data['target_type']
        month_year = data['month_year']
        target_control = data['target_control']
        
        ## query db
        where_stmt = "target_level = '"+target_level+"' AND target_name = '"+target_name+"' AND target_type = '"+target_type+"' AND month_year = '"+month_year+"' AND active = 'active' "
        
        stmt = f"SELECT * FROM master_target_org WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        
        return rs
        
    async def table_edit_view_target_level_change(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        
        return data
        
    async def table_edit_save(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        
        target_level = data['target_level']
        target_name = data['target_name']
        target_type = data['target_type']
        month_year = data['month_year']
        target_control = data['target_control']
        creator = data['creator']
        id = data['id']
        
        status = True
        
        ## query db
        stmt = "UPDATE master_target_org SET active = 'edit', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  id = "+str(id)
        await db.execute(text(stmt))
        await db.commit()
        
        ## check new record ??
        ## query db         
        where_stmt = "target_level = '"+target_level+"' AND target_name = '"+target_name+"' AND target_type = '"+target_type+"' AND month_year = '"+month_year+"' AND active in ('delete','edit','active') "
            
        stmt = f"SELECT id FROM master_target_org WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            ## case old record
            ## query db
            stmt = f"""UPDATE master_target_org SET target_control = {target_control}, active = 'active', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            await db.execute(text(stmt))
            await db.commit()
        
            status = False
        
        if status == True:
            ## case new record
            ## query db
            stmt = f"""INSERT INTO master_target_org ( target_level, target_name, target_type, month_year, target_control, creator, created_at, updated_at, active) VALUES ( '{target_level}','{target_name}','{target_type}','{month_year}',{target_control},'{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7',current_timestamp AT TIME ZONE 'Etc/GMT-7','active' )"""
            await db.execute(text(stmt))
            await db.commit()
        
        return data
        
    async def table_delete(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        
        target_level = data['target_level']
        target_name = data['target_name']
        target_type = data['target_type']
        month_year = data['month_year']
        target_control = data['target_control']
        
        ## query db
        where_stmt = "target_level = '"+target_level+"' AND target_name = '"+target_name+"' AND target_type = '"+target_type+"' AND month_year = '"+month_year+"' AND target_control = "+str(target_control)+" AND active = 'active' "
        
        stmt = f"""UPDATE master_target_org SET active = 'delete', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
        await db.execute(text(stmt))
        await db.commit()
        
        return data
        
    async def add_row_view(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        
        return data
        
    async def add_row_view_target_level_change(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        
        return data
        
    async def add_row_ok(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        
        target_level = data['target_level']
        target_name = data['target_name']
        target_type = data['target_type']
        month_year = data['month_year']
        target_percent = data['target_percent']
        creator = data['creator']
        
        status = True
        
        ## check new record ??
        ## query db     
        where_stmt = "target_level = '"+target_level+"' AND target_name = '"+target_name+"' AND target_type = '"+target_type+"' AND month_year = '"+month_year+"' AND active in ('delete','edit','active') "
            
        stmt = f"SELECT id FROM master_target_org WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            ## case old record
            ## query db
            stmt = f"""UPDATE master_target_org SET target_control = {target_percent}, active = 'active', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            await db.execute(text(stmt))
            await db.commit()
        
            status = False
        
        if status == True:
            ## case new record
            ## query db
            stmt = f"""INSERT INTO master_target_org ( target_level, target_name, target_type, month_year, target_control, creator, created_at, updated_at, active) VALUES ( '{target_level}','{target_name}','{target_type}','{month_year}',{target_percent},'{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7',current_timestamp AT TIME ZONE 'Etc/GMT-7','active' )"""
            await db.execute(text(stmt))
            await db.commit()
        
        
        return data      
        
        
