"use client"

import { Helpers } from '@/_lib/helpers'
import React, { useState } from 'react'
import Modal from './Modal'
import { FiMinusCircle, FiPlusCircle } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

const helpers = new Helpers()
const PetsBox = ({ payload, prop }: { payload: { [key: string]: any }, prop: any }) => {

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
            <div className={`border border-gray-300 drop-shadow-xl cursor-pointer px-4 py-6 flex flex-col justify-between 
            items-center rounded-md min-w-[180px] ${payload.pets > 0 ? "bg-sky-100" : "bg-white"}`} onClick={openModal}>
                <div className=' flex flex-col items-center justify-center'>
                    <img src='/Pets.svg' width={10} height={10} className=' w-7 h-7' /><div className='w-full flex'></div>
                    <div className='mt-1 font-semibold'>Pets</div>
                </div>
                {prop.each_pets_fee_per_month > 0 &&
                    <div className='mb-3'>
                        {helpers.formatCurrency(prop.each_pets_fee_per_month)}/mo
                    </div>}

                {prop.parking_fee_required == "Yes" &&
                    <div className=' text-sky-700'>
                        {prop.parking_fee_required ? (payload.pets > 0 ? "Edit" : "Add") : "View detail"}
                    </div>
                }
            </div>


            <Modal show={showModal} children={<ModalInner payload={payload} prop={prop} closeModal={closeModal} />} width={500} closeModal={closeModal} title={<>Parking</>} />
        </>
    )
}

const ModalInner = ({ payload, prop, closeModal }: { payload: { [key: string]: any }, prop: any, closeModal: () => void }) => {

    const router = useRouter();
    const [num_of_pets, setNumOfPets] = useState(parseInt(payload.pets));

    const increasePets = () => {
        if (num_of_pets < prop.max_num_of_pets) {
            setNumOfPets((prev_parking: number) => prev_parking + 1)
        }
    }

    const decreasePets = () => {
        if (num_of_pets > 0) {
            setNumOfPets((prev_parking: number) => prev_parking - 1)
        }
    }

    const addPets = () => {
        const pf = { ...payload }
        closeModal()
        router.push(`/listings/${pf.property_id}/${pf.address}?move_in=${pf.move_in}&move_out=${pf.move_out}&pets=${num_of_pets}&parkings=${pf.parkings}`, { scroll: false });
    }


    return (
        <div className='w-full flex flex-col'>
            <div className=' flex flex-col items-center justify-center'>
                <img src='/Pets.svg' width={10} height={10} className=' w-10 h-10' /><div className='w-full flex'></div>

                {prop.each_pets_fee_per_month > 0 && (
                    <>
                        <div className='mt-3 font-medium text-2xl text-gray-800 space-x-2'>
                            <span>{helpers.formatCurrency(prop.each_pets_fee_per_month)}<span className='text-lg'>/mo</span></span>
                            <span className='text-lg'>+</span>
                            <span>{helpers.formatCurrency(prop.one_time_pets_fee)}<span className='text-lg'>/mo</span></span>
                        </div>
                        <div className='mt-1 text-lg text-gray-600'>per pet</div>

                        <div className='mt-5'>
                            <div className='border border-gray-300 flex bg-white py-2 px-2 rounded-full shadow-md w-[150px] justify-between items-center'>
                                <div className={`${num_of_pets > 0 ? "text-sky-600 cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
                                    onClick={decreasePets}><FiMinusCircle size={25} /></div>
                                <div className='select-none'>{num_of_pets}</div>
                                <div className={`${num_of_pets < prop.max_num_of_pets ? "text-sky-600 cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
                                    onClick={increasePets}><FiPlusCircle size={25} /></div>
                            </div>
                        </div>
                    </>
                )}


                <div className='mt-10 w-full select-none'>
                    {prop.weight_limit_and_restrictions == "Yes" &&
                        <div className='w-full text-base font-semibold'>Weight limit and breed restrictions apply</div>
                    }
                    {prop.prohibited_animals_and_breeds != "" &&
                        <div className='w-full text-base font-normal'> Prohibited breeds include {prop.prohibited_animals_and_breeds}</div>
                    }
                </div>

                <div className='w-full flex justify-end mt-8 select-none'>
                    <div className='px-7 py-2 rounded-full bg-sky-600 text-white cursor-pointer hover:shadow-2xl 
                    hover:bg-sky-700' onClick={addPets}>{payload.pets > 0 ? "Update" : "Add"}</div>
                </div>
            </div>
        </div>
    )
}

export default PetsBox
