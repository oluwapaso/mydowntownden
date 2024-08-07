"use client"

import { Helpers } from "@/_lib/helpers";
import { hidePageLoader, logout } from "@/app/(admin)/admin/GlobalRedux/admin/adminSlice";
import { RootState } from "@/app/(admin)/admin/GlobalRedux/store";
import CustomLink from "@/components/CustomLink";
import { APIResponseProps } from "@/components/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdOutlineLockReset } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const helpers = new Helpers();
const ForgotPassword = () => {

    const admin = useSelector((state: RootState) => state.admin);
    const dispatch = useDispatch();

    const [accntEmail, setAccntEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = () => {

        toast.dismiss();
        if (!helpers.validateEmail(accntEmail)) {
            toast.error("Please provide a valid account email", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const payload = {
            account_email: accntEmail
        }

        setIsSubmitting(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/admin/admins/reset-password`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            if (data.message == "Reset Link Sent") {

                toast.success("Reset link successfully sent, follow the link to set new a password", {
                    position: "top-center",
                    theme: "colored"
                });

                dispatch(logout())

            } else {

                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

            }

        }).catch((err: string) => {
            toast.error(`${err}`, {
                position: "top-center",
                theme: "colored"
            });
        })
    }

    useEffect(() => {
        dispatch(hidePageLoader());
    }, []);

    if (admin.isLogged) {
        const router = useRouter();
        router.push("/dashboard")
    } else {

        return (
            <>
                <section className='w-full h-svh bg-gradient-to-br from-sky-600 to-red-500 py-20 flex justify-center items-center font-poppins'>
                    <div className='container mx-auto max-w-[95%] xs:max-w-[480px] text-left'>

                        <div className='w-full text-white text-center font-normal text-xl xs:text-2xl mb-4'>Reset Admin Dashboard</div>
                        <div className='bg-white border border-slate-400 px-4 xs:px-7 py-10 rounded-md shadow-2xl'>
                            <div className='w-full flex items-center justify-center'>
                                <div className='size-[65px] xs:size-[90px] rounded-full bg-red-400 flex items-center justify-center'>
                                    <MdOutlineLockReset size={40} className='text-white' />
                                </div>
                            </div>

                            <div className='w-full flex flex-col mt-7'>

                                <div className='w-full'>
                                    <input type='email' className='w-full py-2 border-b border-slate-400 outline-0' placeholder='Account Email'
                                        value={accntEmail} name='account_email' onChange={(e) => setAccntEmail(e.target.value)} />
                                </div>

                                <div className='w-full mt-8'>
                                    {!isSubmitting ?
                                        <button className='w-full bg-sky-800 text-white text-center py-3 px-4' onClick={handleSubmit}>Send Reset Link</button> :
                                        <button className='w-full bg-sky-800/80 py-3 px-4 text-white flex justify-center items-center 
                                    cursor-not-allowed' disabled>
                                            <span>Please Wait</span> <AiOutlineLoading3Quarters size={16} className='animate-spin ml-2' />
                                        </button>
                                    }
                                </div>

                                <div className='w-full mt-4'>
                                    <CustomLink href='/admin/login' className='text-sky-600'>Remember your password?</CustomLink>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
                <ToastContainer />
            </>
        )
    }
}

export default ForgotPassword