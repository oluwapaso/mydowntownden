"use client"

import { Helpers } from '@/_lib/helpers';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { APIResponseProps, AdminInfo } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/admin/adminSlice';
import PageTitle from '../../../_components/PageTitle';
import AgentForm from '../../../_components/AgentForm';
import { useSearchParams } from 'next/navigation';

const helpers = new Helpers();
const EditAgent = () => {

    //Redirects to login page if user is not logged in
    helpers.VerifySession();
    const searchParams = useSearchParams();

    const admin_id = parseInt(searchParams?.get("admin_id") as string)
    const dispatch = useDispatch();
    const [initialValues, setInitialValues] = useState({} as AdminInfo);

    useEffect(() => {

        const fetch_info = async () => {
            const agent_info_prms = helpers.FetchAdminInfo({ admin_id });
            const agent_info = await agent_info_prms

            if (agent_info.success && agent_info.data) {
                setInitialValues(agent_info.data)
                dispatch(hidePageLoader())
            }
        }

        dispatch(showPageLoader())
        fetch_info();

    }, [])


    const handleSubmit = async (value: any) => {

        const firstname = value.firstname;
        const email = value.email

        if (!firstname || !email) {
            toast.error("Provide a valid firstname and email address.", {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        dispatch(showPageLoader());

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/admin/admins/manage-admins`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
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
            <PageTitle text="Edit Agent Info" show_back={true} />
            <div className='container m-auto max-w-[600px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='col-span-1'>
                            <div className='font-semibold'>Update agent info.</div>
                            <div className=''></div>

                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 lg:p-7 bg-white shadow-lg'>
                            <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize={true}>
                                <AgentForm type='Edit' />
                            </Formik>
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    )

}

export default EditAgent