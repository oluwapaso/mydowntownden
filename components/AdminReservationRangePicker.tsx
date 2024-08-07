"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Helpers } from '@/_lib/helpers';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

const helpers = new Helpers();
const AdminReservationRangePicker = ({ payload, datepicker_shown, setDatepickerShown, date_type }: {
    payload: { [key: string]: any }, datepicker_shown: boolean, setDatepickerShown: React.Dispatch<React.SetStateAction<boolean>>,
    date_type: string
}) => {

    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Add 1 day to the current date
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);

    const fromDate = new Date(payload.from_date || null);
    const toDate = new Date(payload.to_date || null);

    const defaultRange = {
        startDate: fromDate,
        endDate: toDate,
        key: 'selection'
    }

    const [dates, setDates] = useState<any>([defaultRange]);

    const [from_date, setFromDate] = useState(payload.from_date);
    const [to_date, setToDate] = useState(payload.to_date);
    const [range_shown, setRangeShown] = useState(false);

    const showDateRange = () => {
        setRangeShown(true);
    }

    useEffect(() => {
        if (dates && dates.length) {

            console.log("dates", dates)
            const date_data = dates[0];

            if (date_data.startDate && date_data.startDate != "") {
                setFromDate(moment(date_data.startDate?.toString()).format("MM/DD/YYYY"));
            }

            if (date_data.endDate && date_data.endDate != "") {
                setToDate(moment(date_data.endDate?.toString()).format("MM/DD/YYYY"));
            }

        }
    }, [dates]);

    const applyChanges = () => {

        if (from_date && to_date && (from_date == to_date)) {
            toast.error("Select a valid date range", {
                position: "top-center",
                theme: "colored"
            });
            return;
        }

        const pf = { ...payload }
        setDatepickerShown(false); //closes search box
        router.push(`reservations?keyword=${pf.keyword}&date_type=${date_type}&from_date=${moment(from_date).format("YYYY-MM-DD")}&to_date=${moment(to_date).format("YYYY-MM-DD")}&page=1`, { scroll: false });

    }

    useEffect(() => {
        if (datepicker_shown) {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [datepicker_shown]);

    useEffect(() => {
        setRangeShown(true);
    }, []);

    return (
        <div className="srch_page w-full bg-white grid grid-cols-3 relative h-full">

            <div className="borderr border-x-00 border-gray400 flex flex-col py-3 px-3 h-[105px]">
                <div className="font-medium text-gray-500">From date</div>
                <div className='border-b border-gray-300'>
                    <input type="text" name="from_date" value={from_date} className="w-full px-3 pl-0 py-3 h-[55px] outline-none focus:outline-none text-base placeholder:text-sm"
                        placeholder="Select a date" autoComplete='off' ref={inputRef} onClick={() => { showDateRange() }} />
                </div>
            </div>

            <div className="borderr border-x-00 border-gray400 flex flex-col py-3 px-3 h-[105px]">
                <div className="font-medium text-gray-500">To date</div>
                <div className="right-0 border-b border-gray-300">
                    <input type="text" name="to_date" value={to_date} className="w-full px-3 pl-0 py-3 h-[55px] outline-none focus:outline-none text-base placeholder:text-sm"
                        placeholder="Select a date" autoComplete='off' onClick={() => { showDateRange() }} />

                    {range_shown && <DateRange
                        editableDateInputs={false} className="w-full z-50 right-[0%] absolute top-[95px] borderr border-gray400 
                        border-t-0 rounded-b-lg"
                        onChange={(item) => setDates([item.selection])}
                        showPreview={false}
                        moveRangeOnFirstSelection={false}
                        ranges={dates}
                        months={2}
                        direction="horizontal"
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

export default AdminReservationRangePicker