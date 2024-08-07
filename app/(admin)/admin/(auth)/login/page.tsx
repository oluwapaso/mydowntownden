"use client"

import CustomLink from '@/components/CustomLink'
import React, { useEffect, useState } from 'react'
import { GrUserAdmin } from 'react-icons/gr'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/app/(admin)/admin/GlobalRedux/store'
import { Login, emptyError, hidePageLoader } from '@/app/(admin)/admin/GlobalRedux/admin/adminSlice'
import { useRouter } from 'next/navigation'

const AdminLogin = () => {

    const dispatch = useDispatch<AppDispatch>();
    const auth_params = {
        username: "",
        password: ""
    }

    const admin = useSelector((state: RootState) => state.admin);
    const [AuthParams, setAuthParams] = useState(auth_params);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthParams((prev_state) => {
            return {
                ...prev_state,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleLogin = async () => {

        let login_toast: any
        if (!AuthParams.username || !AuthParams.username) {
            if (login_toast) {
                toast.dismiss();
                login_toast = null
            }
            login_toast = toast.error("Provide a valid login info", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        await dispatch(Login({ username: AuthParams.username, password: AuthParams.password }))

    }

    //Display errors
    useEffect(() => {
        if (admin.isLogginIn == false && admin.error != "") {

            toast.dismiss();
            toast.error(admin.error, {
                position: "top-center",
                theme: "colored"
            });

            dispatch(emptyError());

        }
    }, [admin.error])


    //Handle successfull logins
    useEffect(() => {
        if (admin.isLogginIn == false && admin.error == "" && admin.admin_id != null) {

            toast.dismiss();
            toast.success("Successfully logged in", {
                position: "top-center",
                theme: "colored"
            });

        }
    }, [admin.admin_id])

    useEffect(() => {
        dispatch(hidePageLoader());
    }, []);

    if (admin.isLogged) {
        const router = useRouter();
        router.push("/admin/dashboard")
    } else {
        return (
            <section className='w-full h-svh bg-gradient-to-br from-sky-600 to-red-500 py-20 flex justify-center items-center font-poppins'>
                <div className='container mx-auto max-w-[95%] xs:max-w-[480px] text-left'>

                    <div className='w-full text-white text-center font-normal text-xl xs:text-2xl mb-4'>Log Into CRM Dashboard</div>
                    <div className='bg-white border border-slate-400 px-4 xs:px-7 py-10 rounded-md shadow-2xl'>
                        <div className='w-full flex items-center justify-center'>
                            <div className='size-[65px] xs:size-[90px] rounded-full bg-red-400 flex items-center justify-center'>
                                <GrUserAdmin size={30} className='text-white' />
                            </div>
                        </div>

                        <div className='w-full flex flex-col mt-7'>

                            <div className='w-full'>
                                <input className='w-full py-2 border-b border-slate-400 outline-0' placeholder='Username or Email' name='username'
                                    value={AuthParams.username} onChange={handleChange} />
                            </div>

                            <div className='w-full mt-4'>
                                <input type='password' className='w-full py-2 border-b border-slate-400 outline-0' placeholder='Password' name='password'
                                    value={AuthParams.password} onChange={handleChange} />
                            </div>

                            <div className='w-full mt-8'>
                                {!admin.isLogginIn ?
                                    <button className='w-full bg-sky-800 text-white text-center py-3 px-4 rounded' onClick={handleLogin}>Login</button> :
                                    <button className='w-full bg-sky-800/70 text-white text-center py-3 px-4 rounded flex items-center justify-center cursor-not-allowed' disabled>
                                        <span>Login In... Please wait</span> <AiOutlineLoading3Quarters size={16} className='animate-spin ml-2' /></button>
                                }
                            </div>

                            <div className='w-full mt-4'>
                                <CustomLink href='/admin/forgot-pasword' className='text-sky-600'>Forgot password?</CustomLink>
                            </div>
                        </div>
                    </div>

                </div>
                <ToastContainer />
            </section>
        )
    }

}

export default AdminLogin