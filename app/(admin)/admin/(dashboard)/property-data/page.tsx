"use client"

import { Helpers } from '@/_lib/helpers';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../GlobalRedux/admin/adminSlice';
import { APIResponseProps } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageTitle from '../../_components/PageTitle';
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';
import { TagsInput } from "react-tag-input-component";

const helpers = new Helpers();
const CompanyInfo = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const { is1Xm, is2Xm } = useCurrentBreakpoint();

    const dispatch = useDispatch();
    const [interior_features, setInteriorFeatures] = useState<any[]>([]);
    const [exterior_features, setExteriorFeatures] = useState<any[]>([]);
    const [amenities, setAmenities] = useState<any[]>([]);
    const [equipments, setEquipments] = useState<any[]>([]);
    const [apartment_rules, setApartmetRules] = useState<any[]>([]);

    useEffect(() => {

        const fetch_info = async () => {
            const comp_info_prms = helpers.FetchCompanyInfo();
            const comp_info = await comp_info_prms;

            if (comp_info.success && comp_info.data) {
                if (comp_info.data.interior_features && comp_info.data.interior_features.length) {
                    setInteriorFeatures(comp_info.data.interior_features || []);
                }

                if (comp_info.data.exterior_features && comp_info.data.exterior_features.length) {
                    setExteriorFeatures(comp_info.data.exterior_features || []);
                }

                if (comp_info.data.amenities && comp_info.data.amenities.length) {
                    setAmenities(comp_info.data.amenities || []);
                }

                if (comp_info.data.equipments && comp_info.data.equipments.length) {
                    setEquipments(comp_info.data.equipments || []);
                }

                if (comp_info.data.apartment_rules && comp_info.data.apartment_rules.length) {
                    setApartmetRules(comp_info.data.apartment_rules || []);
                }
                dispatch(hidePageLoader())
            }
        }

        dispatch(showPageLoader())
        fetch_info();

    }, []);

    const handleSubmit = async () => {

        dispatch(showPageLoader());
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/admin/settings/update-property-data`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ interior_features, exterior_features, amenities, equipments, apartment_rules }),
        }).then((resp): Promise<APIResponseProps> => {
            dispatch(hidePageLoader());
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.success) {
                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });
    }

    return (
        <div className='w-full'>
            <PageTitle text="Property Data" show_back={true} />
            <div className='container m-auto max-w-[650px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Property Data.</div>
                            <div className=''>Provide common interior, exterior, amenities, apartment rules and equipments common in
                                properties.</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>
                            <div className='w-full'>
                                <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>

                                    <div className='col-span-1 sm:col-span-2'>
                                        <label htmlFor="interior_features" className='form-label'>Interior Features</label>
                                        <TagsInput value={interior_features} onChange={setInteriorFeatures} name="interior_features" placeHolder="Enter feature and press Enter or Comma to add item"
                                            classNames={{ input: "rounded-none", tag: 'bg-red-500' }} separators={["Enter", ","]} />
                                        <small className='w-full text-red-600'>Press <strong>Enter</strong> or <strong>Comma </strong>
                                            to add item</small>
                                    </div>

                                    <div className='col-span-1 sm:col-span-2 mt-3'>
                                        <label htmlFor="exterior_features" className='form-label'>Exterior Features</label>
                                        <TagsInput value={exterior_features} onChange={setExteriorFeatures} name="exterior_features" placeHolder="Enter feature and press Enter or Comma to add item"
                                            classNames={{ input: "rounded-none", tag: 'bg-red-500' }} separators={["Enter", ","]} />
                                        <small className='w-full text-red-600'>Press <strong>Enter</strong> or <strong>Comma </strong>
                                            to add item</small>
                                    </div>

                                    <div className='col-span-1 sm:col-span-2 mt-3'>
                                        <label htmlFor="amenities" className='form-label'>Amenities</label>
                                        <TagsInput value={amenities} onChange={setAmenities} name="amenities" placeHolder="Enter amenity and press Enter or Comma to add item"
                                            classNames={{ input: "rounded-none", tag: 'bg-red-500' }} separators={["Enter", ","]} />
                                        <small className='w-full text-red-600'>Press <strong>Enter</strong> or <strong>Comma </strong>
                                            to add item</small>
                                    </div>

                                    <div className='col-span-1 sm:col-span-2 mt-3'>
                                        <label htmlFor="equipments" className='form-label'>Equipments</label>
                                        <TagsInput value={equipments} onChange={setEquipments} name="equipments" placeHolder="Enter equipment and press Enter or Comma to add item"
                                            classNames={{ input: "rounded-none", tag: 'bg-red-500' }} separators={["Enter", ","]} />
                                        <small className='w-full text-red-600'>Press <strong>Enter</strong> or <strong>Comma </strong>
                                            to add item</small>
                                    </div>

                                    <div className='col-span-1 sm:col-span-2 mt-3'>
                                        <label htmlFor="equipments" className='form-label'>Apartment Rules</label>
                                        <TagsInput value={apartment_rules} onChange={setApartmetRules} name="apartment_rules" placeHolder="Enter apartment rules and press Enter or Comma to add item"
                                            classNames={{ input: "rounded-none", tag: 'bg-red-500' }} separators={["Enter", ","]} />
                                        <small className='w-full text-red-600'>Press <strong>Enter</strong> or <strong>Comma </strong>
                                            to add item</small>
                                    </div>

                                    <div className='col-span-1 sm:col-span-2 mt-4'>
                                        <button type="submit" className='bg-gray-800 py-2 px-6 text-white float-right hover:bg-gray-700 
                                        hover:drop-shadow-md rounded' onClick={handleSubmit}>
                                            Update Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    )

}

export default CompanyInfo