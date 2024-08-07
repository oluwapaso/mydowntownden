"use client"

import React, { useEffect, useState } from 'react'
import { Helpers } from '@/_lib/helpers';
import { APIResponseProps, Reservation } from './types';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { hidePageLoader, showPageLoader } from '@/app/(admin)/admin/GlobalRedux/admin/adminSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import ReservationListCard from './ReservationListCard';
import MiniReservationCard from './MiniReservationCard';

const helpers = new Helpers();
const PropertyMiniReservations = ({ property_id, setTotalReservations }:
    { property_id: number, setTotalReservations: React.Dispatch<React.SetStateAction<number>> }) => {

    const dispatch = useDispatch();
    const [reservation, setReservation] = useState<Reservation[]>([]);
    const [resv_fetched, setResvFetched] = useState(false);

    const payload = {
        property_id: property_id,
    }

    useEffect(() => {

        const fetchReservations = async () => {
            const resvPromise: Promise<APIResponseProps> = helpers.LoadMiniReservations(payload);
            const rsvResp = await resvPromise;

            if (rsvResp.success) {
                const reservationData = rsvResp.data;
                if (reservationData && reservationData.length) {
                    setReservation(reservationData);
                    setTotalReservations(reservationData[0].total_records);
                }
            }

            setResvFetched(true);
        }

        fetchReservations();

    }, []);

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

    return (
        <div className='w-full divide-y divide-gray-300'>
            {/* Loader */}
            {!resv_fetched && <div className=' col-span-full h-[150px] bg-white flex items-center justify-center'>
                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
            </div>}

            {/* Rows */}
            {
                resv_fetched && (
                    (reservation.length && reservation.length > 0)
                        ? (reservation.map((reserv) => {
                            return (<MiniReservationCard key={reserv.reservation_id} rev={reserv} handleDelete={handleDelete} />)
                        }))
                        : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                            No reservations added yet.
                        </div>)
            }
        </div>
    )
}

export default PropertyMiniReservations
