"use client"

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6'

const Pagination = ({ totalPage, curr_page, url_path, scroll_to }: { totalPage: number, curr_page: number, url_path: string, scroll_to?: string }) => {

    const active_link = '!bg-red-400 text-white rounded-full drop-shadow-xl hover:rounded-none'
    const prev_class = 'cursor-pointer mr-2 border-2 border-white hover:border-primary p-1'
    const next_class = 'cursor-pointer ml-2 border-2 border-white hover:border-primary p-1'
    const router = useRouter();
    const [canScroll, setCanScroll] = useState(false);

    const handleClick = (loc: string) => {
        setCanScroll(true);
        router.push(loc, { scroll: false });
    }

    useEffect(() => {
        // Scroll to the target component when the component mounts
        if (canScroll) {
            const element = document.getElementById(scroll_to as string);
            if (element) {

                const rect = element.getBoundingClientRect();
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const finalOffset = rect.top + scrollTop - 180;

                window.scrollTo({
                    top: finalOffset,
                    behavior: 'smooth'
                });

            }
        }
    }, [curr_page]);

    return (
        <div className='w-full text-cent flex justify-end items-center mt-5'>
            {curr_page > 1 ? (
                <div onClick={() => handleClick(`${url_path}page=${curr_page - 1}`)} className={prev_class}>
                    <FaArrowLeftLong size={25} />
                </div>
            ) : (
                <div className={`${prev_class} !cursor-not-allowed !opacity-50`}>
                    <FaArrowLeftLong size={25} />
                </div>
            )}

            {[...Array(totalPage)].map((_elem, index) => {
                // Show first link
                if (index === 0) {
                    return (
                        <div key={index} onClick={() => handleClick(`${url_path}page=${index + 1}`)} className={`size-10 flex items-center 
                        justify-center font-medium bg-slate-200 cursor-pointer hover:bg-sky-400 hover:drop-shadow-xl mx-1 hover:scale-125 
                        transition-all duration-300 ${curr_page === index + 1 ? active_link : null}`}>{index + 1}
                        </div>
                    );
                }

                // Show ellipsis before the last link and after the first link
                if ((index === 1 && curr_page > 3) || (index === totalPage - 2 && curr_page < totalPage - 2)) {
                    return (
                        <div key={index} className="mx-1">...</div>
                    );
                }

                // Show current page link and nearby links
                if (index === totalPage - 1 || (index >= curr_page - 3 && index <= curr_page + 1)) {
                    return (
                        <div key={index} onClick={() => handleClick(`${url_path}page=${index + 1}`)} className={`size-10 flex items-center 
                        justify-center font-medium bg-slate-200 cursor-pointer hover:bg-sky-400 hover:drop-shadow-xl mx-1 hover:scale-125 
                        transition-all duration-300 ${curr_page === index + 1 ? active_link : null}`}>{index + 1}
                        </div>
                    );
                }

                return null; // Hide other links
            })}

            {curr_page < totalPage ? (
                <div onClick={() => handleClick(`${url_path}page=${curr_page + 1}`)} className={next_class}>
                    <FaArrowRightLong size={25} />
                </div>
            ) : (
                <div className={`${next_class} !cursor-not-allowed !opacity-50`}>
                    <FaArrowRightLong size={25} />
                </div>
            )}
        </div>
    );


}


export default Pagination