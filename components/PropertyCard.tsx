import React from 'react'
import { PropertyLists } from './types'
import CustomLink from './CustomLink'
import { MdLocationPin } from 'react-icons/md';

const PropertyCard = ({ prop, list_type }: { prop: PropertyLists, list_type: string }) => {

    const dflt_image = "/no-image-added.png";

    let occupied_text = "";
    let vacant_text = "";
    let fully_occupied = false;
    let occupied_prcnt = 0;
    if (prop.property_type == "Single Unit Type") {
        if (prop.status == "Occupied") {
            vacant_text = prop.status;
            fully_occupied = true;
        } else {
            vacant_text = prop.status;
        }
    } else {
        const vacant = prop.total_units - prop.units_occupied;
        if (prop.status == "Occupied") {
            //occupied_text = prop.status;
            //vacant_text = `0 vacant`;
            fully_occupied = true;
            occupied_prcnt = 100;
            vacant_text = prop.status;
        } else {
            //occupied_text = `${prop.units_occupied} occupied`;
            //occupied_text = prop.status;
            //vacant_text = `${vacant} vacant`;
            vacant_text = prop.status;
            if (prop.units_occupied > 0) {
                occupied_prcnt = Math.floor((prop.units_occupied / prop.total_units) * 100);
            }
        }
    }

    return (
        <div className={`bg-white rounded-md overflow-hidden border border-gray-300 hover:shadow-2xl`}>
            <CustomLink href={`/admin/property-details?property_id=${prop.property_id}`} className="w-full">
                <div className='w-full grid grid-cols-5'>
                    <div className={`col-span-2 !bg-cover !bg-center`} style={{ background: `url(${(prop.images && prop.images.length > 0) ? prop.images[0] : dflt_image})` }}></div>
                    <div className='col-span-3 p-4 flex flex-col'>
                        <div className='w-full font-semibold text-lg'>{prop.property_name}</div>
                        <div className='flex items-center text-gray-800'>
                            <div><MdLocationPin size={20} /></div>
                            <div className='ml-2 flex flex-col text-sm'>
                                <div className='w-full'>{prop.address}</div>
                                <div className='w-full'>{prop.city}{prop.state && `, ${prop.state}`}{prop.state && `, ${prop.zip_code}`}</div>
                            </div>
                        </div>

                        <div className='w-full font-semibold text-base mt-4 text-red-500'>
                            {prop.property_type} {prop.property_type == "Multi Unit Type" && <span className=' font- text-sky-600'>{`(Unit #${prop.unit_number})`}</span>}
                        </div>

                        <div className={`occupied-bar w-full mt-2 h-1 bg-gray-300 relative`}>
                            {
                                fully_occupied && <div className={`w-[100%] absolute rounded-r-full -top-[1px] h-[6px] bg-gradient-to-r 
                                    from-green-500 to-green-200 to-[80%]`}></div>
                            }

                            {
                                (!fully_occupied && prop.property_type == "Multi Unit Type") &&
                                <div className={`absolute rounded-r-full -top-[1px] h-[6px] bg-gradient-to-r 
                                    from-green-500 to-green-200 to-[80%]`} style={{ width: `${occupied_prcnt}%` }}></div>
                            }
                        </div>
                        <div className="w-full mt-1 text-gray-600 *:text-sm font-medium flex items-center justify-between uppercase">
                            {
                                list_type == "Main Lists" && <>
                                    <div>{vacant_text}</div>
                                    <div>{occupied_text}</div>
                                </>
                            }

                            {list_type == "Other Units" && <div className='mt-2'>{prop.status}</div>}
                        </div>
                    </div>
                </div>
            </CustomLink>
        </div>
    )
}

export default PropertyCard
