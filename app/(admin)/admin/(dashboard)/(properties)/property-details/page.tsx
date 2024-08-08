"use client"

import { Helpers } from '@/_lib/helpers'
import { APIResponseProps, PropertyDetails } from '@/components/types'
import React, { useEffect, useState } from 'react'
import PageTitle from '../../../_components/PageTitle'
import { useDispatch } from 'react-redux'
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/admin/adminSlice'
import Swal from 'sweetalert2'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'next/navigation'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BsBuildingAdd } from 'react-icons/bs'
import PropertyDetailsLeft from '@/components/PropDetailsLeft'
import PropertyDetailsRight from '@/components/PropertyDetailsRight'
import CustomLink from '@/components/CustomLink'
import { MdContentCopy } from 'react-icons/md'
import { FaRegTrashAlt } from 'react-icons/fa'
import { FiMoreVertical } from 'react-icons/fi'
import { BiCalendar } from 'react-icons/bi'
import moment from 'moment'

const helpers = new Helpers();
const GetPropertyDetails = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const property_id = parseInt(searchParams?.get("property_id") as string);

    const [property, setProperty] = useState<PropertyDetails>({} as PropertyDetails);
    const [prop_fetched, setPropFetched] = useState(false);
    const [show_more, setShowMore] = useState(false);
    const [total_reservations, setTotalReservations] = useState(0);

    const payload = {
        property_id: property_id,
    }

    useEffect(() => {

        const fetchProperty = async () => {
            const propPromise: Promise<APIResponseProps> = helpers.LoadSingleProperty(payload)
            const propResp = await propPromise;

            if (propResp.success) {
                const propertyData = propResp.data;
                setProperty(propertyData);
            }

            setPropFetched(true);
            dispatch(hidePageLoader());
        }

        dispatch(showPageLoader());
        setProperty({} as PropertyDetails);
        fetchProperty();

    }, [property_id]);

    const handleDelete = async () => {

        let title = "Are you sure you want to delete this property and it's data?"
        if (property.property_type == "Multi Unit Type") {
            title = "Are you sure you want to delete this unit and it's data?"
        }

        const result = await Swal.fire({
            title: title,
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
            await fetch(`${apiBaseUrl}/api/admin/properties/delete-property`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "property_id": property_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    toast.success(data.message, {
                        position: "top-center",
                        theme: "colored"
                    });

                    window.history.back();

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

    const add_new_comp = <>
        <CustomLink href={`/admin/edit-unit?property_id=${property_id}`} className='bg-green-700 text-white flex 
            items-center justify-center ml-2 py-1 h-10 px-4 text-sm font-medium hover:drop-shadow-xl rounded-md'>
            <BsBuildingAdd className='mr-2 !text-base' />
            Edit
            <span className='hidden'>{property.property_type == "Single Unit Type" ? "Edit Property" : "Edit Unit"}</span>
        </CustomLink>

        {property.property_type == "Multi Unit Type" &&
            <CustomLink href={`/admin/clone-unit?property_id=${property_id}`} className='bg-sky-700 text-white hidden 
            items-center justify-center ml-2 py-1 h-10 px-4 text-sm font-medium hover:drop-shadow-xl rounded-md'>
                <MdContentCopy className='mr-2 !text-base' />
                Clone Unit
            </CustomLink>
        }

        <div className='bg-pink-700 text-white hidden items-center justify-center ml-2 py-1 h-10 px-4 text-sm font-medium 
            hover:drop-shadow-xl rounded-md cursor-pointer' onClick={handleDelete}>
            <FaRegTrashAlt size={13} /> <span className='ml-1'>Delete</span>
        </div>

        <div className='group bg-white text-primary flex items-center justify-center ml-2 py-1 h-10 px-4 text-sm font-medium hover:drop-shadow-xl 
            rounded-md cursor-pointer relative z-20 border border-gray-500' onClick={() => setShowMore(!show_more)}>
            <div className='w-full flex items-center justify-center'>
                <FiMoreVertical size={13} />
            </div>

            <div className={`${show_more ? "flex" : "hidden"} flex-col absolute w-[220px] bg-white rounded shadow-2xl right-0 top-[40px]
            *:text-primary *:flex *:items-center *:py-2 *:h-16 *:px-4 *:text-sm 
            *:font-medium  *:cursor-pointer divide-y divide-gray-300`}>
                {property.property_type == "Multi Unit Type" &&
                    <CustomLink href={`/admin/clone-unit?property_id=${property_id}`} className='hover:bg-gray-50'>
                        <MdContentCopy size={13} /> <span className='ml-1'>Clone Unit</span>
                    </CustomLink>
                }

                <CustomLink href={`/admin/reservations?keyword=${property.mls_number}&date_type=None&from_date=${moment().format("YYYY-MM-DD")}&to_date=${moment().add(31, "days").format("YYYY-MM-DD")}&version=${moment().unix() * 1000}&page=1`} className='hover:bg-gray-50 flex 
                justify-between items-center'>
                    <span className=' flex items-center justify-center'>
                        <BiCalendar size={16} /> <span className='ml-1'>Reservations</span>
                    </span>
                    <span>{total_reservations}</span>
                </CustomLink>

                <CustomLink href={`/admin/add-reservation?property_id=${property_id}`} className='hover:bg-gray-50 flex 
                justify-between items-center'>
                    <span className=' flex items-center justify-center'>
                        <BiCalendar size={16} /> <span className='ml-1'>Add Reservation</span>
                    </span>
                </CustomLink>

                <div className='hover:bg-gray-50' onClick={handleDelete}>
                    <FaRegTrashAlt size={16} />
                    <span className='ml-1'>Delete {property.property_type == "Multi Unit Type" ? "Unit" : "Property"}</span>
                </div>
            </div>
        </div>
    </>

    return (
        <div className='w-full'>
            <div className='container mx-auto w-full max-w-[1350px]'>
                <PageTitle text={`${property.property_name}`} show_back={true} right_component={add_new_comp} />
                <div className='h-[auto] box-border pb-10 mt-5 z-10'>

                    <div className='w-full gap-6'>
                        {/* Loader */}
                        {!prop_fetched && <div className='w-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}
                        {/* Rows */}

                        {(prop_fetched && property.property_id) && (
                            <div className='w-full grid grid-cols-7'>
                                <div className='col-span-2 sticky top-0 h-screen'>
                                    <div className='w-full bg-gray-600 p-4'>
                                        <PropertyDetailsLeft prop={property} />
                                    </div>
                                </div>
                                <div className='col-span-5 bg-white p-6 drop-shadow-xl'>
                                    <PropertyDetailsRight prop={property} toast={toast} setTotalReservations={setTotalReservations} />
                                </div>
                            </div>
                        )}

                    </div>

                </div>

                <ToastContainer />
            </div>
        </div>
    )

}

export default GetPropertyDetails