"use client"

import { Helpers } from '@/_lib/helpers'
import Pagination from '@/components/pagination'
import { APIResponseProps, PropertyLists } from '@/components/types'
import Link from 'next/link'
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
import PropertyCard from '@/components/PropertyCard'
import CustomLink from '@/components/CustomLink'

const helpers = new Helpers();
const AllProperties = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const initialPage = parseInt(searchParams?.get("page") as string) || 1;

    const [properties, setProperties] = useState<PropertyLists[]>([]);
    const [prop_fetched, setPropFetched] = useState(false);
    const [total_page, setTotalPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const page_size = 20;

    const payload = {
        page: initialPage,
        limit: page_size,
        type: "Property Lists",
    }

    useEffect(() => {

        const fetchAdmins = async () => {
            const propPromise: Promise<APIResponseProps> = helpers.LoadProperties(payload)
            const propResp = await propPromise;

            if (propResp.success) {
                const propertyData = propResp.data;
                if (propertyData && propertyData.length) {
                    const total_records = propertyData[0].total_records;
                    setTotalRecords(total_records!);
                    if (total_records) {
                        setTotalPage(Math.ceil(total_records / page_size));
                    }
                }

                setProperties(propertyData);
            }

            setPropFetched(true);
            dispatch(hidePageLoader());
        }

        dispatch(showPageLoader())
        fetchAdmins();

    }, [initialPage]);

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

    const add_new_comp = <CustomLink href="/admin/add-new-property" className='bg-primary text-white flex items-center 
    justify-center ml-2 py-1 h-10 px-4 text-sm font-medium hover:drop-shadow-xl rounded-md'>
        <BsBuildingAdd className='mr-2 !text-base' /> <span>Add New Property</span>
    </CustomLink>

    return (
        <div className='w-full'>
            <div className='container mx-auto w-full max-w-[1350px]'>
                <PageTitle text={`${totalRecords} Propert${totalRecords > 1 ? "ies" : "y"}`} show_back={false} right_component={add_new_comp} />
                <div className='h-[auto] relative box-border pb-10 mt-5'>

                    <div className='w-full grid grid-cols-2 gap-6'>
                        {/* Loader */}
                        {!prop_fetched && <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                            <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
                        </div>}
                        {/* Rows */}
                        {
                            prop_fetched && (
                                (properties.length && properties.length > 0)
                                    ? (properties.map((property) => {
                                        return (<PropertyCard key={property.property_id} prop={property} list_type="Main Lists" />)
                                    }))
                                    : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                                        No properties added yet.
                                    </div>)
                        }
                    </div>

                </div>

                <Pagination totalPage={total_page} curr_page={initialPage} url_path='/admin/all-properties?' />
                <ToastContainer />
            </div>
        </div>
    )

}

export default AllProperties