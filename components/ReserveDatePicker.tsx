"use client";
import React, { useEffect, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { APIResponseProps } from './types';
import { Helpers } from '@/_lib/helpers';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';

const helpers = new Helpers();
const ReserveDatePicker = ({ payload, datepicker_shown, setDatepickerShown }: {
    payload: { [key: string]: any }, datepicker_shown: boolean, setDatepickerShown: React.Dispatch<React.SetStateAction<boolean>>,
}) => {

    const router = useRouter();
    const dispatch = useDispatch();
    const currentDate = new Date();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { is1Xm, is2Xm, isXs, isSm, isMd, isTab } = useCurrentBreakpoint();
    let calendar_dir: "vertical" | "horizontal" | undefined = "horizontal";
    if (is1Xm || is2Xm) {
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
    const [disabled_dates, setDisabledDates] = useState<string[]>([]);
    const [range_shown, setRangeShown] = useState(false);

    useEffect(() => {
        if (dates && dates.length) {

            toast.dismiss();
            const date_data = dates[0];

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
    }

    const applyChanges = () => {

        toast.dismiss();
        if (moment(moveOutDate).diff(moment(moveInDate)) < 31) {
            toast.error("Select a minimum of 31 days", {
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

        setDatepickerShown(false); //closes search box
        router.push(`/listings/${pf.property_id}/${pf.address}?move_in=${moment(move_in).format("YYYY-MM-DD")}&move_out=${moment(move_out).format("YYYY-MM-DD")}&pets=${pf.pets}&parkings=${pf.parkings}`, { scroll: false });

    }

    useEffect(() => {
        if (datepicker_shown) {
            if (inputRef.current) {
                inputRef.current.focus();
                showDateRange();
            }
        }
    }, [datepicker_shown]);

    return (
        <div className="srch_page w-full bg-white grid grid-cols-1 xs:grid-cols-3 relative xs:h-full">

            <div className="flex flex-col py-3 px-3 h-[105px]">
                <div className="font-medium text-gray-500">Move-in</div>
                <div className='border-b border-gray-300'>
                    <input type="text" name="move_in" value={move_in} className="w-full px-3 pl-0 py-3 h-[55px] outline-none focus:outline-none text-base placeholder:text-sm"
                        placeholder="Select a date" ref={inputRef} onClick={() => { showDateRange() }} />
                </div>
            </div>

            <div className=" flex flex-col py-3 px-3 h-[105px]">
                <div className="font-medium text-gray-500">Move-out</div>
                <div className="right-0 border-b border-gray-300">
                    <input type="text" name="move_out" value={move_out} className="w-full px-3 pl-0 py-3 h-[55px] outline-none focus:outline-none text-base placeholder:text-sm"
                        placeholder="Select a date" onClick={() => { showDateRange() }} />

                    {range_shown && <DateRange
                        editableDateInputs={false} className="w-full z-50 right-[0%] absolute top-[300px] xs:top-[95px] 
                        border-t-0 rounded-b-lg"
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
                    hover:shadow-gray-400 cursor-pointer rounded select-none" onClick={applyChanges}>
                    <span>Apply</span>
                </div>
            </div>

        </div>
    )
}

export default ReserveDatePicker