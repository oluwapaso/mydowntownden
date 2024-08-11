"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/admin/adminSlice';
import PageTitle from '../../../_components/PageTitle';
import { toast, ToastContainer } from 'react-toastify';
import Pagination from '@/components/pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import { APIResponseProps, CheckedItems, User } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import UserListCard from '@/components/UserLists';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { LeadStages } from '@/_lib/data';
import Swal from 'sweetalert2';

const helpers = new Helpers();
const AllUsers = () => {

    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const params_keyword = searchParams?.get("keyword") as string || "";
    const params_lead_stage = searchParams?.get("stage") as string || "Any";
    const initialPage = parseInt(searchParams?.get("page") as string) || 1;

    const [users, setUsers] = useState<User[]>([]);
    const [users_fetched, setUsersFetched] = useState(false);
    const [total_page, setTotalPage] = useState(0);
    const [keyword, setKeyword] = useState(params_keyword);
    const [curr_page, setCurrPage] = React.useState<number>(initialPage);
    const [lead_stage, setStage] = React.useState<string>(params_lead_stage);
    const page_size = 20;

    const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
    const [isCheckAll, setIsCheckAll] = useState<boolean>(false);

    useEffect(() => {
        setStage(params_lead_stage);
    }, [params_lead_stage]);

    useEffect(() => {

        const fetchUsers = async () => {

            const payload = {
                paginated: true,
                search_type: "User Lists",
                keyword: keyword,
                lead_stage: lead_stage,
                page: initialPage,
                limit: page_size
            }

            try {

                const usersPromise: Promise<User[]> = helpers.LoadUsers(payload);
                const usersResp = await usersPromise;

                if (usersResp && usersResp.length) {
                    const total_records = usersResp[0].total_records;
                    if (total_records) {
                        setTotalPage(Math.ceil(total_records / page_size));
                    }
                }

                setUsers(usersResp);
                setUsersFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message);
                dispatch(hidePageLoader());
            }

        }

        // const fetch_comp = async () => {
        //     const compPromise = helpers.FetchCompanyInfo();
        //     const comp_info = await compPromise;

        //     if (comp_info.success && comp_info.data.lead_stages && comp_info.data.lead_stages.length) {
        //         let lead_stage = comp_info.data.lead_stages;
        //         setAllLeadStage(lead_stage);
        //     }
        // }

        // if (!users_fetched) {
        //     fetch_comp();
        // }

        dispatch(showPageLoader());
        fetchUsers();

    }, [initialPage, users_fetched, lead_stage]); //keyword //lead_stage

    const DoSearch = (stage?: string) => {
        let leadStg = lead_stage;
        if (stage && stage != "") {
            leadStg = stage;
        }

        let link = `/admin/all-users?stage=${leadStg}`;
        if (keyword && keyword != "") {
            link += `&keyword=${keyword}&page=1`;
        } else {
            link += `&page=1`;
        }

        setUsersFetched(false);
        setCurrPage(1); // Update the curr_page state to trigger useEffect
        window.history.pushState({}, '', link); // Use pushState to change URL without reloading
    }

    const TriggerStage = (stage: string) => {
        handleCheckAllChange("Yes");
        //setUsersFetched(false);
        setStage(() => stage);
        DoSearch(stage);
    }

    //Handle "Check All" checkbox change
    const handleCheckAllChange = (uncheck_all?: string) => {

        let newCheckAll: boolean | null = null;
        if (uncheck_all && uncheck_all == "Yes") {
            newCheckAll = false;
        } else {
            newCheckAll = !isCheckAll;
        }

        setIsCheckAll(newCheckAll);
        const newCheckedItems: CheckedItems = users.reduce((acc, request) => {
            acc[request.user_id] = newCheckAll;
            return acc;
        }, {} as CheckedItems);
        setCheckedItems(newCheckedItems);
    };

    // Handle individual checkbox change
    const handleCheckboxChange = (id: number) => {
        setCheckedItems((prev) => {
            const newCheckedItems = { ...prev, [id]: !prev[id] };
            setIsCheckAll(Object.keys(newCheckedItems).length === users.length && Object.values(newCheckedItems).every(Boolean));
            return newCheckedItems;
        });
    };

    const handleDelete = async (user_id: number) => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this user?",
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
            await fetch(`${apiBaseUrl}/api/users/delete-account`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "user_id": user_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    const item = document.getElementById(`user_id_${user_id}`);
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

    return (
        <div className='w-full flex flex-col'>
            <PageTitle text="Users" show_back={false} />
            <div className='!w-full !max-w-[100%] h-[auto] relative box-border pb-10'>
                <div className='w-full mt-8 flex flex-col md:flex-row justify-between'>
                    <div className="relative w-full md:max-w-[350px] tab:max-w-[450px] mr-0 xs:mr-3">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="search" id="default-search" name='keyword' value={keyword} onChange={(e) => setKeyword(e.target.value)}
                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-500 focus:border-sky-700 rounded-md 
                        bg-gray-50 outline:border-0 focus:outline-none focus:shadow-lg" placeholder="Search by name, email or phone number..." />
                        <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 
                        focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-4 py-2 dark:bg-blue-600 
                        dark:hover:bg-blue-700 dark:focus:ring-blue-800 hover:shadow-lg" onClick={() => DoSearch(lead_stage)}>Search</button>
                    </div>

                    <div className='mr-auto md:ml-auto flex items-center self-start md:self-end mt-3 md:mt-0'>
                        <div className='flex items-center group px-3 bg-white border border-zinc-900 cursor-pointer h-[45px] rounded 
                            min-w-[100px] hover:shadow-xl *:font-semibold relative'>
                            <div className='flex justify-between w-full items-center'>
                                <span>Lead Stage: {lead_stage}</span>
                                <span className='group-hover:rotate-180 transition-all duration-300'>
                                    <MdOutlineKeyboardArrowDown size={20} />
                                </span>
                            </div>

                            <div className='w-[240px] hidden group-hover:block absolute top-[105%] left-0 md:right-0 shadow-2xl rounded-md bg-white z-10'>
                                <div className='w-full flex flex-col max-h-[400px] overflow-y-auto font-medium'>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${lead_stage == "Any" && "bg-gray-50"}`} onClick={() => TriggerStage("Any")}>Any</div>
                                    {
                                        LeadStages.map((stage, index) => {
                                            return (
                                                <div key={index} className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer 
                                                hover:bg-gray-50 ${lead_stage == stage && "bg-gray-50"}`} onClick={() => TriggerStage(stage)}>{stage}</div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[100%] overflow-hidden overflow-x-auto mt-3 border border-gray-200 rounded-md shadow-xl">
                    <div className='w-full min-w-[1000px]'>
                        {/* Header */}
                        <div className=" bg-gray-100 grid grid-cols-[repeat(4,1fr)_minmax(100px,100px)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                            <div className="cell-header">Fullname</div>
                            <div className="cell-header">Email</div>
                            <div className="cell-header">Phone</div>
                            <div className="cell-header">Last Seen</div>
                            <div className="cell-header">Actions</div>
                        </div>

                        <div className='w-full divide-y divide-gray-200'>
                            {/* Loader */}
                            {!users_fetched && <div className=' col-span-full h-[250px] bg-white flex items-center justify-center'>
                                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                            </div>}
                            {/* Rows */}
                            {
                                users_fetched && (
                                    (users.length && users.length > 0)
                                        ? (users.map((user) => {
                                            return (<UserListCard key={user.user_id} prop={user} checkedItems={checkedItems}
                                                handleCheckboxChange={handleCheckboxChange} handleDelete={handleDelete} />)
                                        }))
                                        : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                            No users added yet.
                                        </div>)
                            }
                        </div>
                    </div>
                </div>

                <div className='w-full h-[90px]'>
                    {total_page > 0 ? <Pagination totalPage={total_page} curr_page={initialPage} url_path={`/admin/all-users?stage=${lead_stage}&keyword=${keyword}&`} /> : null}
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default AllUsers