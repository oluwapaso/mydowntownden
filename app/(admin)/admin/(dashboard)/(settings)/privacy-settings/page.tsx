"use client"

import { Helpers } from '@/_lib/helpers';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/admin/adminSlice';
import PageTitle from '../../../_components/PageTitle';
import dynamic from "next/dynamic";
import { APIResponseProps } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';

const Ck_Editor_Component = dynamic(() => import("../../../_components/Ckeditor"), { ssr: false });
const helpers = new Helpers();
const PrivacySettings = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const { is1Xm, is2Xm } = useCurrentBreakpoint();

    const [privacy, setPrivacy] = useState("");
    const dispatch = useDispatch();

    const handleDataChange = (data: string) => {
        setPrivacy(data);
    };

    useEffect(() => {
        const fetch_info = async () => {
            const comp_info_prms = helpers.FetchCompanyInfo();
            const comp_info = await comp_info_prms

            if (comp_info.success && comp_info.data) {
                if (comp_info.data.privacy_policy != "") {
                    setPrivacy(comp_info.data.privacy_policy)
                }
                dispatch(hidePageLoader())
            }
        }

        dispatch(showPageLoader())
        fetch_info();
    }, [])


    const handleSubmit = async () => {

        if (!privacy) {
            toast.dismiss();
            toast.error("Privacy policy can't be empty", {
                position: "top-center",
                theme: "colored"
            })
            return false;
        }

        const payload = {
            "update_type": "Privacy",
            "value": privacy,
        }
        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/admin/settings/update-privacy-and-terms`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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

        }).catch((err: any) => {
            toast.error(`${err}`, {
                position: "top-center",
                theme: "colored"
            })
        });
    }

    return (
        <div className='w-full'>
            <PageTitle text="Privacy Settings" show_back={true} />
            <div className='container m-auto max-w-[99%] lg:max-w-[900px]'>
                <div className='w-full mt-6 border border-gray-200 bg-white p-3 sm:p-7 flex flex-col'>
                    <Ck_Editor_Component data={privacy} onDataChange={handleDataChange} height="620px" />
                    <div className=' mt-6 w-full'>
                        <button className='test_btn bg-gray-800 py-3 px-4 text-white float-right hover:bg-gray-700 hover:drop-shadow-md'
                            onClick={handleSubmit}>Update Policy</button>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    )
}

export default PrivacySettings