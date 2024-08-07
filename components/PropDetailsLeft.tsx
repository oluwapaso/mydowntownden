import React from 'react'
import { PropertyDetails } from './types'
import { MdLocationPin } from 'react-icons/md';
import { Helpers } from '@/_lib/helpers';

const helpers = new Helpers();
const PropertyDetailsLeft = ({ prop }: { prop: PropertyDetails }) => {

    const dflt_image = "/no-image-added.png";

    let occupied_text = "";
    let vacant_text = "";
    let fully_occupied = false;
    let occupied_prcnt = 0;
    let vacant = 0;

    if (prop.property_type == "Single Unit Type") {
        if (prop.status == "Occupied") {
            vacant_text = prop.status;
            fully_occupied = true;
        } else {
            vacant_text = prop.status;
            vacant = 1;
        }
    } else {
        vacant = prop.total_units - prop.units_occupied;
        if (prop.status == "Occupied") {
            occupied_text = prop.status;
            vacant_text = `0 vacant`;
            fully_occupied = true;
        } else {
            occupied_text = `${prop.units_occupied} occupied`;
            vacant_text = `${vacant} vacant`;
            if (prop.units_occupied > 0) {
                occupied_prcnt = Math.floor((prop.units_occupied / prop.total_units) * 100);
            }
        }
    }

    return (
        <div className='w-full flex flex-col'>
            <div id='default_dp' className={`h-[220px] !bg-cover !bg-center`} style={{ background: `url(${(prop.images && prop.images.length > 0) ? prop.images[0] : dflt_image})` }}></div>
            <div className='col-span-3 p-4 flex flex-col'>
                <div className='flex flex-col items-center text-white justify-center'>
                    <div className='font-semibold text-lg mb-3'>{prop.property_name}</div>
                    <div className='mb-1'><MdLocationPin size={20} /></div>
                    <div className='ml-2 flex flex-col text-sm'>
                        <div className='w-full mb-2 text-center'>{prop.address} {prop.neighborhood}</div>
                        <div className='w-full text-center'>{prop.city}{prop.state && `, ${prop.state}`}{prop.state && `, ${prop.zip_code}`}</div>
                    </div>
                </div>

                <div className='w-full font-semibold mt-4 bg-gray-500/50 text-white rounded-lg grid grid-cols-2 p-2 py-4
                    divide-x divide-gray-400'>
                    <div className='flex flex-col items-center justify-center'>
                        <div className='font-medium text-xl'>{prop.beds}</div>
                        <div className='font-normal'>Beds</div>
                    </div>

                    <div className='flex flex-col items-center justify-center'>
                        <div className='font-medium text-xl'>{prop.baths}</div>
                        <div className='font-normal'>Baths</div>
                    </div>
                </div>

                <div className='w-full font-semibold mt-4 bg-gray-500/50 text-white rounded-lg grid grid-cols-2 p-2 py-4 
                    divide-x divide-gray-400'>
                    <div className='flex flex-col items-center justify-center'>
                        <div className='font-medium text-xl'>{prop.total_units}</div>
                        <div className='font-normal'>Units</div>
                    </div>

                    <div className='flex flex-col items-center justify-center'>
                        <div className='font-medium text-xl'>{prop.unit_number}</div>
                        <div className='font-normal'>Unit #</div>
                    </div>
                </div>

                <div className='w-full font-semibold mt-4 bg-gray-500/50 text-white rounded-lg px-2 py-4 divide-x divide-gray-400'>
                    <div className='flex flex-col items-center justify-center'>
                        <div className='font-medium text-2xl'>{helpers.formatCurrency(prop.listprice)}</div>
                        <div className='font-normal'>List Price</div>
                    </div>
                </div>

                <div className='w-full flex justify-center text-xl font-medium mt-5 text-white px-2 pt-8 border-t border-gray-500'>
                    {prop.status}
                </div>
            </div>
        </div>
    )
}

export default PropertyDetailsLeft
