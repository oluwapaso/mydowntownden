import React from 'react'
import { Reservation } from './types'
import { BiEdit, BiTrash } from 'react-icons/bi'
import CustomLink from './CustomLink'
import { FaArrowRightLong } from 'react-icons/fa6'
import moment from 'moment'

const MiniReservationCard = ({ rev, handleDelete }: {
    rev: Reservation, handleDelete: (id: number) => void
}) => {

    return (
        <div id={`reservation_${rev.reservation_id}`} className="bg-white grid grid-cols-[repeat(2,1fr)_minmax(150px,150px)] items-center 
        *:text-wrap *:break-all *:px-4 *:py-3 *:font-normal">
            <div>
                <div className=' flex flex-col'>
                    <CustomLink href={`/admin/edit-reservation?reservation_id=${rev.reservation_id}`} className="text-sky-700 text-lg font-medium">
                        {(rev.firstname && rev.lastname) ? `${rev.firstname} ${rev.lastname}` : <span className=' text-red-600'>No name</span>}
                    </CustomLink>
                    <div className='mt-1'>{rev.email ? rev.email : <span className=' text-red-600'>No email</span>}</div>
                </div>

            </div>
            <div>
                <span className='flex items-center space-x-3'>
                    <span>{moment(rev.move_in).format("MM/DD/YYY")}</span>
                    <FaArrowRightLong size={16} />
                    <span>{moment(rev.move_out).format("MM/DD/YYY")}</span>
                </span>
            </div>
            <div className='flex *:bg-primary px-0 *:p-2 *:cursor-pointer *:rounded *:hover:shadow-md *:flex-grow *:flex *:justify-center 
            *:items-center *:text-white space-x-2'>
                <CustomLink href={`/admin/edit-reservation?reservation_id=${rev.reservation_id}`}>
                    <div className='hover:shadow-lg'><BiEdit size={18} /></div>
                </CustomLink>
                <div className='hover:shadow-lg hidden' onClick={() => handleDelete(rev.reservation_id)}><BiTrash size={18} /></div>
            </div>
        </div>
    )
}

export default MiniReservationCard
