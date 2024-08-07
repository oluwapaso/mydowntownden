"use client"

import { Helpers } from '@/_lib/helpers'
import { InfoWindow, OverlayView } from '@react-google-maps/api'
import numeral from 'numeral'
import React, { useEffect, useRef, useState } from 'react'
import { FaHouseChimneyMedical } from 'react-icons/fa6'
import { HiMiniBuildingOffice2 } from 'react-icons/hi2'
import PropCarousel from './PropCarousel'
import PropFavs from './PropFavs'
import CustomLinkMain from './CustomLinkMain'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const helper = new Helpers();
const CustomMarker = ({ prop, zoom_level, priceWithUtil }: { prop: any, zoom_level: number, priceWithUtil: string, }) => {

    const searchParams = useSearchParams();
    const move_in = searchParams?.get("move_in") as string;
    const move_out = searchParams?.get("move_out") as string;

    const [showInfoWindow, setInfoWindowFlag] = useState(false);
    const windowRef = useRef<HTMLDivElement | null>(null);

    let class_color = "bg-red-500";
    if (prop.RAN_ForSaleRent == "For Rent" && prop.StandardStatus == "Active") {
        class_color = "bg-purple-700";
    } else if (prop.StandardStatus == "Closed") {
        class_color = "bg-pink-600";
    }

    useEffect(() => {

        const handleClickOutside = (e: MouseEvent) => {
            if (windowRef.current && !windowRef.current.contains(e.target as Node)) {
                setInfoWindowFlag(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [windowRef]);

    const link_address = prop.address.replace(/[^a-zA-Z0-9]+/g, "-") + "-" + prop.state + "-" + prop.zip_code;;

    let price_with_util = parseFloat(prop.listprice)
    if (prop.utilities_per_month > 0) {
        price_with_util += parseFloat(prop.utilities_per_month);
    }

    return (
        <OverlayView key={prop.property_id} position={{ lat: parseFloat(prop.latitude), lng: parseFloat(prop.longitude) }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
            <div className='relative' onClick={() => setInfoWindowFlag(true)}>
                <button onClick={() => { }} type='button' className={`p-[6px] w-auto rounded-full border-2 border-white hover:bg-green-600 flex 
                    justify-center items-center hover:scale-125 transition-all duration-300 absolute z-10 hover:z-20 ${class_color} bg
                    text-white`}>
                    {
                        !prop.clustered
                            ? <div className='flex w-[auto] justify-center items-center whitespace-nowrap'>
                                {prop.NewConstructionYN == "true" && <FaHouseChimneyMedical size={12} className='text-white' />}
                                {zoom_level > 11 && <span className={`${prop.NewConstructionYN == "true" ? "ml-1" : null} text-[11px] font-medium`}>
                                    {helper.formatPrice(prop.listprice)}</span>}
                            </div>
                            : <div className='flex w-[auto] justify-center items-center whitespace-nowrap'>
                                <HiMiniBuildingOffice2 size={11} className='text-white' />
                                <span className='ml-1'>{prop.num_of_clusters} units</span>
                            </div>
                    }
                </button>
                {
                    showInfoWindow && <InfoWindow options={{ maxWidth: 295, minWidth: 295 }}
                        position={{ lat: parseFloat(prop.latitude), lng: parseFloat(prop.longitude) }}>
                        <div ref={windowRef} className='w-[295px] h-[295px] bg-white flex flex-col'>
                            {
                                !prop.clustered
                                    ? <>
                                        <div className='map-props w-full h-[180px] relative'>
                                            <PropCarousel key={prop.property_id} images={prop.images} listing_id={prop.property_id}
                                                address={link_address} page="Map-Info" defaultpic={prop.DefaultPic} />
                                            <PropFavs ListingId={prop.property_id} MLSNumber={prop.property_id}
                                                PropAddress={prop.address} />
                                        </div>
                                        <div className='flex-grow flex flex-col p-2 !font-poppins'>
                                            <h1 className='w-full font-bold text-lg flex justify-between items-center'>
                                                <span>
                                                    {priceWithUtil == "Yes"
                                                        ? helper.formatCurrency(prop.listprice)
                                                        : helper.formatCurrency(price_with_util.toString())
                                                    }
                                                </span>

                                                <span className='text-xs font-medium text-gray-600'>{priceWithUtil == "Yes" ? "With" : "Without"} utilities</span>
                                            </h1>
                                            <div className='w-full flex divide-x divide-gray-400 *:px-2 *:text-sm'>
                                                <div className='!pl-0'><strong className='font-semibold'>{prop.beds}</strong> bds</div>
                                                <div><strong className='font-semibold'>{numeral(prop.baths).format("0,0")}</strong> ba</div>
                                                <div><strong className='font-semibold'>{numeral(prop.size_sqft).format("0,0")}</strong> sqft</div>
                                            </div>
                                            <div className='w-full mt-1 whitespace-nowrap font-medium overflow-hidden overflow-ellipsis'>{prop.address}, {prop.city}, {prop.state} {prop.zip_code}</div>
                                        </div>
                                    </>
                                    : <>
                                        <div className='w-full h-full overflow-x-hidden overflow-y-auto relative'>
                                            {
                                                (prop.clustered_rops && prop.clustered_rops.length > 0) && <div className='w-full'>
                                                    <div className='w-full bg-gray-100 font-medium text-sm py-2 px-3 h-[36px]'>
                                                        {prop.address}
                                                    </div>
                                                    <div className='w-full absolute !h-[calc(100%-36px)] overflow-y-auto p-2'>
                                                        {
                                                            prop.clustered_rops.map((c_prop: any, index: number) => {
                                                                let bg_img = `${process.env.NEXT_PUBLIC_PROP_IMAGE_URL}/${c_prop.DefaultPic}`;
                                                                if (c_prop.images && c_prop.images.length) {
                                                                    bg_img = c_prop.images[0];
                                                                }

                                                                let c_price_with_util = parseFloat(c_prop.listprice)
                                                                if (c_prop.utilities_per_month > 0) {
                                                                    c_price_with_util += parseFloat(c_prop.utilities_per_month);
                                                                }

                                                                const address = c_prop.address.replace(/[^a-zA-Z0-9]+/g, "-") + "-" + c_prop.state + "-" + c_prop.zip_code;

                                                                return (
                                                                    <div className='mb-2 border border-gray-200'>
                                                                        <Link key={index} href={`/listings/${c_prop.property_id}/${address}?move_in=${move_in}&move_out=${move_out}&pets=0&parkings=0`} target="_blank">
                                                                            <div className='w-full grid grid-cols-6 h-[90px] !font-poppins cursor-pointer'>
                                                                                <div className='col-span-2 h-full bg-cover object-contain' style={{ backgroundImage: `url(${bg_img})`, backgroundPosition: "center", }}>
                                                                                </div>
                                                                                <div className='col-span-4 flex flex-col px-2'>
                                                                                    <h3 className='w-full font-semibold text-lg mt-1 flex justify-between items-center'>
                                                                                        <span>
                                                                                            {priceWithUtil == "Yes"
                                                                                                ? helper.formatCurrency(c_prop.listprice)
                                                                                                : helper.formatCurrency(c_price_with_util.toString())
                                                                                            }
                                                                                        </span>

                                                                                        <span className='text-xs font-medium text-gray-600'>{priceWithUtil == "Yes" ? "With" : "Without"} utilities</span>
                                                                                    </h3>
                                                                                    <div className='w-full mt-1 grid grid-cols-3 gap-2'>
                                                                                        <div className='flex flex-col'>
                                                                                            <div className='font-medium'>{numeral(c_prop.beds).format("0,0")}</div>
                                                                                            <div>Beds</div>
                                                                                        </div>

                                                                                        <div className='flex flex-col'>
                                                                                            <div className='font-medium'>{numeral(c_prop.baths).format("0,0")}</div>
                                                                                            <div>Baths</div>
                                                                                        </div>

                                                                                        <div className='flex flex-col'>
                                                                                            <div className='font-medium'>{numeral(c_prop.size_sqft).format("0,0")}</div>
                                                                                            <div>SqFt</div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </Link>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </>
                            }
                        </div>
                    </InfoWindow>
                }
            </div>
        </OverlayView>
    )
}

export default CustomMarker