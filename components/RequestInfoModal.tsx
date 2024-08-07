"use client"

import React from 'react'
import { ProperyRequests } from './types'
import moment from 'moment';

const RequestInfoModal = ({ clicked_reqsuest, requests }: { clicked_reqsuest: number, requests: ProperyRequests[] }) => {

    const reqInfo = requests.find((value) => value.request_id == clicked_reqsuest);
    let req_info = {} as any;
    if (reqInfo) {
        if (reqInfo?.request_info && reqInfo?.request_info != "" && typeof reqInfo?.request_info == "string") {
            req_info = JSON.parse(reqInfo?.request_info);
        }
    }

    return (
        <div className='w-full'>
            <div className='w-full flex mb-2'>
                <span className='font-semibold'>Request Type:</span>
                <span className='ml-2'>{reqInfo?.request_type}</span>
            </div>

            <div className='w-full flex mb-2'>
                <span className='font-semibold'>Fullname:</span>
                <span className='ml-2'>{req_info.firstname} {req_info.lastname}</span>
            </div>

            <div className='w-full flex mb-2'>
                <span className='font-semibold'>Email:</span>
                <span className='ml-2'>{req_info.email}</span>
            </div>

            <div className='w-full flex mb-2'>
                <span className='font-semibold'>Phone Number:</span>
                <span className='ml-2'>{req_info.phone_number}</span>
            </div>

            {reqInfo?.request_type == "Contact Request" && <div className='w-full flex mb-2'>
                <span className='font-semibold'>Message:</span>
                <span className='ml-2'>{req_info.phone_number}</span>
            </div>}

            {reqInfo?.request_type == "Reservation Request" &&
                <>
                    <div className='w-full flex mb-2'>
                        <span className='font-semibold'>Reservation period:</span>
                        <span className='ml-2'>
                            {moment(req_info.move_in).format("MMM DD YYY")} - {moment(req_info.move_out).format("MMM DD YYY")}
                            ({req_info.stay_summary})
                        </span>
                    </div>

                    <div className='w-full flex mb-2'>
                        <span className='font-semibold'>Pets:</span>
                        <span className='ml-2'>{req_info.pets}</span>
                    </div>

                    <div className='w-full flex mb-2'>
                        <span className='font-semibold'>Parkings:</span>
                        <span className='ml-2'>{req_info.parkings}</span>
                    </div>

                    <div className='w-full flex mb-2'>
                        <span className='font-semibold'>Booking type:</span>
                        <span className='ml-2 capitalize'>{req_info.booking_type}</span>
                    </div>

                    {req_info.occupant_type == "no"
                        ? (<>
                            <div className='w-full flex mb-2'>
                                <span className='font-semibold'>Booking for:</span>
                                <span className='ml-2'>Guest</span>
                            </div>
                            <div className='w-full flex mb-2'>
                                <span className='font-semibold'>Guest name:</span>
                                <span className='ml-2'>{req_info.guest_firstname} {req_info.guest_lastname}</span>
                            </div>

                            <div className='w-full flex mb-2'>
                                <span className='font-semibold'>Guest phone number:</span>
                                <span className='ml-2'>{req_info.guest_phone_number}</span>
                            </div>

                            <div className='w-full flex mb-2'>
                                <span className='font-semibold'>Guest email:</span>
                                <span className='ml-2'>{req_info.guest_email}</span>
                            </div>
                        </>)
                        : <div className='w-full flex mb-2'>
                            <span className='font-semibold'>Booking for:</span>
                            <span className='ml-2'>Self</span>
                        </div>
                    }

                    <div className='w-full flex mb-2'>
                        <span className='font-semibold'>Subtotal:</span>
                        <span className='ml-2'>{req_info.sub_total_fee}</span>
                    </div>

                    <div className='w-full flex mb-2'>
                        <span className='font-semibold'>Total amount:</span>
                        <span className='ml-2'>{req_info.total_amount}</span>
                    </div>
                </>
            }
        </div>
    )
}

export default RequestInfoModal