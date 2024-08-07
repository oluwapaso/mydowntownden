"use client"

import { Beds_Baths } from '@/_lib/data'
import React, { useEffect, useState } from 'react'
import FilterDropdown from './FilterDropdown'
import { MdClose } from 'react-icons/md'
import { Helpers } from '@/_lib/helpers'
import FilterPriceInput from './FilterPriceInput'
import AccordionComponent from './AccordionComponent'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/app/(user-end)/(main-layout)/GlobalRedux/store'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { APIResponseProps } from './types'
import { useRouter } from 'next/navigation'
import { showPageLoader } from '@/app/(user-end)/(main-layout)/GlobalRedux/app/appSlice'
import moment from 'moment'

const helpers = new Helpers()
const FilterBox = ({ payload, handleMenuBox, filters_shown }: {
    payload: { [key: string]: any }, handleMenuBox: (menu_key: string) => void, filters_shown: boolean
}) => {

    const router = useRouter();
    const dispatch = useDispatch();
    const [payload_filters, setPayloadFilters] = useState(payload); //{ ...payload }
    const comp_info = useSelector((state: RootState) => state.app);
    const equipmentLists = comp_info.equipments;
    const amenitiesLists = comp_info.amenities;
    const interiorFeaturesLists = comp_info.interior_features;
    const exteriorFeaturesLists = comp_info.exterior_features;
    const [filter_equipments, setFilterEquipments] = useState<string[]>([]);
    const [filter_amenities, setFilterAmenities] = useState<string[]>([]);
    const [filter_int_features, setFilterIntFeatures] = useState<string[]>([]);
    const [filter_ext_features, setFilterExtFeatures] = useState<string[]>([]);
    const [filter_counts, setFilterCounts] = useState(0);
    const [is_counting, setIsCounting] = useState(false);
    const [abortController, setAbortController] = useState(new AbortController());

    const [filters, setFilters] = useState({
        max_beds: Beds_Baths,
        min_beds: Beds_Baths,
        max_baths: Beds_Baths,
        min_baths: Beds_Baths,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>) => {
        setPayloadFilters((prev_val) => {
            return {
                ...prev_val,
                [e.target.name]: e.target.value,
            }
        });
    }

    const setMinMaxBeds = (bed_start: string, type: string) => {
        const bedStart = parseInt(bed_start)

        if (type == "Max") {

            if (bedStart > 0) {
                const max_bed = Beds_Baths.filter((bed) => {
                    return bed.value >= bedStart
                })
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        max_beds: max_bed,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        max_beds: Beds_Baths,
                    }
                });
            }

        } else if (type == "Min") {

            if (bedStart > 0) {
                const min_bed = Beds_Baths.filter((bed) => {
                    return bed.value <= bedStart
                })
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        min_beds: min_bed,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        min_beds: Beds_Baths,
                    }
                });
            }


        }
    }

    const setMinMaxBath = (bath_start: string, type: string) => {
        const bathStart = parseInt(bath_start)

        if (type == "Max") {

            if (bathStart > 0) {
                const max_bath = Beds_Baths.filter((bath) => {
                    return bath.value >= bathStart
                });
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        max_baths: max_bath,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        max_baths: Beds_Baths,
                    }
                });
            }

        } else if (type == "Min") {

            if (bathStart > 0) {
                const min_bath = Beds_Baths.filter((bath) => {
                    return bath.value <= bathStart
                })
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        min_baths: min_bath,
                    }
                });
            } else {
                setFilters((prev_val) => {
                    return {
                        ...prev_val,
                        min_baths: Beds_Baths,
                    }
                });
            }

        }
    }

    const setMinMaxPrice = (price_start: string, type: string) => {
        let priceStart = helpers.formatDecimal(price_start) || "0"

        const formattedPrice = parseFloat(priceStart)
        if (type == "Max") {

            let compare_price = helpers.formatDecimal(payload_filters.max_price.toString())
            const comparePrice = parseFloat(compare_price)

            if (formattedPrice > 0) {
                if (formattedPrice > comparePrice) {
                    setPayloadFilters((prev_val) => {
                        const prevVal = { ...prev_val }
                        return {
                            ...prevVal,
                            min_price: formattedPrice,
                            max_price: formattedPrice + 500,
                        }
                    });
                }

            } else {
                setPayloadFilters((prev_val) => {
                    const prevVal = { ...prev_val }
                    return {
                        ...prevVal,
                        min_price: 0,
                        //max_price: 50000,
                    }
                });
            }

        } else if (type == "Min") {

            if (formattedPrice > 0) {

                let compare_price = helpers.formatDecimal(payload_filters.min_price.toString())
                const comparePrice = parseFloat(compare_price)

                if (formattedPrice < comparePrice) {
                    setPayloadFilters((prev_val) => {
                        const prevVal = { ...prev_val }
                        return {
                            ...prevVal,
                            min_price: formattedPrice,
                            max_price: formattedPrice,
                        }
                    });
                }

            } else {
                setPayloadFilters((prev_val) => {
                    const prevVal = { ...prev_val }
                    return {
                        ...prevVal,
                        min_price: 0,
                        max_price: formattedPrice,
                    }
                });
            }

        }
    }

    const togglePill = (feature: string, setCheckedPillsFn: React.Dispatch<React.SetStateAction<string[]>>) => {
        setCheckedPillsFn((prevCheckedPills) =>
            prevCheckedPills.includes(feature)
                ? prevCheckedPills.filter((item) => item !== feature)
                : [...prevCheckedPills, feature]
        );
    };

    const equipmentPills = () => {
        const features = equipmentLists.map((feature: any, index: any) => {
            return <div key={index} className={`hover:shadow-xl hover:shadow-gray-300 ${filter_equipments.includes(feature)
                ? 'bg-green-500 text-white border-green-500'
                : 'text-black border-gray-600'}`} onClick={() => togglePill(feature, setFilterEquipments)}>{feature}</div>
        })

        if (Array.isArray(equipmentLists)) {
            return <div className={`grid grid-cols-3 gap-x-3 gap-y-6 px-4 py-6 *:rounded-full *:border *:border-primary *:px-6 *:py-2
            *:cursor-pointer *:flex *:items-center *:justify-center *:text-sm`}>{features}</div>
        }
    }

    const amenitiesPills = () => {
        const features = amenitiesLists.map((feature: any, index: any) => {
            return <div key={index} className={`hover:shadow-xl hover:shadow-gray-300 ${filter_amenities.includes(feature)
                ? 'bg-green-500 text-white border-green-500'
                : 'text-black border-gray-600'}`} onClick={() => togglePill(feature, setFilterAmenities)}>{feature}</div>
        })

        if (Array.isArray(amenitiesLists)) {
            return <div className={`grid grid-cols-3 gap-x-3 gap-y-6 px-4 py-6 *:rounded-full *:border *:border-primary *:px-6 *:py-2
            *:cursor-pointer *:flex *:items-center *:justify-center *:text-sm`}>{features}</div>
        }
    }

    const intFtrsPills = () => {
        const features = interiorFeaturesLists.map((feature: any, index: any) => {
            return <div key={index} className={`hover:shadow-xl hover:shadow-gray-300 ${filter_int_features.includes(feature)
                ? 'bg-green-500 text-white border-green-500'
                : 'text-black border-gray-600'}`} onClick={() => togglePill(feature, setFilterIntFeatures)}>{feature}</div>
        })

        if (Array.isArray(interiorFeaturesLists)) {
            return <div className={`grid grid-cols-3 gap-x-3 gap-y-6 px-4 py-6 *:rounded-full *:border *:border-primary *:px-6 *:py-2
            *:cursor-pointer *:flex *:items-center *:justify-center *:text-sm`}>{features}</div>
        }
    }

    const extFtrsPills = () => {
        const features = exteriorFeaturesLists.map((feature: any, index: any) => {
            return <div key={index} className={`hover:shadow-xl hover:shadow-gray-300 ${filter_ext_features.includes(feature)
                ? 'bg-green-500 text-white border-green-500'
                : 'text-black border-gray-600'}`} onClick={() => togglePill(feature, setFilterExtFeatures)}>{feature}</div>
        })

        if (Array.isArray(exteriorFeaturesLists)) {
            return <div className={`grid grid-cols-3 gap-x-3 gap-y-6 px-4 py-6 *:rounded-full *:border *:border-primary *:px-6 *:py-2
            *:cursor-pointer *:flex *:items-center *:justify-center *:text-sm`}>{features}</div>
        }
    }

    useEffect(() => {

        setPayloadFilters((prev_val) => {
            let newFilters = { ...prev_val };

            if (filter_equipments) {
                newFilters.equipments = filter_equipments;
            } else {
                delete newFilters.equipments;
            }

            if (filter_amenities) {
                newFilters.amenities = filter_amenities;
            } else {
                delete newFilters.amenities;
            }

            if (filter_int_features) {
                newFilters.interior_features = filter_int_features;
            } else {
                delete newFilters.interior_features;
            }

            if (filter_ext_features) {
                newFilters.exterior_features = filter_ext_features;
            } else {
                delete newFilters.exterior_features;
            }

            return newFilters;
        });

    }, [filter_equipments, filter_amenities, filter_int_features, filter_ext_features])

    const selectedItems = (items: string[]) => {

        if (items.length > 0) {
            return <span className='text-sky-600 font-medium text-sm'>{items.length} Item{items.length > 1 && "s"} Selected</span>
        } else {
            return <></>
        }

    }

    useEffect(() => {
        if (filters_shown) {

            setIsCounting(true)

            // Create a new AbortController for each effect
            const controller = new AbortController();
            setAbortController(controller);

            try {
                // Cancel previous API request
                if (abortController) {
                    abortController.abort();
                }
            } catch (e: any) {
                console.log(e)
            }

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            fetch(`${apiBaseUrl}/api/admin/properties/quick-property-count`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload_filters)
            }).then((resp): Promise<APIResponseProps> => {
                setIsCounting(false)
                if (!resp.ok) {
                    throw new Error("Unable to count properties.")
                }

                return resp.json();
            }).then(data => {

                if (data.success) {
                    setFilterCounts(data.data.total_filters);
                    setIsCounting(false);
                } else {
                    console.log("data.message", data.message)
                }
            })

        }
    }, [payload_filters, filters_shown])

    const ClearAll = () => {

        setFilterEquipments([]);
        setFilterAmenities([]);
        setFilterIntFeatures([]);
        setFilterExtFeatures([]);

        setPayloadFilters((prev_val) => {
            return {
                ...prev_val,
                min_price: 1500,
                max_price: 10000,
                min_bed: 0,
                max_bed: 0,
                min_bath: 0,
                max_bath: 0,
                amenities: [],
                equipments: [],
                exterior_features: [],
                interior_features: [],
            }
        });
    }

    const showApartments = () => {

        const pf = { ...payload_filters }

        let amenities = [];
        let equipments = [];
        let interior_features = [];
        let exterior_features = [];

        if (Array.isArray(pf.amenities)) {
            amenities = pf.amenities;
        }

        if (Array.isArray(pf.equipments)) {
            equipments = pf.equipments;
        }

        if (Array.isArray(pf.interior_features)) {
            interior_features = pf.interior_features;
        }

        if (Array.isArray(pf.exterior_features)) {
            exterior_features = pf.exterior_features;
        }

        dispatch(showPageLoader());
        handleMenuBox("filters_shown"); //closes filters
        router.push(`search?neighborhood=${pf.neighborhood}&search_by=${pf.search_by}&move_in=${pf.move_in}&move_out=${pf.move_out}&min_bed=${pf.min_bed}&max_bed=${pf.max_bed}&min_bath=${pf.min_bath}&max_bath=${pf.max_bath}&min_price=${pf.min_price}&max_price=${pf.max_price}&amenities=${JSON.stringify(amenities)}&equipments=${JSON.stringify(equipments)}&exterior_features=${JSON.stringify(exterior_features)}&interior_features=${JSON.stringify(interior_features)}&map_bounds=${JSON.stringify(pf.map_bounds)}&sort_by=${pf.sort_by}&mobile_view=${pf.mobile_view}&zoom=${pf.zoom}&version=${moment().unix() * 100}&page=1`);

        //console.log(`search?neighborhood=${pf.neighborhood}&search_by=${pf.search_by}&move_in=${pf.move_in}&move_out=${pf.move_out}&min_bed=${pf.min_bed}&max_bed=${pf.max_bed}&min_bath=${pf.min_bath}max_bath=${pf.max_bath}&&min_price=${pf.min_price}&max_price=${pf.max_price}&amenities=${JSON.stringify(amenities)}&equipments=${JSON.stringify(equipments)}&exterior_features=${JSON.stringify(exterior_features)}&interior_features=${JSON.stringify(interior_features)}&map_bounds=${JSON.stringify(pf.map_bounds)}&sort_by=${pf.sort_by}&mobile_view=${pf.mobile_view}&zoom=${pf.zoom}&page=1`);
    }

    useEffect(() => {
        setPayloadFilters(payload)
    }, [payload])
    return (
        <div className="w-full bg-white flex flex-col h-full relative">
            <div className=' flex justify-between items-center pb-4 border-b border-gray-400 p-4'>
                <div onClick={() => handleMenuBox("filters_shown")}><MdClose size={25} className='cursor-pointer' /></div>
                <div>Filters</div>
                <div className='cursor-pointer px-6 py-2 bg-gray-50 border border-gray-400 hover:shadow-xl
                 rounded-[30px] text-sm' onClick={ClearAll}>Clear All</div>
            </div>

            <div className='p-4 flex flex-col overflow-x-hidden overflow-y-auto'>
                <div className='w-full'>
                    <div className='w-full'>Beds</div>
                    <div className='w-full'>
                        <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center'>
                            <div className=''>
                                <FilterDropdown label='Minimum' name='min_bed' value={payload_filters.min_bed} options={filters.min_beds}
                                    onChange={(e) => {
                                        handleFilterChange(e);
                                        setMinMaxBeds(e.target.value, "Max");
                                    }} />
                            </div>
                            <div className='px-4'>
                                <label className='w-full text-white hidden xl:block'>-</label>
                                <div>-</div>
                            </div>
                            <div className=''>
                                <FilterDropdown label='Maximum' name='max_bed' value={payload_filters.max_bed} options={filters.max_beds}
                                    onChange={(e) => {
                                        handleFilterChange(e);
                                        setMinMaxBeds(e.target.value, "Min");
                                    }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='w-full mt-5'>
                    <div className='w-full'>Baths</div>
                    <div className='w-full'>
                        <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center'>
                            <div className=''>
                                <FilterDropdown label='Minimum' name='min_bath' value={payload_filters.min_bath} options={filters.min_baths}
                                    onChange={(e) => {
                                        handleFilterChange(e);
                                        setMinMaxBath(e.target.value, "Max");
                                    }} />
                            </div>
                            <div className='px-4'>
                                <label className='w-full text-white hidden xl:block'>-</label>
                                <div>-</div>
                            </div>
                            <div className=''>
                                <FilterDropdown label='Maximum' name='max_bath' value={payload_filters.max_bath} options={filters.max_baths}
                                    onChange={(e) => {
                                        handleFilterChange(e);
                                        setMinMaxBath(e.target.value, "Min");
                                    }} />
                            </div>
                        </div>
                    </div>
                </div>


                <div className='w-full mt-5'>
                    <div className='w-full'>Price</div>
                    <div className='w-full'>
                        <div className='range-fieldsets grid grid-cols-[1fr_max-content_1fr] items-center'>
                            <div className=''>
                                <FilterPriceInput label='Minimum' name='min_price' value={helpers.formatCurrency(payload_filters.min_price.toString())}
                                    onChange={(e) => { handleFilterChange(e); }} onBlur={(e) => { setMinMaxPrice(e.target.value, "Max"); }} />
                            </div>
                            <div className='px-4'>
                                <label className='w-full text-white hidden xl:block'>-</label>
                                <div>-</div>
                            </div>
                            <div className=''>
                                <FilterPriceInput label='Maximum' name='max_price' value={helpers.formatCurrency(payload_filters.max_price.toString())}
                                    onChange={(e) => { handleFilterChange(e); }} onBlur={(e) => { setMinMaxPrice(e.target.value, "Min"); }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='w-full mt-5'>
                    {(Array.isArray(equipmentLists)) && (
                        <AccordionComponent title='Equipments' selectedItems={() => selectedItems(filter_equipments)}
                            children={equipmentPills()} />
                    )}
                </div>

                <div className='w-full mt-5'>
                    {(Array.isArray(amenitiesLists)) && (
                        <AccordionComponent title={`Amenities`} selectedItems={() => selectedItems(filter_amenities)}
                            children={amenitiesPills()} />
                    )}
                </div>

                <div className='w-full mt-5'>
                    {(Array.isArray(interiorFeaturesLists)) && (
                        <AccordionComponent title={`Interior Features`} selectedItems={() => selectedItems(filter_int_features)}
                            children={intFtrsPills()} />
                    )}
                </div>

                <div className='w-full mt-5'>
                    {(Array.isArray(exteriorFeaturesLists)) && (
                        <AccordionComponent title={`Exterior Features`} selectedItems={() => selectedItems(filter_ext_features)}
                            children={extFtrsPills()} />
                    )}
                </div>

            </div>

            <div className=' flex justify-between items-center pb-4 border-t border-gray-400 p-4'>
                <div className='cursor-pointer px-6 py-3 bg-gray-50 border border-gray-400 hover:shadow-xl
                 rounded-[30px] text-sm' onClick={ClearAll}>Clear All</div>

                {!is_counting
                    ? <div className='cursor-pointer px-6 py-3 bg-sky-700 border border-sky-700 hover:shadow-xl
                    rounded-[30px] text-sm text-white' onClick={showApartments}>Show {filter_counts} Apartment{filter_counts > 1 && "s"}</div>
                    : <div className='cursor-not-allowed px-6 py-3 bg-primary/50 border border-primary/50
                    rounded-[30px] text-sm text-white flex items-center justify-center'>
                        <AiOutlineLoading3Quarters size={16} className='animate-spin mr-2' /> <span>Please wait</span>
                    </div>}
            </div>
        </div>
    )
}

export default FilterBox
