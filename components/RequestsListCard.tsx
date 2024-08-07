"use client"
import React, { useState } from 'react'
import { CheckedItems, ProperyRequests } from './types'
import moment from 'moment'
import Swal from 'sweetalert2'
import { FaCheck } from 'react-icons/fa6'
import { Helpers } from '@/_lib/helpers'
import CustomLink from './CustomLink'
import { useDispatch } from 'react-redux'
import { showPageLoader } from '@/app/(admin)/admin/GlobalRedux/admin/adminSlice'
import { FiInfo } from 'react-icons/fi'

const helpers = new Helpers();
const RequestListCard = ({ prop, key, setCanLoad, checkedItems, handleCheckboxChange, setShowModal, setClickedReqsuest }:
    {
        prop: ProperyRequests, key: any, setCanLoad: React.Dispatch<React.SetStateAction<boolean>>, checkedItems: CheckedItems,
        handleCheckboxChange: (id: number) => void, setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
        setClickedReqsuest: React.Dispatch<React.SetStateAction<number>>
    }) => {

    const dispatch = useDispatch();
    const AcknowledgeRequest = async (request_id: number) => {
        const result = await Swal.fire({
            title: "Are you sure you this request has been acknowledged?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes Continue',
        });

        if (result.isConfirmed) {

            try {
                await helpers.AcknowledgeRequest(request_id);
                dispatch(showPageLoader());
                setCanLoad(true);
            } catch (e: any) {
                console.log(e.message);
            }

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    let request_info: any = {}
    if (typeof prop.request_info == "string") {
        request_info = JSON.parse(prop.request_info);
    }

    let name_out = "";
    if (prop.request_type == "Selling Request") {
        name_out = request_info.email_address;
    } else if (prop.request_type == "Buying Request" || prop.request_type == "Info Request" || prop.request_type == "Tour Request") {
        name_out = `${request_info.first_name} ${request_info.last_name}`;
    } else if (prop.request_type == "Showing Request") {
        name_out = `${request_info.fullname}`;
    }

    return (
        <div key={key} className="bg-white grid grid-cols-[minmax(50px,50px)_repeat(4,1fr)_minmax(250px,250px)] items-center *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div className='flex items-center select-none'>
                <input type="checkbox" className='styled-checkbox z-20' checked={checkedItems[prop.request_id] || false} onChange={() => handleCheckboxChange(prop.request_id)} />
                <label className='z-10 -left-4'></label>
            </div>
            <div>
                {prop.user_id ? <CustomLink href={`/admin/user-details/${prop.user_id}`} className="text-sky-700 font-medium">
                    {prop.firstname} {prop.lastname}
                </CustomLink> : <span className='text-red-600 font-medium'>Guest</span>}

            </div>
            <div>{prop.request_type}</div>
            <div>{moment(prop.date_added).format("MMMM DD, YYYY")}</div>
            <div>{prop.status == "Pending" ? <span className='text-orange-600'>Not yet acknowledged</span> : <span className=' text-green-600'>Acknowledged</span>}</div>
            <div className='flex px-0 *:p-2 *:cursor-pointer *:rounded *:flex-grow *:flex *:justify-center *:items-center'>

                {prop.status == "Pending" ? <div className='py-1 px-2 rounded text-white bg-primary flex items-center justify-center text-sm font-medium 
                cursor-pointer hover:shadow-lg' onClick={() => AcknowledgeRequest(prop.request_id)}>
                    <FaCheck size={13} /> <span className='ml-1'>Acknowledge</span>
                </div> : <div className='py-1 px-2 text-green-700 flex items-center justify-center text-sm font-medium'>
                    <FaCheck size={13} /> <span className='ml-1'>Acknowledged</span>
                </div>}

                <div className='py-1 px-2 rounded text-white bg-primary flex items-center justify-center text-sm font-medium 
                    cursor-pointer hover:shadow-lg ml-2' onClick={() => {
                        setShowModal(true);
                        setClickedReqsuest(prop.request_id);
                    }}>
                    <FiInfo size={13} /> <span className='ml-1'>Info</span>
                </div>
            </div>
        </div>
    )
}

export default RequestListCard
