"use client"
import React, { useState } from 'react'
import { APIResponseProps } from './types';
import { useSession } from 'next-auth/react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useModal } from '@/app/contexts/ModalContext';

const PropFavs = ({ ListingId, page, MLSNumber, PropAddress }: { ListingId: string, page?: string, MLSNumber?: string, PropAddress?: string }) => {

    const { data: session, update } = useSession();
    const user = session?.user as any;
    const [isUpdatingFav, setIsUpdatingFav] = useState(false);
    if (PropAddress) {
        PropAddress = PropAddress.replace(/[^a-zA-Z0-9]+/g, "-");
    }

    const { showModal, closeModal, modalTitle, modalChildren, handleLoginModal } = useModal();

    const AddOrRemoveFromFavs = (prop_id: string, type: string) => {

        toast.dismiss();
        if (!user || !user.user_id) {
            toast.error("You need to login to add properties to favorites", {
                position: "top-center",
                theme: "colored"
            });

            handleLoginModal();
            return false;
        }

        setIsUpdatingFav(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${apiBaseUrl}/api/properties/manage-favorites`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                property_id: prop_id,
                user_id: user.user_id,
                type: type,
                mls_number: MLSNumber,
                property_address: PropAddress,
            }),
        }).then((resp): Promise<APIResponseProps> => {
            setIsUpdatingFav(false);
            return resp.json();
        }).then(data => {
            if (data.success) {
                const updatedUser = { ...user };
                updatedUser.favorites = data.data;
                update(updatedUser);
            } else {
                alert(data.message);
            }
        }).catch((e: any) => {
            alert(e.message);
        })

    }

    let classes = `bottom-0 right-0`;
    let bt_classes = `top-1 left-1`;
    if (page && page == "Prop Details") {
        classes = `top-[10px] right-2 bg-white rounded-full hover:shadow-xl hover:bg-sky-200`;
        bt_classes = `top-[7px] left-[5px]`;
    }

    const switchSRC = (e: React.MouseEvent<HTMLImageElement, MouseEvent>, src: string) => {
        (e.target as HTMLImageElement).src = src;
    }

    return (
        <>
            <div className={`absolute size-9 z-[15] flex justify-center items-center transition-all duration-500 ${classes}`}>
                {
                    isUpdatingFav ? <div className='p-2 animate-spin'> <AiOutlineLoading3Quarters size={25} className='text-white' /></div> :
                        (user && user.favorites && user.favorites.length > 0 && user.favorites.includes(ListingId.toString())) ?
                            <div className={`cursor-pointer absolute w-full h-full ${bt_classes}`}
                                onClick={() => AddOrRemoveFromFavs(ListingId, "Remove")}>
                                <img src='/red-heart-white-border-on.svg'
                                    onMouseOver={(e) => switchSRC(e, "/red-heart-white-border-on-hover.svg")}
                                    onMouseOut={(e) => switchSRC(e, "/red-heart-white-border-on.svg")} />
                            </div>
                            : <div className={`cursor-pointer absolute w-full h-full ${bt_classes}`}
                                onClick={() => AddOrRemoveFromFavs(ListingId, "Add")}>
                                <img src='/white-heart-white-border-off.svg'
                                    onMouseOver={(e) => switchSRC(e, "/white-heart-white-border-on.svg")}
                                    onMouseOut={(e) => switchSRC(e, "/white-heart-white-border-off.svg")} />
                            </div>
                }
            </div>

            {
                /** <AuthModal show={showModal} children={modalChildren} closeModal={closeModal} title={modalTitle} /> */
            }
        </>
    )
}

export default PropFavs