"use client"

import moment from 'moment'
import numeral from 'numeral'
import React from 'react'
import { FaRulerCombined } from 'react-icons/fa6'
import PropCarousel from './PropCarousel'
import PropFavs from './PropFavs'
import useCurrentBreakpoint from '@/_hooks/useMediaQuery'
import { MdOutlineBed } from 'react-icons/md'
import { LiaBathSolid } from 'react-icons/lia'
import { HiOutlineBuildingOffice2, HiOutlineHomeModern } from 'react-icons/hi2'
import { GiIsland } from 'react-icons/gi'
import { Helpers } from '@/_lib/helpers'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const helpers = new Helpers();
const UserPropertyCard = ({ prop, page, priceWithUtil }: { prop: any, page?: string, priceWithUtil: string }) => {

    const searchParams = useSearchParams();
    const move_in = searchParams?.get("move_in") || moment().add(1, 'day').format("YYYY-MM-DD");
    const move_out = searchParams?.get("move_out") || moment().add(32, 'days').format("YYYY-MM-DD");

    const diffInMinutes = moment().diff(moment(prop.MatrixModifiedDT), 'minutes');
    const { is1Xm, is2Xm, isXs } = useCurrentBreakpoint();
    let card_height = "h-[300px]";
    if (isXs) {
        card_height = "h-[240px]";
    }

    if (page == "Map") {
        card_height = "h-[265px]";
    }
    const link_address = prop.address.replace(/[^a-zA-Z0-9]+/g, "-") + "-" + prop.state + "-" + prop.zip_code;

    let prop_icon = <HiOutlineHomeModern size={15} className='text-green-700 mr-1' />
    if (prop.PropertyType == "Lot & Land") {
        prop_icon = <GiIsland size={15} className='text-green-700 mr-1' />
    } else if (prop.PropertyType == "Commercial") {
        prop_icon = <HiOutlineBuildingOffice2 size={15} className='text-green-700 mr-1' />
    }

    let price_with_util = parseFloat(prop.listprice)
    if (prop.utilities_per_month > 0) {
        price_with_util += parseFloat(prop.utilities_per_month);
    }

    return (
        <div key={prop.property_id} className='prop-card group cursor-pointer border border-primary/40 rounded-md overflow-hidden
        shadow-md hover:shadow-xl flex flex-col justify--between'> {/** hover:scale-105 duration-200 hover:z-50 **/}
            <div className={`w-full relative transition-all duration-500 ${card_height}`}>
                {/** pb-[75%] */}
                <PropCarousel key={prop.property_id} images={prop.images} defaultpic={prop.DefaultPic} listing_id={prop.property_id} address={link_address} page={page} />

                <PropFavs ListingId={prop.property_id} MLSNumber={prop.property_id} PropAddress={prop.address} />
            </div>

            <Link className=" flex-grow mb-auto" href={`/listings/${prop.property_id}/${link_address}?move_in=${move_in}&move_out=${move_out}&pets=0&parkings=0`} target="_blank">
                <div className='w-full flex flex-col justify-between h-full'>
                    <div className='w-full pt-2 flex flex-col px-3 py-2 bg-white'>
                        <div className='w-full mt-1 font-medium text-lg'>{prop.address}, {prop.city}, {prop.state} {prop.zip_code}</div>

                    </div>

                    <div>
                        <div className='w-full flex flex-wrap space-x-4 gridgrid-cols-3 gap-x-2gap-y-2 items-center font-normal mt-2 
                         px-3 *:text-base'>
                            {
                                prop.beds > 0 && (
                                    <div className='flex items-center'>
                                        <MdOutlineBed size={18} className='text-red-600 mr-1' />
                                        <span>{prop.beds} bed{prop.beds > 1 ? "s" : ""}</span>
                                    </div>
                                )
                            }
                            {
                                prop.baths > 0 && (
                                    <div className='flex items-center'>
                                        <LiaBathSolid size={18} className='text-sky-700 mr-1' />
                                        <span>{numeral(prop.baths).format("0,0")} bath{prop.baths > 1 ? "s" : ""}</span>
                                    </div>
                                )
                            }
                            {
                                prop.size_sqft > 0 && (
                                    <div className='flex items-center'>
                                        <FaRulerCombined size={15} className='text-pink-600 mr-1' />
                                        <span>{numeral(prop.size_sqft).format("0,0")} SQFT</span>
                                    </div>
                                )
                            }
                        </div>

                        <div className='w-full flex items-center mt-2 bg-gray-100 px-3 py-3 justify-between'>
                            <h2 className='font-medium group-hover:underline underline-offset-4 transition-all duration-500
                            flex flex-col '>
                                <span>
                                    From <span className='text-2xl font-semibold'>
                                        {priceWithUtil == "Yes"
                                            ? helpers.formatCurrency(price_with_util.toString())
                                            : helpers.formatCurrency(prop.listprice)
                                        }
                                    </span>/month
                                </span>
                                <span className='mt-1 text-xs text-gray-600'>{priceWithUtil == "Yes" ? "With" : "Without"} utilities</span>
                            </h2>

                            <div className='text-sm'>Available on <span className='font-semibold'>{moment(prop.available_on).format("DD MMM YYYY")}</span></div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )

}


export default UserPropertyCard