"use client"
import React, { useEffect, useState } from 'react'
import { APIResponseProps, PropertyLists } from './types';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Helpers } from '@/_lib/helpers';
import PropertyCard from './PropertyCard';

const helpers = new Helpers();
const OtherUnits = ({ mls_number, property_id }: { mls_number: string, property_id: number }) => {

    const [properties, setProperties] = useState<PropertyLists[]>([]);
    const [prop_fetched, setPropFetched] = useState(false);

    const payload = {
        mls_number: mls_number,
        property_id: property_id,
        type: "Other Units",
    }

    useEffect(() => {

        const fetchUnits = async () => {
            const propPromise: Promise<APIResponseProps> = helpers.LoadProperties(payload);
            const propResp = await propPromise;

            if (propResp.success) {
                const propertyData = propResp.data;
                if (propertyData && propertyData.length) {
                    setProperties(propertyData);
                }
            }

            setPropFetched(true);
        }

        fetchUnits();

    }, []);

    return (
        <div className='w-full grid grid-cols-1 gap-6 mt-2'>
            {/* Loader */}
            {!prop_fetched && <div className=' col-span-full h-[150px] bg-white flex items-center justify-center'>
                <AiOutlineLoading3Quarters size={30} className='animate animate-spin' />
            </div>}

            {/* Rows */}
            {
                prop_fetched && (
                    (properties.length && properties.length > 0)
                        ? (properties.map((property) => {
                            return (<PropertyCard key={property.property_id} prop={property} list_type="Other Units" />)
                        }))
                        : <div className='col-span-full h-[250px] bg-white flex items-center justify-center'>
                            No other units found on property.
                        </div>)
            }
        </div>
    )
}

export default OtherUnits
