"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/admin/adminSlice';
import PageTitle from '../../../_components/PageTitle';
import { toast, ToastContainer } from 'react-toastify';
import Pagination from '@/components/pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import { APIResponseProps, CheckedItems, Reservation, User } from '@/components/types';
import { Helpers } from '@/_lib/helpers';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import UserListCard from '@/components/UserLists';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { DateTypes, LeadStages } from '@/_lib/data';
import Swal from 'sweetalert2';
import moment from 'moment';
import { FaArrowRightLong } from 'react-icons/fa6';
import AdminReservationRangePicker from '@/components/AdminReservationRangePicker';
import ReservationListCard from '@/components/ReservationListCard';

const helpers = new Helpers();
const Reservations = () => {

    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const params_keyword = searchParams?.get("keyword") as string || "";
    const params_date_type = searchParams?.get("date_type") as string || "None";
    const params_from_date = searchParams?.get("from_date") as string || "";
    const params_to_date = searchParams?.get("to_date") as string || "";
    const initialPage = parseInt(searchParams?.get("page") as string) || 1;

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [resrv_fetched, setReservFetched] = useState(false);
    const [total_page, setTotalPage] = useState(0);
    const [keyword, setKeyword] = useState(params_keyword);
    const [curr_page, setCurrPage] = React.useState<number>(initialPage);
    const [date_type, setDateType] = React.useState<string>(params_date_type);
    const [from_date, setFromDate] = React.useState<string>(params_from_date);
    const [to_date, setToDate] = React.useState<string>(params_to_date);
    const page_size = 20;

    const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
    const [isCheckAll, setIsCheckAll] = useState<boolean>(false);
    const datepickerBoxRef = useRef<HTMLDivElement>(null);
    const [datepicker_shown, setDatepickerShown] = useState(false);

    const init_payload = {
        date_type: date_type,
        from_date: from_date,
        to_date: to_date,
        keyword: keyword,
    }

    const [payload, setPayload] = useState<{ [key: string]: any }>(init_payload);

    useEffect(() => {

        const fetchUsers = async () => {

            const pay_load = {
                paginated: true,
                ...payload,
                page: initialPage,
                limit: page_size
            }

            try {

                const revsPromise: Promise<APIResponseProps> = helpers.LoadReservations(pay_load);
                const revResp = await revsPromise;

                if (revResp.success && revResp.data.length) {

                    const total_records = revResp.data[0].total_records;
                    if (total_records) {
                        setTotalPage(Math.ceil(total_records / page_size));
                    }

                }

                setReservations(revResp.data);
                setReservFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message);
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchUsers();

    }, [initialPage, payload]); //keyword //lead_stage

    const DoSearch = () => {

        const pf = { ...payload }
        router.push(`reservations?keyword=${keyword}&date_type=${pf.date_type}&from_date=${moment(pf.from_date).format("YYYY-MM-DD")}&to_date=${moment(pf.to_date).format("YYYY-MM-DD")}&version=${moment().unix() * 1000}&page=1`, { scroll: false });

    }

    const TriggerStage = (type: string) => {
        setDateType(() => type);
    }

    // Handle individual checkbox change
    const handleCheckboxChange = (id: number) => {
        setCheckedItems((prev) => {
            const newCheckedItems = { ...prev, [id]: !prev[id] };
            setIsCheckAll(Object.keys(newCheckedItems).length === reservations.length && Object.values(newCheckedItems).every(Boolean));
            return newCheckedItems;
        });
    };

    const handleDelete = async (reservation_id: number) => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this reservation?",
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
            await fetch(`${apiBaseUrl}/api/admin/reservations/manage-reservations`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "reservation_id": reservation_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    const item = document.getElementById(`reservation_${reservation_id}`);
                    item?.remove();

                    toast.success("Reservation succesfully deleted", {
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

    useEffect(() => {

        const handleClickOutside = (e: MouseEvent) => {
            if (datepickerBoxRef.current && !datepickerBoxRef.current.contains(e.target as Node)) {
                setDatepickerShown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [datepickerBoxRef]);

    /** Build Payload **/
    useEffect(() => {

        let updatedPayload = { ...payload }; // Create a copy of the payload object
        if (searchParams?.size && searchParams?.size > 0) {
            searchParams?.forEach((val, key) => {
                updatedPayload[key] = val;
            })
        } else {
            updatedPayload = { ...init_payload }
        }

        setPayload(updatedPayload);
        dispatch(hidePageLoader());

    }, [searchParams, searchParams?.size]);
    /** Build Payload **/

    return (
        <div className='w-full flex flex-col'>
            <PageTitle text="Reservations" show_back={false} />
            <div className='!w-full !max-w-[100%] h-[auto] relative box-border pb-10'>
                <div className='w-full mt-8 flex justify-between'>
                    <div className="relative w-full max-w-[450px]">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="search" id="default-search" name='keyword' value={keyword} onChange={(e) => setKeyword(e.target.value)}
                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-500 focus:border-sky-700 rounded-md 
                        bg-gray-50 outline:border-0 focus:outline-none focus:shadow-lg" placeholder="Search by MLS number, name, email or phone number..." />
                        <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 
                        focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-4 py-2 dark:bg-blue-600 
                        dark:hover:bg-blue-700 dark:focus:ring-blue-800 hover:shadow-lg" onClick={() => DoSearch()}>Search</button>
                    </div>

                    <div className='ml-auto flex items-center'>
                        <div className='flex items-center group px-3 bg-white border border-zinc-900 cursor-pointer h-[45px] rounded 
                            min-w-[100px] hover:shadow-xl *:font-semibold relative mr-2'>
                            <div className='flex justify-between w-full items-center'>
                                <span>Filter By: {date_type}</span>
                                <span className='group-hover:rotate-180 transition-all duration-300'>
                                    <MdOutlineKeyboardArrowDown size={20} />
                                </span>
                            </div>

                            <div className='w-[240px] hidden group-hover:block absolute top-[105%] right-0 shadow-2xl rounded-md bg-white z-10'>
                                <div className='w-full flex flex-col max-h-[400px] overflow-y-auto font-medium'>
                                    <div className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer hover:bg-gray-50 
                                    ${date_type == "" && "bg-gray-50"}`} onClick={() => TriggerStage("None")}>None</div>
                                    {
                                        DateTypes.map((type, index) => {
                                            return (
                                                <div key={index} className={`w-full py-4 px-4 border-b border-ray-200 cursor-pointer 
                                                hover:bg-gray-50 ${date_type == type && "bg-gray-50"}`} onClick={() => TriggerStage(type)}>{type}</div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>

                        {date_type != "None" &&
                            <div className='flex items-center px-3 bg-white border border-zinc-900 cursor-pointer h-[45px] rounded 
                            min-w-[100px] hover:shadow-xl *:font-semibold relative mr-2'>
                                <div className=' px-5 py-4 flex items-center'
                                    onClick={() => setDatepickerShown(true)}>
                                    <div className=' flex-grow flex flex-col'>
                                        <span className=' text-base flex items-center justify-between'>
                                            <span>{moment().format("DD MMM YYYY")}</span>
                                            <span><FaArrowRightLong size={16} /></span>
                                            <span>{moment().format("DD MMM YYYY")}</span>
                                        </span>
                                    </div>
                                    <div className={`ml-1 ${datepicker_shown ? "rotate-180" : null}`}>
                                        <MdOutlineKeyboardArrowDown size={22} />
                                    </div>
                                </div>

                                <div className={`absolute top-0 right-0 rounded duration-300 ransition-all z-30 ${datepicker_shown
                                    ? "p-0 min-w-full w-[45vw] h-[450px] border border-gray-500 shadow-2xl overflow-x-hidden overflow-y-auto"
                                    : "w-0 min-w-0 !h-0 overflow-hidden"}`} ref={datepickerBoxRef}>
                                    <AdminReservationRangePicker payload={payload} datepicker_shown={datepicker_shown} date_type={date_type}
                                        setDatepickerShown={setDatepickerShown} />
                                </div>
                            </div>
                        }

                    </div>
                </div>

                <div className="w-full mt-3 border border-gray-200 rounded-md overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className=" bg-gray-100 grid grid-cols-[repeat(4,1fr)_minmax(150px,150px)] *:text-wrap *:break-all *:px-4 *:py-3 *:font-medium">
                        <div className="cell-header">Property MLS #</div>
                        <div className="cell-header">Tenant</div>
                        <div className="cell-header">Email</div>
                        <div className="cell-header">Staying Periord</div>
                        <div className="cell-header">Actions</div>
                    </div>

                    <div className='w-full divide-y divide-gray-200'>
                        {/* Loader */}
                        {!resrv_fetched && <div className=' col-span-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}
                        {/* Rows */}
                        {
                            resrv_fetched && (
                                (reservations.length && reservations.length > 0)
                                    ? (reservations.map((reserv) => {
                                        return (<ReservationListCard key={reserv.reservation_id} rev={reserv} handleDelete={handleDelete} />)
                                    }))
                                    : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                        No reservation added yet.
                                    </div>)
                        }
                    </div>
                </div>

                <div className='w-full h-[90px]'>
                    {total_page > 0 ? <Pagination totalPage={total_page} curr_page={initialPage} url_path={`/admin/reservations?keyword=${keyword}&date_type=${date_type}&from_date=${from_date}&to_date=${to_date}&`} /> : null}
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default Reservations