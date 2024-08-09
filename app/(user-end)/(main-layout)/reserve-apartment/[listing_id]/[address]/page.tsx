"use client"

import { Helpers } from '@/_lib/helpers';
import { useModal } from '@/app/contexts/ModalContext';
import SimpleHeader from '@/components/SimpleHeader';
import { APIResponseProps } from '@/components/types';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useParams, useSearchParams } from 'next/navigation';
import numeral from 'numeral';
import React, { useEffect, useRef, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { FaArrowLeftLong, FaArrowRightLong, FaAsterisk } from 'react-icons/fa6';
import { showPageLoader } from '../../../GlobalRedux/app/appSlice';
import { useDispatch } from 'react-redux';
import PropCarousel from '@/components/PropCarousel';
import Link from 'next/link';

const helper = new Helpers();
const ReserveApartment = () => {

    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const { handleLoginModal } = useModal();

    const property_id = params?.listing_id;
    const listing_address = params?.address;
    const move_in = searchParams?.get('move_in');
    const move_out = searchParams?.get('move_out');
    const pets = searchParams?.get('pets');
    const parkings = searchParams?.get('parkings');

    const { data: session, status } = useSession();
    const user = session?.user as any;

    const empty_form_data = {
        property_id: property_id,
        user_id: user?.user_id || 0,
        firstname: `${user?.firstname}` || "",
        lastname: `${user?.lastname}` || "",
        phone_number: user?.phone_1 || "",
        email: user?.email || "",
        guest_firstname: "",
        guest_lastname: "",
        guest_phone_number: "",
        guest_email: "",
        listing_address: listing_address,
        move_in: move_in,
        move_out: move_out,
        pets: pets,
        parkings: parkings,
    }

    const init_payload = {
        property_id: property_id,
        address: listing_address,
        move_in: move_in,
        move_out: move_out,
        pets: parseInt(pets as string) || 0,
        parkings: parseInt(parkings as string) || 0,
    }

    const [payload, setPayload] = useState<{ [key: string]: any }>(init_payload);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [formData, setFormData] = useState<any>(empty_form_data);
    const [isInfoLoaded, setIsInfoLoaded] = useState(false);
    const [prop, setProp] = useState<any>({});
    const [page_error, setPageError] = useState("");
    const [total_pet_fee, setTotalPetFee] = useState(0);
    const [total_parking_fee, setTotalParkingFee] = useState(0);
    const [sub_total_fee, setSubTotalFee] = useState(0);
    const [total_fee, setTotalFee] = useState(0);
    const [total_amount, setTotalAmount] = useState(0);
    const [monthly_rent, setMontlyRent] = useState(0);
    const [daily_rent, setDailyRent] = useState(0);
    const [stay_summary, setStaySummary] = useState("1 month");
    const [total_months, setTotalMonths] = useState(1);
    const [remaining_days, setRemainingDays] = useState(0);

    // Calculate the difference in days
    const diffInDays = moment(move_out).diff(moment(move_in), 'days');
    const [total_staying_days, setTotalStayingDays] = useState(diffInDays);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {

        if (!session?.user && status != "loading") {
            window.location.href = "/login";
        }

    }, [session, status]);

    useEffect(() => {
        if (property_id) {

            setIsLoadingInfo(true);
            setPageError("");

            fetch("/api/properties/load-single-property", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "property_id": property_id }),
            }).then((resp): Promise<APIResponseProps> => {
                setIsLoadingInfo(false);
                if (!resp.ok) {
                    setPageError(resp.statusText);
                }
                return resp.json();
            }).then(data => {

                if (data.success && data.data.property_id > 1) {

                    const propAddress = `${data.data.address}, ${data.data.city}, ${data.data.state} ${data.data.zip_code}`;
                    setProp(data.data);
                    setIsInfoLoaded(true);

                } else {
                    setPageError(data.data.message);
                }

            }).catch((e: any) => {
                setPageError(e.message);
            });

        }
    }, [property_id]);

    const divideDays = (days: number, divisor: number) => {
        const quotient = Math.floor(days / divisor);
        const remainder = days % divisor;
        return { quotient, remainder };
    }

    /** Build Payload **/
    useEffect(() => {

        let updatedPayload = { ...payload }; // Create a copy of the payload object
        if (searchParams?.size && searchParams?.size > 0) {
            searchParams?.forEach((val, key) => {
                if (key == "pets" || key == "parkings") {
                    updatedPayload[key] = parseInt(val);
                } else {
                    updatedPayload[key] = val;
                }
            })
        } else {
            updatedPayload = { ...init_payload }
        }

        setPayload(updatedPayload);

    }, [searchParams, searchParams?.size]);
    /** Build Payload **/

    const getPetFees = (payload: { [key: string]: any }) => {

        let _30DaysPetFee = 0;
        let oneTimePetFee = 0;

        if (prop.pets_allowed == "Yes") {
            _30DaysPetFee = parseFloat(prop.each_pets_fee_per_month) * parseFloat(payload.pets);
            oneTimePetFee = parseFloat(prop.one_time_pets_fee) * parseFloat(payload.pets);
        }

        return { _30DaysPetFee, oneTimePetFee };

    }

    const getParkingFees = (payload: { [key: string]: any }) => {

        let _30DaysParkingFee = 0;
        if (prop.parking_available != "No" && prop.parking_fee_required == "Yes") {
            _30DaysParkingFee = parseFloat(prop.parking_fee) * parseFloat(payload.parkings);
        }

        return _30DaysParkingFee;

    }

    useEffect(() => {

        if (isInfoLoaded) {
            const diffInDays = moment(payload.move_out).diff(moment(payload.move_in), 'days');
            setTotalStayingDays(diffInDays);
            const { quotient, remainder } = divideDays(diffInDays, 31);
            setTotalMonths(quotient);
            setRemainingDays(remainder);
            setStaySummary(`${quotient} month${quotient > 1 ? "s" : ""} ${remainder > 0 ? `& ${remainder} day${remainder > 1 ? "s" : ""}` : ""}`)

            const { _30DaysPetFee, oneTimePetFee } = getPetFees(payload);
            const _30DaysParkingFees = getParkingFees(payload);
            const monthlySubTotal = parseFloat(prop.listprice) + parseFloat(prop.utilities_per_month) + _30DaysPetFee + _30DaysParkingFees;
            const totalFee = parseFloat(prop.service_fee) + parseFloat(prop.cleaning_and_stocking_fee) + parseFloat(prop.insurance_fee) + oneTimePetFee;

            const allMonthRent = monthlySubTotal * quotient;
            const dailySubTotal = monthlySubTotal / 30;
            const remainderAmount = dailySubTotal * remainder;

            setTotalPetFee(_30DaysPetFee);
            setTotalParkingFee(_30DaysParkingFees);
            setSubTotalFee(monthlySubTotal);
            setTotalFee(totalFee);
            setMontlyRent(allMonthRent);
            setDailyRent(remainderAmount);

            const totalAmount = allMonthRent + remainderAmount + totalFee;
            setTotalAmount(totalAmount);

        }

    }, [payload, isInfoLoaded]);

    const BackToApartment = () => {

        toast.dismiss();
        if (!user || !user.user_id) {
            toast.error("You need to login to reserve this property", {
                position: "top-center",
                theme: "colored"
            });

            handleLoginModal();
            return false;
        }

        dispatch(showPageLoader());
        const pf = { ...payload };
        router.push(`/listings/${pf.property_id}/${pf.address}?move_in=${pf.move_in}&move_out=${pf.move_out}&pets=${pf.pets}&parkings=${pf.parkings}`);

    }

    const [bookingValue, setSelectedBooking] = useState("personal");
    const handleBookingChange = (event: any) => {
        setSelectedBooking(event.target.id);
    };

    const [occupantValue, setOccupentValue] = useState("yes");
    const handleOccupantChange = (event: any) => {
        setOccupentValue(event.target.id);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev_val: any) => {
            return {
                ...prev_val,
                [event.target.name]: event.target.value,
            }
        })
    };

    useEffect(() => {

        setFormData((prev_val: any) => {
            return {
                ...prev_val,
                email: user?.email,
            }
        })

    }, [user?.email]);

    const BookApartment = () => {

        toast.dismiss();
        if (!formData.firstname || !formData.lastname || !formData.phone_number) {
            toast.error("All fields are required.", {
                position: "top-center",
                theme: "colored"
            });
            return;
        }

        if (!helper.validateEmail(formData.email)) {
            toast.error("Provide a valid email address.", {
                position: "top-center",
                theme: "colored"
            });
            return;
        }

        if (occupantValue === "no") {
            if (!formData.guest_firstname || !formData.guest_lastname || !formData.guest_phone_number) {
                toast.error("Provide valid guest information.", {
                    position: "top-center",
                    theme: "colored"
                });
                return
            }

            if (!helper.validateEmail(formData.guest_email)) {
                toast.error("Provide a valid guest email address.", {
                    position: "top-center",
                    theme: "colored"
                });
                return
            }
        }

        const form_data = {
            ...formData,
            booking_type: bookingValue,
            occupant_type: occupantValue,
            sub_total_fee: numeral(sub_total_fee).format("$0,0.00"),
            total_amount: numeral(total_amount).format("$0,0.00"),
            stay_summary: stay_summary,
        }

        setIsSubmitting(true);
        fetch("/api/users/bookings/manage-bookings", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form_data),
        }).then((resp): Promise<APIResponseProps> => {
            setIsSubmitting(false);
            return resp.json();
        }).then(data => {

            if (data.success) {

                toast.success("Booking request successfully sent, we will get back to you as soon as possible.", {
                    position: "top-center",
                    theme: "colored"
                });

                setFormData((prev_val: any) => {
                    return {
                        ...prev_val,
                        firstname: "",
                        lastname: "",
                    }
                });

            } else {

                toast.error(data.message, { //"Unable to send your request, please try again later " + 
                    position: "top-center",
                    theme: "colored"
                });

                console.log(data.message)

            }

        });

    };

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <SimpleHeader page="Property Details" />
            {
                isLoadingInfo && <>
                    <div className='w-full bg-white flex items-center justify-center h-[300px]'>
                        <AiOutlineLoading3Quarters size={30} className='animate-spin' />
                    </div>
                </>
            }

            {(!isLoadingInfo && isInfoLoaded) && (
                <>

                    <div className='w-full py-10'>
                        <div className='container m-auto max-w-[650px] lg:max-w-[1250px] px-3 xl:px-0'>
                            <div className='w-full grid grid-cols-1 lg:grid-cols-5 gap-20'>

                                <div className='lg:col-span-3'>
                                    <div className='w-full flex items-center text-sky-700 cursor-pointer' onClick={BackToApartment}>
                                        <FaArrowLeftLong size={20} className='mr-2' /> <span>Back to apartment</span>
                                    </div>

                                    <div className='w-full flex flex-col mt-4'>
                                        <div className='w-full font-medium text-3xl'>Provide booking & contact details</div>

                                        <div className='w-full font-medium text-lg mt-10'>Is this booking for personal or business travel?</div>
                                        <div className='w-full space-y-2 mt-2'>
                                            <div className="block min-h-[1.5rem] pl-[1.5rem]">
                                                <input className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                                                    type="radio" name="booking_type" id="personal"
                                                    onChange={handleBookingChange}
                                                    checked={bookingValue === "personal"} />
                                                <label className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer" htmlFor="personal">
                                                    Personal
                                                </label>
                                            </div>

                                            <div className="block min-h-[1.5rem] pl-[1.5rem]">
                                                <input className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                                                    type="radio" name="booking_type" id="business"
                                                    onChange={handleBookingChange}
                                                    checked={bookingValue === "business"} />
                                                <label className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer" htmlFor="business" >
                                                    Business
                                                </label>
                                            </div>
                                        </div>


                                        <div className='w-full font-medium text-lg mt-10'>Will you be staying in the apartment?</div>
                                        <div className='w-full space-y-2 mt-2'>
                                            <div className="block min-h-[1.5rem] pl-[1.5rem]">
                                                <input className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                                                    type="radio" name="occupant_type" id="yes"
                                                    onChange={handleOccupantChange}
                                                    checked={occupantValue === "yes"} />
                                                <label className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer" htmlFor="yes">
                                                    Yes
                                                </label>
                                            </div>

                                            <div className="block min-h-[1.5rem] pl-[1.5rem]">
                                                <input className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                                                    type="radio" name="occupant_type" id="no"
                                                    onChange={handleOccupantChange}
                                                    checked={occupantValue === "no"} />
                                                <label className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer" htmlFor="no" >
                                                    No, I'm booking for someone else
                                                </label>
                                            </div>
                                        </div>

                                        <div className='w-full font-medium text-2xl mt-10'>Your details</div>
                                        {occupantValue === "no" &&
                                            <div className='w-full font-normal text-base mt-2'>We'll use your details to send you
                                                booking and payment information.</div>}

                                        <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col 
                                            rounded-md mt-3`}>
                                            <div className='w-full flex items-center text-sm'>
                                                <span>Your first name</span> <FaAsterisk className='text-red-600 ml-1' size={12} />
                                            </div>
                                            <div className='w-full'>
                                                <input type="text" name="firstname" value={formData.firstname}
                                                    className='w-full h-11 font-normal text-lg pl-1 outline-none placeholder:font-light 
                                                    placeholder:text-base appearance-none' placeholder="Enter your first name"
                                                    onChange={(e) => { handleChange(e) }} />
                                            </div>
                                        </div>


                                        <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col 
                                            rounded-md mt-8`}>
                                            <div className='w-full flex items-center text-sm'>
                                                <span>Your lastname</span> <FaAsterisk className='text-red-600 ml-1' size={12} />
                                            </div>
                                            <div className='w-full'>
                                                <input type="text" name="lastname" value={formData.lastname}
                                                    className='w-full h-11 font-normal text-lg pl-1 outline-none placeholder:font-light 
                                                    placeholder:text-base appearance-none' placeholder="Enter your lastname"
                                                    onChange={(e) => { handleChange(e) }} />
                                            </div>
                                        </div>


                                        <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col 
                                            rounded-md mt-8 opacity-45 cursor-not-allowed`}>
                                            <div className='w-full flex items-center text-sm'>
                                                <span>Your email</span> <FaAsterisk className='text-red-600 ml-1' size={12} />
                                            </div>
                                            <div className='w-full'>
                                                <input type="email" name="email" value={formData.email}
                                                    className='w-full h-11 font-normal text-lg pl-1 outline-none placeholder:font-light 
                                                    placeholder:text-base appearance-none' placeholder="email" disabled />
                                            </div>
                                        </div>


                                        <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col 
                                            rounded-md mt-8`}>
                                            <div className='w-full flex items-center text-sm'>
                                                <span>Phone number</span> <FaAsterisk className='text-red-600 ml-1' size={12} />
                                            </div>
                                            <div className='w-full'>
                                                <input type="text" name="phone_number" value={formData.phone_number}
                                                    className='w-full h-11 font-normal text-lg pl-1 outline-none placeholder:font-light 
                                                    placeholder:text-base appearance-none' placeholder="Enter your phone number"
                                                    onChange={(e) => { handleChange(e) }} />
                                            </div>
                                        </div>

                                        {occupantValue === "no" && (
                                            <>
                                                <div className='w-full font-medium text-2xl mt-10'>Guest details</div>
                                                <div className='w-full font-normal text-base mt-2'>We'll use the guest's details to
                                                    send them information about booking details, payments, cleaning and maintenance
                                                    requests, and feedback.
                                                </div>


                                                <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex 
                                                flex-col rounded-md mt-3`}>
                                                    <div className='w-full flex items-center text-sm'>
                                                        <span>Guest first name</span> <FaAsterisk className='text-red-600 ml-1' size={12} />
                                                    </div>
                                                    <div className='w-full'>
                                                        <input type="text" name="guest_firstname" value={formData.guest_firstname}
                                                            className='w-full h-11 font-normal text-lg pl-1 outline-none 
                                                            placeholder:font-light  placeholder:text-base appearance-none'
                                                            placeholder="Enter guest first name" onChange={(e) => { handleChange(e) }} />
                                                    </div>
                                                </div>


                                                <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col 
                                                    rounded-md mt-8`}>
                                                    <div className='w-full flex items-center text-sm'>
                                                        <span>Guest lastname</span> <FaAsterisk className='text-red-600 ml-1' size={12} />
                                                    </div>
                                                    <div className='w-full'>
                                                        <input type="text" name="guest_lastname" value={formData.guest_lastname}
                                                            className='w-full h-11 font-normal text-lg pl-1 outline-none 
                                                            placeholder:font-light placeholder:text-base appearance-none'
                                                            placeholder="Enter guest lastname" onChange={(e) => { handleChange(e) }} />
                                                    </div>
                                                </div>


                                                <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col 
                                                    rounded-md mt-8`}>
                                                    <div className='w-full flex items-center text-sm'>
                                                        <span>Guest email</span> <FaAsterisk className='text-red-600 ml-1' size={12} />
                                                    </div>
                                                    <div className='w-full'>
                                                        <input type="email" name="guest_email" value={formData.guest_email}
                                                            className='w-full h-11 font-normal text-lg pl-1 outline-none 
                                                            placeholder:font-light placeholder:text-base appearance-none'
                                                            placeholder="Enter guest email" onChange={(e) => { handleChange(e) }} />
                                                    </div>
                                                </div>


                                                <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col 
                                                    rounded-md mt-8`}>
                                                    <div className='w-full flex items-center text-sm'>
                                                        <span>Guest phone number</span> <FaAsterisk className='text-red-600 ml-1' size={12} />
                                                    </div>
                                                    <div className='w-full'>
                                                        <input type="text" name="guest_phone_number" value={formData.guest_phone_number}
                                                            className='w-full h-11 font-normal text-lg pl-1 outline-none 
                                                            placeholder:font-light placeholder:text-base appearance-none'
                                                            placeholder="Enter your phone number" onChange={(e) => { handleChange(e) }} />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className='w-full mt-4'>
                                            <span>
                                                By booking, I agree to the <Link href={`/terms`} target="_blank" className='text-sky-700 underline'>Terms and Conditions</Link>, and understand that
                                                the booking is not finalized until the background check is complete.</span>
                                        </div>

                                        <div className='w-full mt-4 flex'>

                                            {!isSubmitting
                                                ? <div className='px-20 py-3 bg-sky-700 text-white rounded-full hover:bg-sky-600 
                                                hover:shadow-2xl cursor-pointer' onClick={BookApartment}>Book</div>
                                                : <div className='px-20 py-3 bg-sky-700/70 cursor-not-allowed text-white rounded-full
                                                flex items-center justify-center'>
                                                    <AiOutlineLoading3Quarters size={13} className="mr-2 animate-spin" /> <span>Pease wait...</span>
                                                </div>
                                            }

                                        </div>
                                    </div>
                                </div>

                                <div className='lg:col-span-2'>
                                    <div className='w-full relative h-full mx-auto max-w-[650px] lg:max-w-[100%]'>

                                        <div className='w-full p-6 bg-white rounded-2xl drop-shadow-xl border border-gray-300 lg:sticky lg:top-4 lg:z-[2]'>

                                            <div className='w-full flex flex-col space-y-2'>

                                                <div className='w-full relative h-[300px]'>
                                                    <PropCarousel key={prop.property_id} images={prop.images} defaultpic={prop.DefaultPic}
                                                        listing_id={prop.property_id} address={listing_address as string} page={`Reserve`} />
                                                </div>

                                                <div className='w-full flex items-center'>
                                                    <div className='font-normal'>MLS #:</div>
                                                    <div className='font-normal'>{prop.mls_number}</div>
                                                </div>

                                                <div className='w-full font-semibold'>
                                                    {prop.address}, {prop.city}, {prop.state} {prop.zip_code}
                                                </div>

                                                <div className='w-full flex-grow flex flex-col border-b border-gray-200 pb-3'>
                                                    <span className=' text-sm'>{stay_summary}</span>
                                                    <span className=' text-base flex items-center space-x-4 mt-1'>
                                                        <span>{moment(move_in).format("DD MMM YYYY")}</span>
                                                        <span><FaArrowRightLong size={16} /></span>
                                                        <span>{moment(move_out).format("DD MMM YYYY")}</span>
                                                    </span>
                                                </div>

                                                <div className='w-full flex items-center justify-between'>
                                                    <div className='text- font-normal'>Rent per month</div>
                                                    <div className='font-normal'>{numeral(prop.listprice).format("$0,0.00")}</div>
                                                </div>

                                                <div className='w-full flex items-center justify-between'>
                                                    <div className='text-l font-normal flex items-center'>
                                                        <span>Utilities per month</span>
                                                        <span className='cursor-pointer group ml-1 relative'>
                                                            <FaRegQuestionCircle size={15} />
                                                            <div className='hidden absolute left-1/2 transform -translate-x-1/2 
                                                            bottom-full mb-1 group-hover:block w-[250px] bg-gray-700 rounded-md 
                                                            text-white px-2 py-2 text-sm font-normal'>
                                                                {prop.utilities_includes}
                                                            </div>
                                                        </span>
                                                    </div>
                                                    <div className='font-normal'>{numeral(prop.utilities_per_month).format("$0,0.00")}</div>
                                                </div>

                                                {total_pet_fee > 0 &&
                                                    <div className='w-full flex items-center justify-between'>
                                                        <div className='text-l font-normal flex items-center'>
                                                            <span>Pets per month</span>
                                                        </div>
                                                        <div className='font-normal'>{numeral(total_pet_fee).format("$0,0.00")}</div>
                                                    </div>
                                                }

                                                {total_parking_fee > 0 &&
                                                    <div className='w-full flex items-center justify-between'>
                                                        <div className='text-l font-normal flex items-center'>
                                                            <span>Parking per month</span>
                                                        </div>
                                                        <div className='font-normal'>{numeral(total_parking_fee).format("$0,0.00")}</div>
                                                    </div>
                                                }

                                                <div className='w-full flex items-center justify-between'>
                                                    <div className='text-lg font-medium flex items-center'>
                                                        <span>Monthly subtotal</span>
                                                        {daily_rent > 0 &&
                                                            <span className='cursor-pointer group ml-1 relative'>
                                                                <FaRegQuestionCircle size={15} />
                                                                <div className='hidden absolute left-1/2 transform -translate-x-1/2 
                                                                bottom-full mb-1 group-hover:block w-[250px] bg-gray-700 rounded-md 
                                                                text-white px-2 py-2 text-sm font-normal '>
                                                                    For your stay ({stay_summary}) the subtotal
                                                                    equals {numeral(sub_total_fee).format("$0,0.00")} per month for
                                                                    the first {total_months} month{total_months > 1 && "s"} and {numeral(daily_rent).format("$0,0.00")} for
                                                                    the last {remaining_days} day{remaining_days > 1 && "s"}
                                                                </div>
                                                            </span>
                                                        }
                                                    </div>
                                                    <div className='font-normal'>{numeral(sub_total_fee).format("$0,0.00")}</div>
                                                </div>

                                                <div className='w-full flex items-center justify-between border-t border-b border-gray-100'>
                                                    <div className='text-l font-normal flex items-center py-3'>
                                                        <span>Fees & insurance</span>
                                                        <span className='cursor-pointer group ml-1 relative'>
                                                            <FaRegQuestionCircle size={15} />
                                                            <div className='hidden absolute left-1/2 transform -translate-x-1/2 
                                                            bottom-full mb-1 group-hover:block w-[250px] bg-gray-700 rounded-md 
                                                            text-white px-2 py-2 text-sm font-normal '>


                                                                <div className="flex flex-col w-full *:flex *:justify-between *:items-center space-y-2 font-normal">
                                                                    <div className="">
                                                                        <span>Service fee</span>
                                                                        <span className='font-medium'>{numeral(prop.service_fee).format("$0,0.00")}</span>
                                                                    </div>
                                                                    <div className="">
                                                                        <span>Exit cleaning &amp; initial stocking fee (supplies, linens, towels)</span>
                                                                        <span className='font-medium'>{numeral(prop.cleaning_and_stocking_fee).format("$0,0.00")}</span>
                                                                    </div>
                                                                    <div className="">
                                                                        <span>Insurance (TLL)</span>
                                                                        <span className='font-medium'>{numeral(prop.insurance_fee).format("$0,0.00")}</span>
                                                                    </div>
                                                                    {total_pet_fee > 0 &&
                                                                        <div className="">
                                                                            <span>Pet fee</span>
                                                                            <span className='font-medium'>{numeral(total_pet_fee).format("$0,0.00")}</span>
                                                                        </div>
                                                                    }
                                                                    <div className="border-t border-gray-500"></div>
                                                                    <div className="font-semibold">
                                                                        <span>Total</span>
                                                                        <span className='font-medium'>{numeral(total_fee).format("$0,0.00")}</span>
                                                                    </div>
                                                                </div>


                                                            </div>
                                                        </span>
                                                    </div>
                                                    <div className='font-normal'>{numeral(total_fee).format("$0,0.00")}</div>
                                                </div>

                                                <div className='w-full flex items-center justify-between'>
                                                    <div className='text-lg font-semibold flex items-center'>
                                                        <span>Total</span>
                                                    </div>
                                                    <div className='font-semibold'>{numeral(total_amount).format("$0,0.00")}</div>
                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                </>
            )}
        </main>
    )
}

export default ReserveApartment