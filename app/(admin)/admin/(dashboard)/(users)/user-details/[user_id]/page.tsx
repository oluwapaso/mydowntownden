"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Helpers } from '@/_lib/helpers';
import { useParams, useRouter } from 'next/navigation';
import { APIResponseProps, User } from '@/components/types';
import { hidePageLoader, showPageLoader } from '@/app/(admin)/admin/GlobalRedux/admin/adminSlice';
import { BsArrowLeftShort } from 'react-icons/bs';
import UserInfo from '@/app/(admin)/admin/_components/UserInfo';
import { BiTrash } from 'react-icons/bi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLink from '@/components/CustomLink';
import { FaEdit } from 'react-icons/fa';
import Swal from 'sweetalert2';

const helpers = new Helpers();
const UserDetails = () => {

    const dispatch = useDispatch();
    const params = useParams();
    const router = useRouter();

    const [user_info, setUserInfo] = useState<User>({} as User);
    const [user_info_fetched, setUserInfoFetched] = useState(false);
    const user_id = params?.user_id;

    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const userPromise: Promise<User> = helpers.LoadSingleUser(user_id as string);
                const userResp = await userPromise;

                setUserInfo(userResp);
                setUserInfoFetched(true);
                dispatch(hidePageLoader());

            } catch (e: any) {
                console.log(e.message)
                dispatch(hidePageLoader());
            }

        }

        dispatch(showPageLoader());
        fetchUsers();

    }, [user_id]);

    const handleDelete = async () => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this user?",
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
            await fetch(`${apiBaseUrl}/api/users/delete-account`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "user_id": user_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    router.push(`/admin/all-users?stage=Any&page=1`);
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

    return (
        <div className='w-full bg-gray-50 relative'>
            <div className='container mx-auto max-w-[800px]'>
                <div className='w-full flex justify-between items-center'>
                    <div className='font-semibold text-xl'>User Info</div>
                    <div className='flex items-center'>
                        <CustomLink href={`/admin/edit-user?user_id=${user_id}`} className='bg-sky-600 text-white flex items-center 
                            justify-center py-1 px-4 h-10 text-sm font-medium hover:drop-shadow-xl rounded-md'>
                            <FaEdit className='mr-1 text-base' /> <span>Edit info</span>
                        </CustomLink>
                        <div className='ml-2 bg-red-600 text-white flex items-center justify-center py-1 px-4 h-10 text-sm 
                            font-medium hover:drop-shadow-xl rounded-md cursor-pointer' onClick={handleDelete}>
                            <BiTrash className='mr-1 text-base' /> <span>Delete Account</span>
                        </div>
                        <button className='ml-2 bg-red-600 text-white flex items-center justify-center py-1 px-4 h-10 text-sm 
                        font-medium hover:drop-shadow-xl rounded-md' onClick={() => router.back()}>
                            <BsArrowLeftShort className='mr-1 !text-2xl' /> <span>Back</span>
                        </button>
                    </div>
                </div>
                <div className='w-full grid grid-cols-1 mt-4 *:rounded-md *:bg-white *:drop-shadow'>

                    <div className='col-span-1 relative'>
                        <UserInfo info={user_info} />
                    </div>

                </div>
                <ToastContainer />
            </div>
        </div>
    )
}

export default UserDetails