"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { APIResponseProps, AdminInfo } from '@/components/types'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { TbUserPlus } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/admin/adminSlice'
import Swal from 'sweetalert2'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'next/navigation'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import AdminListsCard from '@/components/AdminListCards'
import { RootState } from '../../../GlobalRedux/store'

const helpers = new Helpers();
const AllAdmins = () => {

    const admin = useSelector((state: RootState) => state.admin);
    let table_grids = `regular-agent-list`;
    if (!admin || admin.super_admin != "Yes") {
        table_grids = `super-agent-list`;
    }

    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const initialPage = parseInt(searchParams?.get("page") as string) || 1;

    const [agents, setAdmins] = useState<AdminInfo[]>([])
    const [admin_fetched, setAdminFetched] = useState(false);
    const [total_page, setTotalPage] = useState(0);
    const [curr_page, setCurrPage] = React.useState<number>(initialPage);
    const page_size = 20;

    const payload = {
        page: curr_page,
        limit: page_size
    }

    useEffect(() => {

        const fetchAdmins = async () => {
            const agentsPromise: Promise<AdminInfo[]> = helpers.GetAgents(payload)
            const agentsResp = await agentsPromise;

            if (agentsResp && agentsResp.length) {
                const total_records = agentsResp[0].total_records;
                if (total_records) {
                    setTotalPage(Math.ceil(total_records / page_size));
                }
            }

            setAdmins(agentsResp);
            setAdminFetched(true);
            dispatch(hidePageLoader());
        }

        dispatch(showPageLoader())
        fetchAdmins();

    }, [curr_page]);

    const handleDelete = async (admin_id: number) => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this agent?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Continue',
        });

        if (result.isConfirmed) {

            dispatch(showPageLoader());

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            await fetch(`${apiBaseUrl}/api/admin/admins/manage-admins`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "admin_id": admin_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    const item = document.getElementById(`admin_${admin_id}`);
                    item?.remove();

                    toast.success(data.message, {
                        position: "top-center",
                        theme: "colored"
                    });

                } else {
                    toast.error(data.message, {
                        position: "top-center",
                        theme: "colored"
                    })
                }

            });

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    const add_new_comp = <Link href="/admin/add-new-agent" className='bg-primary text-white flex items-center justify-center ml-2 
    py-1 h-10 px-4 text-sm font-medium hover:drop-shadow-xl rounded-md'>
        <TbUserPlus className='mr-1 !text-xl' /> <span>Add New Agent</span>
    </Link>

    return (
        <div className='w-full'>
            <div className='container mx-auto w-full max-w-[1350px]'>
                <PageTitle text="Agents" show_back={false} right_component={add_new_comp} />
                <div className='h-[auto] relative box-border pb-10 mt-3'>

                    <div className="w-full max-w-[100%] overflow-hidden overflow-x-auto border border-gray-200 rounded-md shadow-xl">
                        <div className='w-full min-w-[1000px]'>
                            {/* Header */}
                            <div className={`bg-gray-100 grid ${table_grids} *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium`}>
                                <div className="cell-header">Name</div>
                                <div className="cell-header">Email</div>
                                <div className="cell-header">Phone</div>
                                <div className="cell-header">Status</div>
                                {(admin && admin.super_admin == "Yes") && (
                                    <div className="cell-header">Actions</div>
                                )}
                            </div>

                            <div className='w-full divide-y divide-gray-200'>
                                {/* Loader */}
                                {!admin_fetched && <div className=' col-span-full h-[250px] bg-white flex items-center justify-center'>
                                    <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                                </div>}
                                {/* Rows */}
                                {
                                    admin_fetched && (
                                        (agents.length && agents.length > 0)
                                            ? (agents.map((admin) => {
                                                return (<AdminListsCard key={admin.admin_id} prop={admin} handleDelete={handleDelete} />)
                                            }))
                                            : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                                No agents found.
                                            </div>)
                                }

                            </div>
                        </div>
                    </div>

                </div>

                <Pagination totalPage={total_page} curr_page={curr_page} url_path='/admin/all-agents?' />
                <ToastContainer />
            </div>
        </div>
    )

}

export default AllAdmins