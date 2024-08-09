"use client"

import { grayMapStyle } from '@/_lib/data';
import { Helpers } from '@/_lib/helpers';
import { useModal } from '@/app/contexts/ModalContext';
import Gallery from '@/components/Gallery';
import PropFavs from '@/components/PropFavs';
import PropFeatures from '@/components/PropFeatures';
import SimpleHeader from '@/components/SimpleHeader';
import { APIResponseProps } from '@/components/types';
import { GoogleMap, OverlayView } from '@react-google-maps/api';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import numeral from 'numeral';
import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiLock } from 'react-icons/bi';
import { BsBuildings } from 'react-icons/bs';
import { FaArrowLeftLong, FaArrowRightLong, FaLinkedin, FaSquareFacebook, FaWhatsapp } from 'react-icons/fa6';
import { GiIsland } from 'react-icons/gi';
import { IoConstructOutline } from 'react-icons/io5';
import { LiaBathSolid } from 'react-icons/lia';
import { LuBedDouble, LuClock8, LuParkingCircle, LuParkingCircleOff, LuReceipt } from 'react-icons/lu';
import { MdOutlineKeyboardArrowDown, MdOutlineMarkEmailUnread, MdOutlinePhotoLibrary, MdPets } from 'react-icons/md';
import { TbCalendarDollar, TbCalendarOff } from 'react-icons/tb';
import {
    EmailShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    WhatsappShareButton,
} from "react-share";
import { BsTwitterX } from 'react-icons/bs'
import { GrPrint } from 'react-icons/gr';
import { FaRegQuestionCircle } from 'react-icons/fa';
import ParkingBox from '@/components/ParkingBox';
import PetsBox from '@/components/PetsBox';
import ReserveDatePicker from '@/components/ReserveDatePicker';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { showPageLoader } from '../../../GlobalRedux/app/appSlice';
import { useDispatch } from 'react-redux';
import useCurrentBreakpoint from '@/_hooks/useMediaQuery';

const helper = new Helpers();
const PropertyDetails = () => {

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

    const { data: session } = useSession();
    const user = session?.user as any;
    const share_title = `Look at what i found on ${process.env.NEXT_PUBLIC_COMPANY_NAME}'s website`;

    interface Place {
        geometry: {
            location: {
                lat: () => number;
                lng: () => number;
            };
        };
        name: string;
        [key: string]: any; // Add any additional properties if needed
    }


    const [places, setPlaces] = useState<Place[]>([]);
    const mapRef = useRef<google.maps.Map | null>(null);

    const containerStyle = {
        width: '100%',
        height: '100%',
    };

    const center = {
        lat: 42.3360525,
        lng: -71.0169759,
    };

    const categories = [
        { label: 'Parking lots', type: 'parking', icon: '/map-icon-parking.svg' },
        { label: 'Supermarkets', type: 'supermarket', icon: '/map-icon-supermarket.svg' },
        { label: 'Cafes', type: 'cafe', icon: '/map-icon-cafe.svg' },
        { label: 'Restaurant', type: 'restaurant', icon: '/map-icon-restaurant.svg' },
        { label: 'Schools/Universities', type: 'school', icon: '/map-icon-school.svg' },
        { label: 'Bars', type: 'bar', icon: '/map-icon-bar.svg' },
        { label: 'Gyms', type: 'gym', icon: '/map-icon-gym.svg' },
        { label: 'Mall', type: 'shopping_mall', icon: '/map-icon-shop.svg' },
        { label: 'Hair care', type: 'hair_care', icon: '/map-icon-barber.svg' },
        { label: 'Park', type: 'park', icon: '/map-icon-park.svg' },
        { label: 'Attraction', type: 'tourist_attraction', icon: '/map-icon-tourist-attraction.svg' },
        { label: 'Hospitals', type: 'hospital', icon: '/map-icon-hospital.svg' },
    ];

    const mapOptions = {
        fullscreenControl: true,
        mapTypeControl: false, // Remove other controls if needed
        streetViewControl: true,
        zoomControl: true,
        styles: grayMapStyle,
    };

    const empty_form_data = {
        user_id: user?.user_id || 0,
        fullname: `${user?.firstname} ${user?.lastname}`,
        phone_number: user?.phone_1,
        email: user?.email,
        prefer_date: "ASAP",
        exact_date: "Select a Day",
        notes: "",
        prop_url: window.location.href,
        mailer: "Nodemailer",
        message_type: "Showing Request"
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
    const [mapCenter, setMapCenter] = useState(center);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [is_api_loaded, setAPILoaded] = useState(false);
    const [google_map_key, setGoogleMapKey] = useState("");
    const [formData, setFormData] = useState(empty_form_data);
    const [showModal, setShowModal] = useState(false);
    const [page_url, setPageURL] = useState("");
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isInfoLoaded, setIsInfoLoaded] = useState(false);
    const [prop, setProp] = useState<any>({});
    const [page_error, setPageError] = useState("");
    const [gallery, setGallery] = useState<React.JSX.Element>(<div className='col-span-2 bg-white flex items-center justify-center h-full'><AiOutlineLoading3Quarters size={30} className='animate-spin' /></div>);
    const [showGallery, setShowGallery] = useState(false);
    const [initialSlide, setInitialSlide] = useState(0);
    const [activeDivId, setActiveDivId] = useState<string | null>(null);
    const [current_type, setCurrentType] = useState("");
    const [places_loading, setPlacesLoading] = useState(false);
    const [total_pet_fee, setTotalPetFee] = useState(0);
    const [total_parking_fee, setTotalParkingFee] = useState(0);
    const [sub_total_fee, setSubTotalFee] = useState(0);
    const [total_fee, setTotalFee] = useState(0);
    const [total_amount, setTotalAmount] = useState(0);
    const [monthly_rent, setMontlyRent] = useState(0);
    const [daily_rent, setDailyRent] = useState(0);
    const datepickerBoxRef = useRef<HTMLDivElement>(null);
    const [datepicker_shown, setDatepickerShown] = useState(false);
    const [stay_summary, setStaySummary] = useState("1 month");
    const [total_months, setTotalMonths] = useState(1);
    const [remaining_days, setRemainingDays] = useState(0);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
    const [isAvailable, setIsAvailable] = useState(false);

    // Calculate the difference in days
    const diffInDays = moment(move_out).diff(moment(move_in), 'days');
    const [total_staying_days, setTotalStayingDays] = useState(diffInDays);

    const closeModal = () => {
        setShowModal(false);
    }

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
                    setMapCenter((prev) => {
                        return {
                            lat: parseFloat(data.data.latitude),
                            lng: parseFloat(data.data.longitude),
                        }
                    });

                    setFormData(prev => {
                        return {
                            ...prev,
                            notes: `I'd like to request a showing of ${propAddress} (MLS® #${data.data.mls_number}). Thank you!`,
                        }
                    });

                } else {
                    setPageError(data.data.message);
                }

            }).catch((e: any) => {
                setPageError(e.message);
            });

        }
    }, [property_id]);

    useEffect(() => {

        setPageURL(`${window.location.href}`);
        const Get_API_Info = async () => {
            const api_info_prms = helper.FetchAPIInfo();
            const api_info = await api_info_prms;
            if (api_info.success && api_info.data) {
                setGoogleMapKey(api_info.data.google_map_key);
                setAPILoaded(true);
            } else {
                throw new Error('Google map API key not found in database');
            }
        }

        Get_API_Info();

    }, []);

    useEffect(() => {

        const handleScroll = () => {
            const windscroll = window.scrollY || document.documentElement.scrollTop;
            document.querySelectorAll('.section').forEach(function (section, i) {
                let id = section.id;

                // The number at the end of the next line is how many pixels from the top you want it to activate.
                if (section instanceof HTMLElement) {
                    var sectionTop = section.offsetTop - 105;
                    if (sectionTop <= windscroll) {
                        const all_actives = document.querySelector('.section.active')
                        all_actives?.classList.remove('active');
                        document.querySelectorAll('.section')[i].classList.add('active');
                        setActiveDivId(id);
                    }
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

    }, [user]);

    const handleButtonClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 105;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    useEffect(() => {

        if (isInfoLoaded) {

            let gallery = <></>
            if (prop.images && prop.images.length > 0) {

                if (prop.images.length == 1) {
                    gallery = <div className='w-full grid grid-cols-1 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)} style={{ backgroundImage: `url(${prop.images[0]})`, backgroundPosition: "center", }}></div>
                        <PropFavs ListingId={prop.property_id} page='Prop Details' MLSNumber={prop.mls_number} PropAddress={prop.address} />
                    </div>
                } else if (prop.images.length == 2) {

                    gallery = <div className='w-full grid grid-cols-2 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full col-span-2 md:col-span-1 bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)} style={{ backgroundImage: `url(${prop.images[0]})`, backgroundPosition: "center", }}></div>
                        <div className='h-full relative cursor-pointer'>
                            <div className={`h-full grid grid-cols-1`}>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(1)} style={{ backgroundImage: `url(${prop.images[1]})`, backgroundPosition: "center", }}></div>
                            </div>
                        </div>
                        <PropFavs ListingId={prop.property_id} page='Prop Details' MLSNumber={prop.mls_number} PropAddress={prop.address} />
                    </div>

                } else if (prop.images.length == 3) {

                    gallery = <div className='w-full grid grid-cols-2 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full col-span-2 md:col-span-1 bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)} style={{ backgroundImage: `url(${prop.images[0]})`, backgroundPosition: "center", }}></div>
                        <div className='h-full relative cursor-pointer'>
                            <div className={`h-full grid grid-cols-1 gap-[2px]`}>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(1)} style={{ backgroundImage: `url(${prop.images[1]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(2)} style={{ backgroundImage: `url(${prop.images[2]})`, backgroundPosition: "center", }}></div>
                            </div>
                        </div>
                        <PropFavs ListingId={prop.property_id} page='Prop Details' MLSNumber={prop.mls_number} PropAddress={prop.address} />
                    </div>

                } else if (prop.images.length == 4) {

                    gallery = <div className='w-full grid grid-cols-2 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full col-span-2 md:col-span-1 bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)} style={{ backgroundImage: `url(${prop.images[0]})`, backgroundPosition: "center", }}></div>
                        <div className='h-full relative cursor-pointer'>
                            <div className={`h-full w-full grid grid-cols-2 gap-[2px]`}>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(1)} style={{ backgroundImage: `url(${prop.images[1]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(2)} style={{ backgroundImage: `url(${prop.images[2]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain col-span-2' onClick={() => OpenGallery(3)} style={{ backgroundImage: `url(${prop.images[3]})`, backgroundPosition: "center", }}></div>
                            </div>
                        </div>
                        <PropFavs ListingId={prop.property_id} page='Prop Details' MLSNumber={prop.mls_number} PropAddress={prop.address} />
                    </div>

                } else {

                    gallery = <div className='w-full grid grid-cols-2 gap-[2px] h-[70vh] relative overflow-hidden'>
                        <div className='h-full col-span-2 md:col-span-1 bg-cover object-contain cursor-pointer' onClick={() => OpenGallery(0)}
                            style={{ backgroundImage: `url(${prop.images[0]})`, backgroundPosition: "center", }}></div>
                        <div className='hidden md:flex md:col-span-1 h-full cursor-pointer'>
                            <div className={`h-full w-full grid grid-cols-2 gap-[2px]`}>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(1)} style={{ backgroundImage: `url(${prop.images[1]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(2)} style={{ backgroundImage: `url(${prop.images[2]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(3)} style={{ backgroundImage: `url(${prop.images[3]})`, backgroundPosition: "center", }}></div>
                                <div className='bg-cover object-contain' onClick={() => OpenGallery(4)} style={{ backgroundImage: `url(${prop.images[4]})`, backgroundPosition: "center", }}></div>
                            </div>
                        </div>

                        <div className='w-[200px] absolute left-2 bottom-2 bg-white py-3 px-4 flex justify-center items-center 
                                rounded-md cursor-pointer border border-gray-100 shadow-md hover:drop-shadow-lg' onClick={() => OpenGallery(0)}>
                            <MdOutlinePhotoLibrary size={22} className='mr-1' /> <span>See all {prop.images.length} photos</span>
                        </div>

                        <PropFavs ListingId={prop.property_id} page='Prop Details' MLSNumber={prop.mls_number} PropAddress={prop.address} />
                    </div>

                }

            } else {

                gallery = <div className='w-full grid grid-cols-1 gap-[2px] h-[70vh] relative overflow-hidden'>
                    <div className='h-full bg-cover object-contain cursor-pointer'
                        style={{ backgroundImage: `url(/no-image-added.png)`, backgroundPosition: "center", }}>
                    </div>

                    <PropFavs ListingId={prop.property_id} page='Prop Details' MLSNumber={prop.mls_number} PropAddress={prop.address} />
                </div>
            }

            setGallery(gallery);
        }

    }, [isInfoLoaded]);

    const OpenGallery = (index: number) => {
        setInitialSlide(index);
        setShowGallery(true);
        document.body.style.overflowY = 'hidden';
    }

    const closeGallery = () => {
        document.body.style.overflowY = 'auto';
        setShowGallery(false);
    }

    const handleInfo = (type: string) => {

    }

    const divideDays = (days: number, divisor: number) => {
        const quotient = Math.floor(days / divisor);
        const remainder = days % divisor;
        return { quotient, remainder };
    }

    useEffect(() => {
        if (!isMapLoaded && is_api_loaded) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${google_map_key}&libraries=places`;
            script.async = true;
            script.onload = () => setIsMapLoaded(true);
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [isMapLoaded, is_api_loaded]);

    const handleMapLoad = (map: google.maps.Map) => {
        mapRef.current = map;
    };

    const handleCategoryClick = useCallback((type: string) => {

        setCurrentType(type);
        setPlacesLoading(true);
        if (!mapRef.current) return;

        const service = new window.google.maps.places.PlacesService(mapRef.current);
        const request = {
            location: mapCenter,
            radius: 5000, // Adjust radius as needed
            type: type,
        };

        service.nearbySearch(
            request,
            (results, status) => {
                setPlacesLoading(false);
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    setPlaces(results as Place[]);
                }
            }
        );
    }, [mapCenter, mapRef, setCurrentType, setPlacesLoading, setPlaces]);

    const [translateX, setTranslateX] = useState(0);
    const [totalWidth, setTotalWidth] = useState(0);
    const containerRef: RefObject<HTMLDivElement> = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setTotalWidth(containerRef.current.scrollWidth);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [categories]);

    const handleScrollLeft = () => {
        setTranslateX(prev => Math.min(prev + 300, 5)); // Adjust 200 to the amount you want to scroll
    };

    const handleScrollRight = () => {
        const elem = document.getElementById("can_translate_cont") as HTMLDivElement;
        if (elem) {
            const maxScroll = -1 * (totalWidth - (elem.clientWidth - 5));
            setTranslateX(prev => Math.max(prev - 300, maxScroll));
        }
    };

    useEffect(() => {

        const handleClickOutside = (e: MouseEvent) => {
            if (datepickerBoxRef.current && !datepickerBoxRef.current.contains(e.target as Node)) {
                setDatepickerShown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [datepickerBoxRef]);

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

    useEffect(() => {

        if (isInfoLoaded) {

            setIsCheckingAvailability(true);
            setIsAvailable(false);

            fetch("/api/admin/reservations/check-availability", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "property_id": property_id,
                    "move_in": payload.move_in,
                    "move_out": payload.move_out
                }),
            }).then((resp): Promise<APIResponseProps> => {
                setIsCheckingAvailability(false);
                if (!resp.ok) {
                    setPageError(resp.statusText);
                }
                return resp.json();
            }).then(data => {
                console.log("data", data);
                if (data.success) {
                    if (data.data.reservations_found > 0) {
                        setIsAvailable(false);
                    } else {
                        setIsAvailable(true);
                    }
                } else {
                    setIsAvailable(false);
                }
            })
        }

    }, [payload.move_in, payload.move_out, isInfoLoaded]);

    const ReserveApartment = () => {

        toast.dismiss();
        if (!user || !user.user_id) {
            toast.error("You need to login to reserve this property", {
                position: "top-center",
                theme: "colored"
            });

            handleLoginModal();
            return false;
        }

        dispatch(showPageLoader())
        const pf = { ...payload }
        router.push(`/reserve-apartment/${pf.property_id}/${pf.address}?move_in=${pf.move_in}&move_out=${pf.move_out}&pets=${pf.pets}&parkings=${pf.parkings}`);

    }

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
                    {gallery}

                    <div className='sticky top-0 z-20 shadow bg-white w-full border-b border-t border-gray-300'>
                        <div className='container m-auto max-w-[1200px] px-3 xl:px-0 overflow-y-hidden overflow-x-auto'>
                            <div className='w-full min-w-[1050px] md:min-w-[full] grid grid-cols-2 gap-y-3'>

                                <div className='grid grid-cols-[max-content]'>
                                    <div className='w-full flex items-center *:capitalize *:py-6 space-x-8 *:cursor-pointer *:border-b-2 *:border-transparent'>
                                        <div className={`hover:border-gray-900 ${activeDivId == "about" ? "!border-gray-900" : null}`}
                                            onClick={() => handleButtonClick('about')}>Overview</div>
                                        <div className={`hover:border-gray-900 ${activeDivId == "features" ? "!border-gray-900" : null}`}
                                            onClick={() => handleButtonClick('features')}>Features</div>
                                        <div className={`hover:border-gray-900 ${activeDivId == "amenities" ? "!border-gray-900" : null}`}
                                            onClick={() => handleButtonClick('amenities')}>Amenities</div>
                                        {(prop.pets_allowed == "Yes" || prop.parking_available != "No") &&
                                            <div className={`hover:border-gray-900 ${activeDivId == "add_ons" ? "!border-gray-900" : null}`}
                                                onClick={() => handleButtonClick('add_ons')}>Add-ons</div>
                                        }
                                        <div className={`hover:border-gray-900 ${activeDivId == "things_to_know" ? "!border-gray-900" : null}`}
                                            onClick={() => handleButtonClick('things_to_know')}>Things to Know</div>
                                        <div className={`hover:border-gray-900 ${activeDivId == "neighborhood" ? "!border-gray-900" : null}`}
                                            onClick={() => handleButtonClick('neighborhood')}>The Neighborhood</div>
                                        <div className={`hover:border-gray-900 ${activeDivId == "request_info" ? "!border-gray-900" : null}`}
                                            onClick={() => OpenGallery(0)}>Gallery</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='w-full py-10'>
                        <div className='container m-auto max-w-[1260px] px-3 xl:px-0'>
                            <div className='w-full grid grid-cols-1 lg:grid-cols-6 gap-8'>

                                <div className='lg:col-span-4'>

                                    <div className="section w-full" id='about'>

                                        <h1 className='w-full text-3xl md:text-4xl'>About {prop.property_name}</h1>
                                        <h1 className='w-full text-xl'>{prop.address} {prop.neighborhood}, {prop.city}, {prop.state}</h1>

                                        <div className='w-full grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 *:rounded'>
                                            <div className='py-4 px-4 bg-gray-100 flex items-center'>
                                                <BsBuildings size={25} className='mr-2' />
                                                <span> {prop.property_type != "Single Unit Type" ? "Single Unit" : "Multi Unit"}</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-100 flex items-center'>
                                                <LuBedDouble size={25} className='mr-2' /> <span>Beds {numeral(prop.beds).format("0,0")}</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-100 flex items-center'>
                                                <LiaBathSolid size={25} className='mr-2' />  <span>Baths {numeral(prop.baths).format("0,0")}</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-100 flex items-center'>
                                                <IoConstructOutline size={25} className='mr-2' />  <span>Built in {prop.year}</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-100 flex items-center'>
                                                <GiIsland size={25} className='mr-2' />
                                                <span>{prop.size_sqft ? numeral(prop.size_sqft).format("0,0") : "--"} sqft</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-100 flex items-center'>
                                                <TbCalendarDollar size={25} className='mr-2' />
                                                <span>Rent {numeral(prop.listprice).format("$0,0")}/mo</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-100 flex items-center'>
                                                {prop.pets_allowed == "Yes"
                                                    ? <MdPets size={25} className='mr-2' />
                                                    : <div className='mr-2'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512">
                                                            <path d="M210.61 116c21.56 0 39.04 26.79 39.04 59.83s-17.48 59.83-39.04 59.83-39.04-26.79-39.04-59.83S189.05 116 210.61 116zm49.63 144.83c45.71.1 51.39 30.37 89.94 82.21 19.2 37.71-5.74 61.49-48.49 51.3-19.38-9.88-33.04-13.38-46.72-12.9-23.7.84-29.68 16.47-57.27 15.36-21.29-.58-30.85-9.49-32.72-23.08-1.98-14.44 3.58-23.57 10.36-35.52 26.36-46.48 53.63-83.18 84.89-77.37h.01zm-125.04-56.1c-16.12 6.37-21.26 31.56-11.49 56.26 9.77 24.7 30.75 39.55 46.86 33.17 16.12-6.36 21.26-31.56 11.49-56.25-9.76-24.7-30.75-39.56-46.86-33.18zm241.6 0c16.11 6.37 21.26 31.56 11.49 56.26-9.77 24.7-30.76 39.55-46.87 33.17-16.11-6.36-21.26-31.56-11.49-56.25 9.77-24.7 30.76-39.56 46.87-33.18zm-76.11-89.59c21.55 0 39.04 26.8 39.04 59.83 0 33.04-17.49 59.83-39.04 59.83-21.56 0-39.04-26.79-39.04-59.83s17.48-59.83 39.04-59.83z" />
                                                            <path fill="#D92D27" fill-rule="nonzero" d="M256 0c34.61 0 67.67 6.9 97.86 19.41 31.4 13 59.6 32.01 83.16 55.57a256.57 256.57 0 0 1 55.57 83.16C505.1 188.34 512 221.39 512 256s-6.91 67.66-19.41 97.86a256.57 256.57 0 0 1-55.57 83.16 256.463 256.463 0 0 1-83.16 55.57C323.67 505.1 290.61 512 256 512s-67.66-6.9-97.86-19.41a256.463 256.463 0 0 1-83.16-55.57 256.41 256.41 0 0 1-55.57-83.16C6.9 323.66 0 290.61 0 256s6.9-67.67 19.41-97.86c13.01-31.4 32.01-59.6 55.57-83.16a256.304 256.304 0 0 1 83.16-55.57C188.33 6.9 221.39 0 256 0zm167.68 137.2L137.2 423.67c15.54 11.04 32.65 19.96 50.92 26.35 21.19 7.41 44.03 11.44 67.88 11.44 27.89 0 54.44-5.53 78.61-15.54 25.07-10.38 47.69-25.66 66.67-44.64 18.99-18.99 34.26-41.6 44.65-66.68 10.01-24.16 15.53-50.71 15.53-78.61h.04c0-23.76-4.04-46.61-11.48-67.87-6.39-18.27-15.31-35.38-26.34-50.92zM99.84 389.57 389.57 99.84c-16.99-14.55-36.35-26.37-57.42-34.78-23.48-9.37-49.17-14.52-76.15-14.52-27.9 0-54.45 5.52-78.61 15.53-25.08 10.39-47.69 25.66-66.68 44.64-18.98 18.99-34.25 41.6-44.64 66.68-10 24.16-15.53 50.71-15.53 78.61 0 26.97 5.15 52.67 14.53 76.15 8.4 21.06 20.22 40.43 34.77 57.42z" />
                                                        </svg>
                                                    </div>
                                                }

                                                <span>{prop.pets_allowed == "Yes" ? `Pets Allowed` : "No Pets"}</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-100 flex items-center'>
                                                {(prop.parking_available == "Yes" || prop.parking_available == "Third Party")
                                                    ? <LuParkingCircle size={25} className='mr-2' />
                                                    : <LuParkingCircleOff size={25} className='mr-2' />
                                                }

                                                <span>{prop.pets_allowed == "Yes"
                                                    ? (prop.parking_available == "Yes" ? "Parking Available" : "Third Party Parking")
                                                    : "No Parking"}</span>
                                            </div>

                                            <div className='py-4 px-4 bg-gray-100 flex items-center'>
                                                <LuReceipt size={25} className='mr-2' />
                                                <span>Utilities {numeral(prop.utilities_per_month).format("$0,0")}/mo</span>
                                            </div>

                                        </div>

                                        <h1 className='w-full text-2xl mt-10'>Description</h1>
                                        <div className='w-full mt-2 leading-8 font-normal'>{prop.unit_description}</div>

                                        <h1 className='w-full text-2xl mt-10'>Sleeping arrangments</h1>
                                        <div className='w-full mt-2 leading-8 font-normal grid grid-cols-2 gap-5'>
                                            {(Array.isArray(prop.beds_list) && prop.beds_list.length > 0) && (
                                                prop.beds_list.map((bed: any, index: any) => {
                                                    return <div className='flex items-center' key={index}>
                                                        <LuBedDouble size={25} className='mr-2' /> <span>{bed}</span>
                                                    </div>
                                                })
                                            )}
                                        </div>

                                    </div>


                                    <div className='section w-full mt-14' id='features'>
                                        <h1 className='w-full font-play-fair-display text-2xl'>Features</h1>
                                        <div className='w-full mt-4 grid grid-cols-1 xs:grid-cols-2 gap-x-6 *:py-4 *:border-b *:border-gray-300'>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>MLS&reg; #</div>
                                                <div className='font-normal text-base text-right'>{prop.mls_number}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Monthly Rent</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.listprice).format("$0,0")}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Bedrooms</div>
                                                <div className='font-normal text-base text-right'>{prop.beds}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Total Bathrooms</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.baths).format("0,0")}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Square Footage</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.size_sqft).format("0,0")}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Year Built</div>
                                                <div className='font-normal text-base text-right'>{prop.year}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Type</div>
                                                <div className='font-normal text-base text-right'>{prop.property_type}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Pets Allowed</div>
                                                <div className='font-normal text-base text-right'>{prop.pets_allowed}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Max # of Pets</div>
                                                <div className='font-normal text-base text-right'>{prop.max_num_of_pets}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Fees Per Pets</div>
                                                <div className='font-normal text-base text-right'>
                                                    {numeral(prop.each_pets_fee_per_month).format("$0,0")}/mo
                                                    {prop.one_time_pets_fee > 0 &&
                                                        (` + ${numeral(prop.each_pets_fee_per_month).format("$0,0")}one-off`)}
                                                </div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Parking Available</div>
                                                <div className='font-normal text-base text-right'>{prop.parking_available}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Parking Fee Required</div>
                                                <div className='font-normal text-base text-right'>
                                                    {prop.parking_fee_required}
                                                    {prop.parking_fee > 0 &&
                                                        (`: ${numeral(prop.parking_fee).format("$0,0")}/mo`)}
                                                </div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Utilities Per Month</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.utilities_per_month).format("$0,0")}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Service Fee</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.service_fee).format("$0,0")}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Cleaning & Stocking Fee</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.cleaning_and_stocking_fee).format("$0,0")}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Insurance Fee</div>
                                                <div className='font-normal text-base text-right'>{numeral(prop.insurance_fee).format("$0,0")}</div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <div className='font-semibold text-base'>Status</div>
                                                <div className={`text-sm text-right uppercase font-normal bg-white px-4 py-1 rounded-full
                                                ${prop.status == "Vacant" ? "!bg-green-600 text-white" : null}
                                                ${prop.status == "Occupied" ? "!bg-red-600 text-white" : null}`}>
                                                    {prop.status}
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className='section w-full mt-14' id='amenities'>
                                        <h1 className='w-full font-play-fair-display text-3xl mb-2'>Amenities</h1>
                                        <PropFeatures title="Building Amenities" features={prop.prop_amenities} />
                                        <PropFeatures title="Apartment Equipments" features={prop.equipments} />
                                        <PropFeatures title="Apartment Interior Features" features={prop.interior_features} />
                                        <PropFeatures title="Building Exterior Features" features={prop.prop_exterior_features} />
                                    </div>

                                    {(prop.pets_allowed == "Yes" || prop.parking_available != "No") &&
                                        <div className='section w-full mt-14' id='add_ons'>
                                            <h1 className='w-full text-3xl mb-2'>Available add-ons</h1>
                                            <div className='w-full flex flex-col 2xs:flex-row 2xs:space-x-6'>

                                                {prop.parking_available != "No" && <ParkingBox payload={payload} prop={prop} />}
                                                {prop.pets_allowed == "Yes" && <PetsBox payload={payload} prop={prop} />}

                                            </div>
                                        </div>
                                    }

                                    <div className='section w-full mt-14' id='things_to_know'>
                                        <h1 className='w-full text-3xl mb-2'>Things to Know</h1>
                                        <h1 className='w-full text-xl mb-2'>Apartment rules</h1>
                                        <div className='w-full flex'>
                                            <div><LuClock8 size={30} /></div>
                                            <div className='pl-3 flex-grow flex flex-col font-normal'>
                                                <div>Move in after {prop.move_in_time}</div>
                                                <div className='mt-1'>Move out by {prop.move_out_time}</div>
                                            </div>
                                        </div>

                                        <div className='w-full mt-2'>
                                            <PropFeatures title="" features={prop.apartment_rules} />
                                        </div>
                                    </div>

                                    <div className='section w-full mt-14' id='neighborhood'>
                                        <h1 className='w-full text-3xl mb-2'>About the neighborhood</h1>
                                        <div className='w-full mt-2 leading-8 font-normal'>{prop.neighborhood_overview}</div>

                                        <div className='w-full flex justify-center items-center relative mt-8'>
                                            <div className='flex-shrink-0 bg-white size-10 rounded-full cursor-pointer shadow-lg hover:shadow-2xl
                                            flex items-center justify-center border border-gray-300' onClick={handleScrollLeft}>
                                                <FaArrowLeftLong /></div>

                                            <div className='justify-center overflow-hidden select-none no-drag' id='can_translate_cont'>

                                                <div id='can_translate' className='flex space-x-2 flex-wrap-nowrap transition-all 
                                                    duration-200 ease-in' ref={containerRef}
                                                    style={{ transform: `translateX(${translateX}px)`, transition: 'transform 0.2s ease-in-out' }}>
                                                    {categories.map((category: any) => (
                                                        <div key={category.type} className={`flex px-4 py-1 rounded-3xl border 
                                                            border-gray-300 hover:border-gray-400 hover:border-700 
                                                            hover:bg-gray-100 cursor-pointer items-center flex-wrap-nowrap font-normal 
                                                            ${current_type == category.type ? "bg-sky-200" : "bg-white"}`}
                                                            onClick={() => handleCategoryClick(category.type)}>
                                                            <span className='mr-1 w-6 h-6 flex-shrink-0'>
                                                                <img src={category.icon} width={30} height={30} alt={category.name}
                                                                    className='w-6 h-6' />
                                                            </span>
                                                            <span className='whitespace-nowrap'>{category.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className='flex-shrink-0 bg-white size-10 rounded-full cursor-pointer shadow-lg hover:shadow-2xl
                                            flex items-center justify-center border border-gray-300' onClick={handleScrollRight}>
                                                <FaArrowRightLong /></div>
                                        </div>


                                        <div className='w-full flex mt-3'>
                                            <div className='w-full mt-2 h-[450px]'>
                                                {
                                                    !isMapLoaded && <div className='w-full h-full flex justify-center items-center'>
                                                        <AiOutlineLoading3Quarters size={35} className='animate-spin' />
                                                    </div>
                                                }

                                                {
                                                    isMapLoaded && <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={12} options={mapOptions}
                                                        onLoad={handleMapLoad}>
                                                        <OverlayView position={{ lat: mapCenter.lat, lng: mapCenter.lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                                                            <div className='relative animate-bounce'>
                                                                <Image src={`/its-here.png`} width={50} height={50} alt='' />
                                                            </div>
                                                        </OverlayView>

                                                        {places_loading &&
                                                            <div className=' bg-white/50 z-50  absolute top-0 bottom-0 w-full h-full flex items-center justify-center'>
                                                                <AiOutlineLoading3Quarters size={30} className='animate-spin' />
                                                            </div>
                                                        }

                                                        {places.map((place, index) => {
                                                            const iconCat = categories.find((cat) => cat.type == current_type)
                                                            const place_icon = iconCat?.icon ? iconCat?.icon : place.icon;
                                                            return <OverlayView key={index} position={{ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }}
                                                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                                                                <div className='bg-sky-100 border border-sky-500 size-8 rounded-full flex items-center justify-center'>
                                                                    <img src={place_icon} width={20} height={20} className=' w-4 h-4' alt={place.name} />
                                                                </div>
                                                            </OverlayView>
                                                        }
                                                        )}
                                                    </GoogleMap>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className='lg:col-span-2'>
                                    <div className='w-full relative h-full mx-auto max-w-[650px] lg:max-w-[100%]'>

                                        <div className='w-full p-4 lg:p-6 bg-white rounded-2xl drop-shadow-xl border border-gray-300 lg:sticky lg:top-24 lg:z-[2]'>

                                            <div className='w-full bg-white border border-gray-300 rounded-md relative cursor-pointer'>
                                                <div className=' px-3 lg:px-5 py-4 flex items-center'
                                                    onClick={() => setDatepickerShown(true)}>
                                                    <div className=' flex-grow flex flex-col'>
                                                        <span className=' text-sm'>{stay_summary}</span>
                                                        <span className=' text-base flex items-center justify-between'>
                                                            <span>{moment(move_in).format("DD MMM YYYY")}</span>
                                                            <span><FaArrowRightLong size={16} /></span>
                                                            <span>{moment(move_out).format("DD MMM YYYY")}</span>
                                                        </span>
                                                    </div>
                                                    <div className={`ml-1 ${datepicker_shown ? "rotate-180" : null}`}>
                                                        <MdOutlineKeyboardArrowDown size={22} />
                                                    </div>
                                                </div>

                                                <div className={`absolute top-0 right-0 rounded duration-300 ransition-all z-30 ${datepicker_shown
                                                    ? "p-0 min-w-full w-[45vw] h-[80vh] xs:h-[450px] border border-gray-500 shadow-2xl overflow-x-hidden overflow-y-auto"
                                                    : "w-0 min-w-0 !h-0 overflow-hidden"}`} ref={datepickerBoxRef}>
                                                    <ReserveDatePicker payload={payload} datepicker_shown={datepicker_shown}
                                                        setDatepickerShown={setDatepickerShown} />
                                                </div>
                                            </div>

                                            <div className='w-full flex flex-col *:text-white *:flex *:items-center *:px-2 *:py-3 
                                            *:justify-center *:font-normal'>
                                                {isCheckingAvailability
                                                    ? <div className='w-full bg-white flex items-center justify-center flex-col h-[120px]'>
                                                        <AiOutlineLoading3Quarters size={30} className='animate-spin !text-sky-700' />
                                                        <div className='!text-sky-700 mt-2'>Checking date...</div>
                                                    </div>
                                                    : (
                                                        isAvailable
                                                            ? <button className='w-full bg-sky-700 rounded-full hover:shadow-lg mt-5'
                                                                onClick={ReserveApartment}>
                                                                <BiLock size={18} />
                                                                <span className='ml-2'>Reserve</span>
                                                            </button>
                                                            : <div className='w-full !justify-start !text-red-600 cursor-not-allowed mt-5'>
                                                                <TbCalendarOff size={18} />
                                                                <span className='ml-2'>Selected date range is not availabe</span>
                                                            </div>
                                                    )}
                                            </div>

                                            <div className='w-full flex items-center justify-center mt-2 font-normal'>You won’t be charged yet</div>

                                            <div className='w-full flex flex-col mt-8 space-y-2'>
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

                                            <div className='mt-4 w-full font-medium'>Share Page:</div>
                                            <div className='w-full flex items-center mt-2 *:!p-2 *:!flex *:!items-center *:!justify-center 
                                            *:!bg-primary text-white *:!cursor-pointer *:!rounded-md space-x-2 flex-wrap *:mb-2'>
                                                <FacebookShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <FaSquareFacebook size={22} />
                                                </FacebookShareButton>

                                                <TwitterShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <BsTwitterX size={22} />
                                                </TwitterShareButton>

                                                <EmailShareButton url={page_url} subject={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <MdOutlineMarkEmailUnread size={22} />
                                                </EmailShareButton>

                                                <LinkedinShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <FaLinkedin size={22} />
                                                </LinkedinShareButton>

                                                <WhatsappShareButton url={page_url} title={share_title} className='hover:shadow-xl hover:bg-sky-700'>
                                                    <FaWhatsapp size={22} />
                                                </WhatsappShareButton>

                                                <button className='hover:shadow-xl hover:bg-sky-700' onClick={() => window.print()}>
                                                    <GrPrint size={22} />
                                                </button>

                                            </div>
                                        </div>


                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                    <Gallery show={showGallery} photos={prop.images} closeGallery={closeGallery} initialSlide={initialSlide} />
                </>
            )}
        </main>
    )
}

export default PropertyDetails