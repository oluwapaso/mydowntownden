"use client"

import Image from 'next/image'
import React from 'react'
import { FaFacebookSquare } from 'react-icons/fa'
import { BsInstagram } from 'react-icons/bs'
import { FaTiktok, FaXTwitter } from 'react-icons/fa6'
import { IoLogoYoutube } from 'react-icons/io5'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/(user-end)/(main-layout)/GlobalRedux/store'
import CustomLinkMain from './CustomLinkMain'
import Link from 'next/link'
import moment from 'moment'

const Footer = ({ page }: { page?: string }) => {

    const comp_info = useSelector((state: RootState) => state.app);
    //const city_lists = useSelector((state: RootState) => state.cities);

    return (
        <section className='w-full py-8 md:py-14 bg-primary text-white' id='footer'>
            <div className='container mx-auto max-w-[1200px] px-0 lg:px-3 xl:px-0 text-left'>

                <div className={`w-full grid grid-cols-2 md:grid-cols-3 gap-5 *:font-normal *:text-lg *:px-4 *:py-3 *:rounded-t-md transition-all 
                    duration-500 *:border-transparent *:border-b-2 border-t-2 border-b-2 border-white pt-10 pb-10 lg:pb-20 lg:px-6 justify-center *:flex
                     *:items-center *:justify-start lg:*:justify-center`}>
                    <CustomLinkMain href={`/`} className='hover:border-gray-400 hover:bg-gray-700 hover:shadow-2xl hover:shadow-gray-500'>Home</CustomLinkMain>
                    <CustomLinkMain href={`/search?neighborhood=All Neighborhoods&move_in=${moment(moment().add(1, "day")).format("YYYY-MM-DD")}&move_out=${moment(moment().add(32, "days")).format("YYYY-MM-DD")}&map_bounds=${JSON.stringify({ north: 42.60242525588096, south: 42.171848287543746, east: -70.73319879101562, west: -71.38688531445312 })}`} className='hover:border-gray-400 hover:bg-gray-700 hover:shadow-2xl hover:shadow-gray-500'>Discover Dens</CustomLinkMain>
                    <CustomLinkMain href={`/about-us`} className='hover:border-gray-400 hover:bg-gray-700 hover:shadow-2xl hover:shadow-gray-500'>Our Story</CustomLinkMain>
                    <CustomLinkMain href={`/contact-us`} className='hover:border-gray-400 hover:bg-gray-700 hover:shadow-2xl hover:shadow-gray-500'>Contact</CustomLinkMain>
                    <CustomLinkMain href={`/privacy-policy`} className='hover:border-gray-400 hover:bg-gray-700 hover:shadow-2xl hover:shadow-gray-500'>Privacy Policy</CustomLinkMain>
                    <CustomLinkMain href={`/terms`} className='hover:border-gray-400 hover:bg-gray-700 hover:shadow-2xl hover:shadow-gray-500'>Terms & Conditions</CustomLinkMain>
                </div>

                <div className={`w-full grid grid-cols-1 lg:grid-cols-3 gap-y-4 justify-center items-center mt-10 px-4 lg:px-0`}>
                    <div className='flex flex-col *:font-light order-1'>
                        <span>178 Cohasset Street,</span>
                        <span className='mt-[6px]:'>Worcester, MA 01604</span>
                    </div>

                    <div className='footer-logo-container flex items-center justify-center order-3 lg:order-2'>
                        <CustomLinkMain href="/">
                            <img src={"/my-down-town-den-logo-light.png"} alt='Logo image' width={120} height={50}
                                className='w-[auto] h-[50px] xs:h-[50px]' />
                        </CustomLinkMain>
                    </div>

                    <div className='flex flex-col *:font-light *:text-left lg:*:text-right order-2 lg:order-3'>
                        <span>617-893-0633</span>
                        <span className='mt-[6px]:'>
                            <Link href={`mailto:brendon.bourne@mydowntownden.com`} className='text-base text-wrap break-all'>brendon.bourne@mydowntownden.com</Link>
                        </span>
                    </div>
                </div>

                <div className="w-full flex space-x-6 justify-center items-center mt-20 *:rounded-md *:p-2 *:shadow-2xl 
                    *:shadow-gray-500 *:border *:border-gray-100">
                    <Link href={`${comp_info.facebook}`} target='_blank' className='hover:shadow-xl hover:shadow-gray-500'><FaFacebookSquare size={23} /></Link>
                    <Link href={`${comp_info.instagram}`} target='_blank' className='hover:shadow-xl hover:shadow-gray-500'><BsInstagram size={23} /></Link>
                    <Link href={`${comp_info.twitter}`} target='_blank' className='hover:shadow-xl hover:shadow-gray-500'><FaXTwitter size={23} /></Link>
                    <Link href={`${comp_info.youtube}`} target='_blank' className='hover:shadow-xl hover:shadow-gray-500'><IoLogoYoutube size={23} /></Link>
                    <Link href={`${comp_info.youtube}`} target='_blank' className='hover:shadow-xl hover:shadow-gray-500 !mr-0'><FaTiktok size={23} /></Link>
                </div>

            </div>
        </section>
    )
}

export default React.memo(Footer);