import React from 'react'
import { AdminInfo } from './types'
import { BiEdit } from 'react-icons/bi'
import CustomLink from './CustomLink'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/(admin)/admin/GlobalRedux/store'
import { FaRegTrashAlt } from 'react-icons/fa'

const AdminListsCard = ({ prop, handleDelete }: { prop: AdminInfo, handleDelete: (agent_id: number) => Promise<void> }) => {

    const admin = useSelector((state: RootState) => state.admin);
    // let table_grids = `repeat(3,1fr)_minmax(170px,170px)_minmax(150px,150px)`;
    // if (!admin || admin.super_admin != "Yes") {
    //     table_grids = `repeat(3,1fr)_minmax(170px,170px)`;
    // }

    let table_grids = `regular-agent-list`;
    if (!admin || admin.super_admin != "Yes") {
        table_grids = `super-agent-list`;
    }

    return (
        <div id={`admin_${prop.admin_id}`} className={`bg-white grid ${table_grids} items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal`}>
            <div>
                <CustomLink href={`/admin/edit-admin?admin_id=${prop.admin_id}`}>{prop.firstname} {prop.lastname}</CustomLink>
            </div>
            <div>{prop.email}</div>
            <div>{prop.phone}</div>
            <div>{prop.status}</div>
            {(admin && admin.super_admin == "Yes") && (
                <div className='flex *:bg-slate-900 *:text-white px-0 *:p-2 *:cursor-pointer *:border *:border-slate-900 *:flex-grow 
                    *:flex *:justify-center *:items-center *:rounded-md space-x-2'>
                    <CustomLink href={`/admin/edit-admin?admin_id=${prop.admin_id}`}>
                        <div className='hover:shadow-lg'><BiEdit size={18} /></div>
                    </CustomLink>

                    {(prop.super_admin != "Yes") && (<div className='!bg-red-600 text-white !border-red-600' onClick={() => handleDelete(prop.admin_id)}>
                        <FaRegTrashAlt size={14} />
                    </div>)
                    }
                </div>
            )}

        </div>
    )
}

export default AdminListsCard
