"use client";
import React, { useEffect, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { APIResponseProps } from './types';
import { Helpers } from '@/_lib/helpers';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { toast } from 'react-toastify';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { showPageLoader } from '@/app/(user-end)/(main-layout)/GlobalRedux/app/appSlice';
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { IoClose } from 'react-icons/io5';
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';

const helpers = new Helpers();
const SearchPageSearchBox = ({ payload, search_shown, handleMenuBox }: {
    payload: { [key: string]: any }, search_shown: boolean, handleMenuBox: (menu_key: string) => void,
}) => {

    const router = useRouter();
    const dispatch = useDispatch();
    const currentDate = new Date();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const whereBoxRef = useRef<HTMLDivElement>(null);
    const dateBoxRef = useRef<HTMLDivElement>(null);

    const { is1Xm, is2Xm, isXs, isSm, isMd, isTab } = useCurrentBreakpoint();
    let calendar_dir: "vertical" | "horizontal" | undefined = "horizontal";
    if (is1Xm || is2Xm || isXs || isSm || isMd) {
        calendar_dir = "vertical";
    }

    // Add 1 day to the current date
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);

    // Add 2 years to the current date
    const futureDate = new Date();
    futureDate.setFullYear(currentDate.getFullYear() + 2);

    // Set the month to December (month index 11 since months are 0-indexed in JavaScript)
    futureDate.setMonth(11);

    // Optionally, set the day to the first day of December
    futureDate.setDate(31);

    const moveInDate = new Date(payload.move_in);
    const moveOutDate = new Date(payload.move_out);

    const defaultRange = {
        startDate: moveInDate,
        endDate: moveOutDate,
        key: 'selection'
    }

    const [dates, setDates] = useState<any>([defaultRange]);

    const [move_in, setMoveIn] = useState(payload.move_in);
    const [move_out, setMoveOut] = useState(payload.move_out);
    const [property_city, setPropertyCity] = useState(payload.neighborhood);
    const [disabled_dates, setDisabledDates] = useState<string[]>([]);
    const [range_shown, setRangeShown] = useState(false);
    const [city_box_shown, setCityBoxShown] = useState(false);
    const [cities, setCities] = useState<string[]>([]);
    const [cities_loaded, setCitiesLoaded] = useState(false);
    const [cities_lists, setCitiesLists] = useState<string[]>([]);

    useEffect(() => {
        if (dates && dates.length) {

            toast.dismiss();
            const date_data = dates[0];
            console.log("date_data.startDate", date_data.startDate)
            if (date_data.startDate && date_data.startDate != "") {
                setMoveIn(moment(date_data.startDate?.toString()).format("MM/DD/YYYY"));
                if (date_data.startDate?.toString() == date_data.endDate?.toString()) {

                    const min_dates: string[] = [];
                    const currentDate = new Date(date_data.startDate);
                    for (let i = 1; i <= 30; i++) {
                        const date = new Date(currentDate);
                        date.setDate(currentDate.getDate() + i);
                        min_dates.push(moment(date).format("YYYY-MM-DD"));
                    }

                    setDisabledDates(min_dates);

                    setMoveOut("");
                } else {

                    const day_string = moment(date_data.endDate).format("YYYY-MM-DD");
                    if (disabled_dates.includes(day_string)) {

                        toast.error("Select minimum of 31 days", {
                            position: "top-center",
                            theme: "colored"
                        })

                    } else {
                        setMoveOut(moment(date_data.endDate?.toString()).format("MM/DD/YYYY"));
                    }

                }
            }

        } else {
            console.log("nod startDate")
        }
    }, [dates]);

    function customDayContent(day: Date) {
        let extraDot = null;
        const day_string = moment(day).format("YYYY-MM-DD");
        //console.log("day_string", day_string);
        if (disabled_dates.includes(day_string)) {
            extraDot = (
                <div className="customDayContent"
                    style={{
                        height: "36px",
                        width: "100%",
                        borderRadius: "0px",
                        background: "rgb(248, 248, 248)",
                        position: "absolute",
                        top: -5,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        zIndex: -10,
                        opacity: 1,
                    }}
                />
            )
        }
        return (
            <div className={`${extraDot && "! cursor-not-allowed"}`}>
                {extraDot}
                <span className={`${extraDot && "!text-red-500"}`}>{format(day, "d")}</span>
            </div>
        )
    }

    const showDateRange = () => {
        setRangeShown(true);
        setCityBoxShown(false);
    }

    const showCityBox = () => {
        setCityBoxShown(true);
        setRangeShown(false);
        fetchCities();
    }

    const fetchCities = async () => {
        if (!cities_loaded) {
            const propPromise: Promise<APIResponseProps> = helpers.LoadCities();
            const propResp = await propPromise;

            if (propResp.success) {
                const citiesData = propResp.data;
                setCities(citiesData);
                setCitiesLists(citiesData);
                setCitiesLoaded(true);
            }
        }
    }

    const searchCity = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const result = cities.filter((item) => item.toLowerCase().includes(val.toLowerCase()));
        setCitiesLists(result);
        setPropertyCity(val);
    }

    const setSelectedCity = (city: string) => {
        setPropertyCity(city);
        setCityBoxShown(false);
    }

    const searchProperties = () => {

        const lowercaseCities = cities.map(city => city.toLowerCase());

        toast.dismiss();
        if ((!property_city || !lowercaseCities.includes(property_city.toLowerCase())) && property_city.toLowerCase() != "all neighborhoods") {
            toast.error("Select a valid neighborhood from the list", {
                position: "top-center",
                theme: "colored"
            });
            return;
        }

        if ((!move_in || !move_out) || (move_in == move_out)) {
            toast.error("Select a valid date range", {
                position: "top-center",
                theme: "colored"
            });
            return;
        }

        const pf = { ...payload }

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
        handleMenuBox("search_shown"); //closes search box
        router.push(`search?neighborhood=${property_city}&search_by=${pf.search_by}&move_in=${moment(move_in).format("YYYY-MM-DD")}&move_out=${moment(move_out).format("YYYY-MM-DD")}&min_bed=${pf.min_bed}&max_bed=${pf.max_bed}&min_bath=${pf.min_bath}&max_bath=${pf.max_bath}&min_price=${pf.min_price}&max_price=${pf.max_price}&amenities=${JSON.stringify(amenities)}&equipments=${JSON.stringify(equipments)}&exterior_features=${JSON.stringify(exterior_features)}&interior_features=${JSON.stringify(interior_features)}&map_bounds=${JSON.stringify(pf.map_bounds)}&sort_by=${pf.sort_by}&mobile_view=${pf.mobile_view}&zoom=${pf.zoom}&version=${moment().unix() * 100}&page=1`);

        //console.log(`search?neighborhood=${property_city}&search_by=${pf.search_by}&move_in=${moment(move_in).format("YYYY-MM-DD")}&move_out=${moment(move_out).format("YYYY-MM-DD")}&min_bed=${pf.min_bed}&max_bed=${pf.max_bed}&min_bath=${pf.min_bath}max_bath=${pf.max_bath}&&min_price=${pf.min_price}&max_price=${pf.max_price}&amenities=${JSON.stringify(amenities)}&equipments=${JSON.stringify(equipments)}&exterior_features=${JSON.stringify(exterior_features)}&interior_features=${JSON.stringify(interior_features)}&map_bounds=${JSON.stringify(pf.map_bounds)}&sort_by=${pf.sort_by}&mobile_view=${pf.mobile_view}&zoom=${pf.zoom}&page=1`);

    }

    useEffect(() => {
        if (search_shown) {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [search_shown]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (whereBoxRef.current && !whereBoxRef.current.contains(e.target as Node)) {
                setCityBoxShown(false);
            }
            if (dateBoxRef.current && !dateBoxRef.current.contains(e.target as Node)) {
                setRangeShown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [whereBoxRef, dateBoxRef]);

    return (
        <div className="srch_page w-full bg-white relative h-full">
            <div className="w-full flex lg:hidden justify-between px-4 py-3 items-center">
                <IoClose size={25} onClick={() => handleMenuBox("search_shown")} />
                <span className="ml-2">Find your new home</span> <span></span>
            </div>

            <div className="w-full bg-white grid grid-cols-1 lg:grid-cols-4 relative-h-full">
                <div ref={whereBoxRef} className="flex flex-col py-3 px-3 rounded-l-lg h-[105px]">
                    <div className="font-medium text-gray-500">Where?</div>
                    <div className="">
                        <input type="text" name="property_city" value={property_city} autoComplete="off" className="w-full px-3 pl-0 py-3 h-[55px] outline-none focus:outline-none text-base placeholder:text-sm"
                            placeholder="Search for a city" ref={inputRef} onChange={searchCity} onFocus={() => { showCityBox() }} />
                        {
                            city_box_shown && <div className="absolute w-full left-0 top-[148px] lg:top-[99px] bg-white p-6 flex 
                            flex-col rounded-lg border border-gray-400 shadow-2xl lg:border-0 lg:shadow-none">
                                <h1 className="w-full font-semibod text-xl">Boston Neighborhoods</h1>
                                <div className='w-full h-[65dvh] lg:h-[300px] overflow-x-hidden overflow-y-auto
                                 xl:border-0'>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-5 *:cursor-pointer *:font-normal *:w-full *:px-3 *:py-4 
                                    *:border-b-2 *:border-transparent *:text-gray-700">
                                        {
                                            !cities_loaded &&
                                            <div className=" col-span-full w-full h-[200px] flex items-center justify-center">
                                                <AiOutlineLoading3Quarters size={25} className="animate-spin" />
                                            </div>
                                        }

                                        {
                                            cities_loaded && (
                                                <div className="hover:border-gray-500" onClick={() => setSelectedCity("All Neighborhoods")}>
                                                    {property_city == "All Neighborhoods"
                                                        ? <b>All Neighborhoods</b>
                                                        : <>All Neighborhoods</>
                                                    }
                                                </div>
                                            )
                                        }

                                        {
                                            cities_loaded && (
                                                cities_lists.map((city, index) => {
                                                    const raw_city = city;
                                                    if (property_city && property_city != "") {
                                                        city = city.replace(new RegExp(property_city, "i"), (match) => `<b>${match}</b>`);
                                                    }

                                                    return <div key={index} className="hover:border-gray-500" onClick={() => setSelectedCity(raw_city)}
                                                        dangerouslySetInnerHTML={{ __html: city }} />
                                                })
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        }

                    </div>
                </div>

                <div className="borderr border-x-00 border-gray400 flex flex-col py-3 px-3 h-[105px]">
                    <div className="font-medium text-gray-500">Move-in</div>
                    <div>
                        <input type="text" name="move_in" value={move_in} className="w-full px-3 pl-0 py-3 h-[55px] outline-none focus:outline-none text-base placeholder:text-sm"
                            placeholder="Select a date" onClick={() => { showDateRange() }} />
                    </div>
                </div>

                <div ref={dateBoxRef} className="borderr border-x-00 border-gray400 flex flex-col py-3 px-3 h-[105px]">
                    <div className="font-medium text-gray-500">Move-out</div>
                    <div className="right-0">
                        <input type="text" name="move_out" value={move_out} className="w-full px-3 pl-0 py-3 h-[55px] outline-none focus:outline-none text-base placeholder:text-sm"
                            autoComplete='off' placeholder="Select a date" onClick={() => { showDateRange() }} />

                        {range_shown && <DateRange
                            editableDateInputs={false} className="w-full z-50 right-[0%] absolute top-[50px] xl:top-[95px] 
                            border border-gray-400 lg:border-0 rounded-lg shadow-2xl lg:shadow-none"
                            onChange={(item) => setDates([item.selection])}
                            showPreview={false}
                            moveRangeOnFirstSelection={false}
                            ranges={dates}
                            months={2}
                            direction={calendar_dir}
                            maxDate={futureDate}
                            minDate={minDate}
                            //disabledDates={disabled_dates}
                            dayContentRenderer={customDayContent}
                        />
                        }

                    </div>
                </div>

                <div className="borderr border-l-00 border-gray400 flex flex-col py-3 px-3 rounded-r-lg h-[105px] justify-center">
                    <div className="flex items-center justify-center px-4 py-4 bg-secondary text-white hover:shadow-lg 
                    hover:shadow-gray-400 cursor-pointer rounded select-none" onClick={searchProperties}>
                        <BiSearch size={16} className='mr-1' /> <span>Search</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchPageSearchBox