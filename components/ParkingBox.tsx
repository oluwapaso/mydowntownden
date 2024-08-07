"use client"

import { Helpers } from '@/_lib/helpers'
import React, { useState } from 'react'
import Modal from './Modal'
import { FiMinusCircle, FiPlusCircle } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

const helpers = new Helpers()
const ParkingBox = ({ payload, prop }: { payload: { [key: string]: any }, prop: any }) => {

    const [showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(true);
        document.body.style.overflowY = 'hidden';
    }

    const closeModal = () => {
        setShowModal(false);
        document.body.style.overflowY = 'auto';
    }

    return (
        <>
            <div className={` border border-gray-300 drop-shadow-xl cursor-pointer px-4 py-6 flex flex-col justify-between 
            items-center rounded-md min-w-[180px] ${payload.parkings > 0 ? "bg-sky-100" : "bg-white"}`} onClick={openModal}>
                <div className=' flex flex-col items-center justify-center'>
                    <img src='/map-icon-parking.svg' width={10} height={10} className=' w-7 h-7' /><div className='w-full flex'></div>
                    <div className='mt-1 font-semibold'>Parking</div>
                </div>
                {(prop.parking_fee_required == "Yes" && prop.parking_fee > 0) &&
                    <div className='mb-3'>{helpers.formatCurrency(prop.parking_fee)}/mo</div>}

                {prop.parking_fee_required == "Yes" &&
                    <div className=' text-sky-700'>
                        {prop.parking_fee_required ? (payload.parkings > 0 ? "Edit" : "Add") : "View detail"}
                    </div>
                }
            </div>


            <Modal show={showModal} children={<ModalInner payload={payload} prop={prop} closeModal={closeModal} />} width={500} closeModal={closeModal} title={<>Parking</>} />
        </>
    )
}

const ModalInner = ({ payload, prop, closeModal }: { payload: { [key: string]: any }, prop: any, closeModal: () => void }) => {

    const router = useRouter();
    const [num_of_parkings, setNumOfParkings] = useState(parseInt(payload.parkings));

    const increaseParking = () => {
        if (num_of_parkings < prop.max_num_of_vehicle) {
            setNumOfParkings((prev_parking: number) => prev_parking + 1)
        }
    }

    const decreaseParking = () => {
        if (num_of_parkings > 0) {
            setNumOfParkings((prev_parking: number) => prev_parking - 1)
        }
    }

    const addParking = () => {
        const pf = { ...payload }
        closeModal()
        router.push(`/listings/${pf.property_id}/${pf.address}?move_in=${pf.move_in}&move_out=${pf.move_out}&pets=${pf.pets}&parkings=${num_of_parkings}`, { scroll: false });
    }


    return (
        <div className='w-full flex flex-col'>
            <div className=' flex flex-col items-center justify-center'>
                <img src='/map-icon-parking.svg' width={10} height={10} className=' w-10 h-10' /><div className='w-full flex'></div>

                {(prop.parking_fee_required == "Yes" && prop.parking_fee > 0) && (
                    <>
                        <div className='mt-3 font-medium text-2xl text-gray-800'>{helpers.formatCurrency(prop.parking_fee)}<span className='text-lg'>/mo</span></div>
                        <div className='mt-1 text-lg text-gray-600'>per spot</div>

                        <div className='mt-5'>
                            <div className='border border-gray-300 flex bg-white py-2 px-2 rounded-full shadow-md w-[150px] justify-between items-center'>
                                <div className={`${num_of_parkings > 0 ? "text-sky-600 cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
                                    onClick={decreaseParking}><FiMinusCircle size={25} /></div>
                                <div className='select-none'>{num_of_parkings}</div>
                                <div className={`${num_of_parkings < prop.max_num_of_vehicle ? "text-sky-600 cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
                                    onClick={increaseParking}><FiPlusCircle size={25} /></div>
                            </div>
                        </div>
                    </>
                )}

                <div className='mt-10 w-full select-none'>
                    <div className='w-full text-base font-semibold'>Parking descriptions</div>
                    <div className='w-full text-base font-normal'>{prop.parking_descriptions}</div>
                </div>

                {prop.parking_fee_required == "Yes" &&
                    <div className='mt-5 w-full select-none'>
                        <div className='w-full text-base font-semibold'>Please note</div>
                        <div className='w-full text-base font-normal'>Parking can take up to 3-4 business days after the request to register.</div>
                    </div>
                }

                <div className='w-full flex justify-end mt-8 select-none'>
                    <div className='px-7 py-2 rounded-full bg-sky-600 text-white cursor-pointer hover:shadow-2xl 
                    hover:bg-sky-700' onClick={addParking}>{payload.parkings > 0 ? "Update" : "Add"}</div>
                </div>
            </div>
        </div>
    )
}

export default ParkingBox
