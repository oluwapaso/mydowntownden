"use client"
import { Helpers } from '@/_lib/helpers';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/admin/adminSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageTitle from '@/components/PageTitle';
import FloatingInput from '../../../_components/FloatingInput';
import FloatingOptions from '../../../_components/FloatingOptions';
import { countries, parkings, parkingsFee, time_options, usa_states, yes_or_no } from '@/_lib/data';
import FloatingTextarea from '../../../_components/FloatingTextarea';
import { AddPropertyType, APIResponseProps, InputExtraField, UnitDataType } from '@/components/types';
import { LuMapPin } from 'react-icons/lu';

import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import GalleryUploader from '@/components/GalleryUploader';
import UnitInfo from '@/components/UnitInfo';
import FeesInput from '@/components/FeesInput';
import EquipmentsPicker from '@/components/EquipmentsPicker';
import moment from 'moment';

const helpers = new Helpers();
const AddNewProperty = () => {

    //8150 Ponce De Leon Rd, Miami
    //Redirects to login page if user is not logged in
    helpers.VerifySession();

    const unitData: UnitDataType = {
        unit_id: 0,
        unit_number: "1",
        beds: 1,
        baths: 1,
        listprice: "$0",
        size_sqft: "",
        utilities_per_month: "$0",
        utilities_includes: "",
        service_fee: "$0",
        cleaning_and_stocking_fee: "$0",
        insurance_fee: "$0",
        beds_list: [],
        interior_features: [],
        equipments: [],
        unit_description: "",
        status: "Vacant",
    }

    const initial_data: AddPropertyType = {
        property_type: "Single Unit Type",
        property_name: "",
        address: "",
        state: "",
        zip_code: "",
        city: "",
        neighborhood: "",
        country: "United States",
        latitude: "",
        longitude: "",
        year: "",
        mls_number: helpers.generateUniqueMLSNumber(10, 5),
        pets_allowed: "Yes",
        max_num_of_pets: "1",
        each_pets_fee_per_month: "$0",
        one_time_pets_fee: "$0",
        weight_limit_and_restrictions: "Yes",
        prohibited_animals_and_breeds: "",
        prop_exterior_features: [],
        prop_amenities: [],
        unit_description: "",
        neighborhood_overview: "",
        parking_available: "Yes",
        parking_fee_required: "Yes",
        parking_fee: "$0",
        max_num_of_vehicle: "1",
        parking_descriptions: "",
        move_in_time: "4:00 PM",
        move_out_time: "11:00 AM",
        apartment_rules: [],
        unit_data: [unitData],
    }

    const dispatch = useDispatch();
    const [property_type, setPropertyType] = useState("Single Unit Type");
    const [all_images, setAllImages] = useState<{ [key: number]: any }>({});
    const [interior_features, setInteriorFeatures] = useState<string[]>([]);
    const [exterior_features, setExteriorFeatures] = useState<string[]>([]);
    const [amenities, setAmenities] = useState<string[]>([]);
    const [equipments, setEquipments] = useState<string[]>([]);
    const [apartment_rules, setApartmentRules] = useState<string[]>([]);
    const [formData, setFormData] = useState<any>(initial_data);
    const [prop_exterior_features, setPropExteriorFeatures] = useState<string[]>([]);
    const [prop_amenities, setPropAmenities] = useState<string[]>([]);
    const [prop_apartment_rules, setPropApartmentRules] = useState<string[]>([]);
    const num_pets_input = useRef<HTMLInputElement>(null);
    const vehicle_input = useRef<HTMLInputElement>(null);
    const [pet_disabled, setPetsDisabled] = useState(false);
    const [parking_disabled, setParkingDisabled] = useState(false);
    const [apiInfo, set_API_Info] = useState<any>();
    const [is_adding, setIsAdding] = useState(false);
    const [can_reset, setCanReset] = useState(false);

    const extraFields: InputExtraField = {
        pet_disabled,
        parking_disabled
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const isCurrency = e.target.dataset.isCurrency === 'true';
        const isNumber = e.target.dataset.isNumber === 'true';

        setFormData((prev_val: any) => {
            const prevVal = { ...prev_val }

            let newValue = value;
            if (isCurrency) {
                newValue = helpers.formatCurrency(value);
            } else if (isNumber) {
                newValue = helpers.formatNumber(value);
            }

            return {
                ...prevVal,
                [e.target.name]: newValue,
            }
        })
    }

    const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement> |
        React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>, unit_id: number) => {

        const value = e.target.value;
        const name = e.target.name;
        const isCurrency = e.target.dataset.isCurrency === 'true';
        const isNumber = e.target.dataset.isNumber === 'true';

        setFormData((prev_val: any) => {
            const prevVal = { ...prev_val }

            let newValue = value;
            if (isCurrency) {
                newValue = helpers.formatCurrency(value);
            } else if (isNumber) {
                newValue = helpers.formatNumber(value);
            }

            const updatedUnitData = prevVal.unit_data.map((unit: UnitDataType) => {
                if (unit.unit_id === unit_id) {
                    return { ...unit, [name]: newValue };
                }
                return unit;
            });

            return { ...prevVal, unit_data: updatedUnitData }
        });

    }

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData((prev_val: any) => {
            const prevVal = { ...prev_val }
            return {
                ...prevVal,
                [e.target.name]: e.target.value,
            }
        })
    }

    const togglePill = (feature: string, setCheckedPillsFn: React.Dispatch<React.SetStateAction<string[]>>) => {
        setCheckedPillsFn((prevCheckedPills) =>
            prevCheckedPills.includes(feature)
                ? prevCheckedPills.filter((item) => item !== feature)
                : [...prevCheckedPills, feature]
        );
    };

    const toggleUnitPill = (feature: string, unit_id: number, pills: string) => {
        setFormData((prev_val: any) => {

            const prevVal = { ...prev_val }
            const { unit_data } = prevVal;
            const unitPills = unit_data[unit_id][pills];
            const selected_pills = unitPills.includes(feature)
                ? unitPills.filter((item: any) => item !== feature) :
                [...unitPills, feature]

            const updatedUnitData = prevVal.unit_data.map((unit: UnitDataType) => {
                if (unit.unit_id === unit_id) {
                    return { ...unit, [pills]: selected_pills };
                }
                return unit;
            });

            return { ...prevVal, unit_data: updatedUnitData }

        });

    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev_val: any) => {
            const prevVal = { ...prev_val }
            return {
                ...prevVal,
                [e.target.name]: e.target.value,
            }
        })
    }

    const handlePetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

        if (e.target.value == "Yes") {

            setFormData((prev_val: any) => {
                const prevVal = { ...prev_val }
                return {
                    ...prevVal,
                    pets_allowed: "Yes",
                }
            })

            if (num_pets_input.current) {
                num_pets_input.current.disabled = false;
            }
            setPetsDisabled(false);

        } else {

            setFormData((prev_val: any) => {
                const prevVal = { ...prev_val }
                return {
                    ...prevVal,
                    pets_allowed: "No",
                    max_num_of_pets: "0",
                    one_time_pets_fee: "$0",
                    each_pets_fee_per_month: "$0",
                    weight_limit_and_restrictions: "No",
                    prohibited_animals_and_breeds: "",
                }
            })

            if (num_pets_input.current) {
                num_pets_input.current.disabled = true;
            }

            setPetsDisabled(true);

        }

    }

    const handleParkingsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

        if (e.target.value == "Yes") {

            setFormData((prev_val: any) => {
                const prevVal = { ...prev_val }
                return {
                    ...prevVal,
                    parking_available: "Yes",
                }
            })

            if (vehicle_input.current) {
                vehicle_input.current.disabled = false;
            }
            setParkingDisabled(false);

        } else {

            setFormData((prev_val: any) => {
                const prevVal = { ...prev_val }
                return {
                    ...prevVal,
                    parking_available: "No",
                    parking_fee: "$0",
                    max_num_of_vehicle: "0",
                    parking_descriptions: "",
                }
            })

            if (vehicle_input.current) {
                vehicle_input.current.disabled = true;
            }

            setParkingDisabled(true);

        }
    }

    const ChangePropertyType = (property_type: string) => {
        setAllImages({});
        setFormData((prev_val: any) => {
            const prevVal = { ...prev_val }
            return {
                ...prevVal,
                property_type: property_type,
                unit_data: [unitData],
            }
        })
        setPropertyType(property_type);
    }

    useEffect(() => {

        const fetch_company_info = async () => {
            const comp_info_prms = helpers.FetchCompanyInfo();
            const comp_info = await comp_info_prms;

            if (comp_info.success && comp_info.data) {
                if (comp_info.data.interior_features && comp_info.data.interior_features.length) {
                    setInteriorFeatures(comp_info.data.interior_features || []);
                }

                if (comp_info.data.exterior_features && comp_info.data.exterior_features.length) {
                    setExteriorFeatures(comp_info.data.exterior_features || []);
                }

                if (comp_info.data.amenities && comp_info.data.amenities.length) {
                    setAmenities(comp_info.data.amenities || []);
                }

                if (comp_info.data.equipments && comp_info.data.equipments.length) {
                    setEquipments(comp_info.data.equipments || []);
                }

                if (comp_info.data.apartment_rules && comp_info.data.apartment_rules.length) {
                    setApartmentRules(comp_info.data.apartment_rules || []);
                }
                dispatch(hidePageLoader())
            }
        }

        const fetch_api_info = async () => {
            const api_info_prms = helpers.FetchAPIInfo();
            const api_info = await api_info_prms

            if (api_info.success && api_info.data) {
                set_API_Info(api_info.data);
                dispatch(hidePageLoader());
            }
        }

        dispatch(showPageLoader());
        fetch_company_info();
        fetch_api_info();

    }, []);

    useEffect(() => {
        const main_content = document.getElementById("main_content") as HTMLElement
        if (main_content) {
            main_content.classList.remove("bg-gray-50");
            main_content.classList.add("bg-white");
        }

        // Cleanup function to undo the changes
        return () => {
            if (main_content) {
                main_content.classList.remove("bg-white");
                main_content.classList.add("bg-gray-50");
            }
        };
    }, [])


    const getGeolocation = async () => {

        toast.dismiss();
        const address = formData.address;
        const state = formData.state;
        // const zip_code = formData.zip_code;
        const city = formData.city;

        if (!address || !state || !city) { // || !zip_code
            toast.error("Provide a valid address, state and city", {
                position: "top-center",
                theme: "colored"
            });
            return false;
        }

        const full_address = `${address}, ${city}, ${state} USA`;
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(full_address)}&key=${apiInfo.google_map_key as string}`
        );
        const data = await response.json();
        if (data.status === "OK") {

            const location = data.results[0].geometry.location;
            setFormData((prev_val: any) => {
                const prevVal = { ...prev_val }
                return {
                    ...prevVal,
                    latitude: location.lat,
                    longitude: location.lng,
                }
            })

        } else {
            toast.error("Unable to get coordinates from address", {
                position: "top-center",
                theme: "colored"
            });
        }

    }

    const handleAddProperty = async () => {

        const form_val = {
            ...formData,
            prop_exterior_features: prop_exterior_features,
            prop_amenities: prop_amenities,
            apartment_rules: prop_apartment_rules,
        }

        const missing_fields: any[] = [];
        const fields = [
            { name: 'property_name', message: 'Provide a valid property name' },
            { name: 'mls_number', message: 'Provide a valid and unique MLS number' },
            { name: 'address', message: 'Provide a valid property address' },
            { name: 'city', message: 'Provide a valid property city' },
            { name: 'neighborhood', message: 'Provide a valid neighborhood' },
            { name: 'state', message: 'Provide a valid property state' },
            { name: 'zip_code', message: 'Provide a valid property zip code' },
            { name: 'longitude', message: 'Generate geolocation to continue' },
            { name: 'latitude', message: 'Generate geolocation to continue' },
            { name: 'property_type', message: 'Select a valid property type' },
            { name: 'pets_allowed', message: 'Select if pets are allowed or not' },
            { name: 'parking_available', message: 'Select if parking is available or not' }
        ];

        if (form_val.property_type == "Single Unit Type") {

            const sfr_data = form_val.unit_data[0];
            const sfrFields = [{ name: 'listprice', message: 'Provide a valid rent price' },
            { name: 'beds', message: 'Select number of beds' },
            { name: 'baths', message: 'Select number of baths' }]

            sfrFields.forEach(field => {
                if (!sfr_data[field.name] || sfr_data[field.name] === "") {
                    missing_fields.push(field.message);
                }
            });

        }

        fields.forEach(field => {
            if (!form_val[field.name] || form_val[field.name] === "") {
                missing_fields.push(field.message);
            }
        });

        toast.dismiss();
        if (missing_fields && missing_fields.length > 0) {
            const missingFields = missing_fields.map((msg) => {
                return (<div className='w-full py-2'>{msg}</div>)
            });

            toast.error(<div className='flex flex-col'>{...missingFields}</div>, {
                position: "top-center",
                theme: "colored"
            });

            return false;
        }

        const imagesArray = Object.entries(all_images).map(([key, value]) => ({
            unit_id: key,
            images: value
        }));

        const form_data = new FormData();
        imagesArray.forEach((unit_image) => {
            const unit_id = unit_image.unit_id;
            const image_lists = unit_image.images;
            image_lists.forEach((image: any) => {
                form_data.append(`unit_${unit_id}_images`, image);
            });
        });

        setIsAdding(true);
        form_data.append("form_val", JSON.stringify(form_val));
        await fetch('/api/admin/properties/manage-properties', {
            method: 'POST',
            body: form_data
        }).then((resp): Promise<APIResponseProps> => {
            setIsAdding(false);
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.success) {

                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                })

                setPropExteriorFeatures([]);
                setPropAmenities([]);
                setPropApartmentRules([]);
                setPetsDisabled(false);
                setParkingDisabled(false);
                setAllImages({});
                setCanReset(true);

                const to = setTimeout(() => {
                    setCanReset(false);
                }, 1500);
                setFormData(initial_data);

                return (() => clearTimeout(to));

            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });

    }

    return (
        <div className='w-full'>
            <div className='container m-auto lg:max-w-[1100px]'>

                <PageTitle text="Add New Property" show_back={true} />
                <div className='w-full mt-6 bg-gray-50 px-8 py-8 rounded-lg'>

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8'>
                        <div className='font-semibold text-lg uppercase'>General Information</div>
                        <div className='w-full grid grid-cols-5 mt-3 gap-x-4'>
                            <div className='col-span-3'>
                                <div className='w-full mb-6'>
                                    <FloatingInput name='property_name' label='Property Name' required
                                        placeholder='Enter property name' value={formData.property_name} handleChange={handleChange} />
                                </div>

                                <div className='w-full mb-6'>
                                    <FloatingInput name='address' label='Address' required
                                        placeholder='Enter property address' value={formData.address} handleChange={handleChange} />
                                </div>

                                <div className='w-full grid grid-cols-2 gap-x-4 mb-6'>
                                    <div className='w-full'>
                                        <FloatingOptions name='state' label='State/Region' required value={formData.state}
                                            handleSelectChange={handleSelectChange} options={usa_states} />
                                    </div>

                                    <div className='w-full'>
                                        <FloatingInput name='zip_code' label='Zip' type='number' required value={formData.zip_code}
                                            placeholder='Enter zip code' handleChange={handleChange} />
                                    </div>
                                </div>

                                <div className='w-full grid grid-cols-2 gap-x-4'>
                                    <div className='w-full'>
                                        <FloatingOptions name='country' label='Country' required value={formData.country}
                                            handleSelectChange={handleSelectChange} options={countries} />
                                    </div>
                                </div>
                            </div>

                            <div className='col-span-2 mb-6'>
                                <div className='w-full grid grid-cols-2 gap-x-4 mb-6'>
                                    <div className='w-full'>
                                        <FloatingInput name='year' label='Year Built' type='number' value={formData.year}
                                            placeholder='Enter year built' handleChange={handleChange} />
                                    </div>
                                    <div className='w-full'>
                                        <FloatingInput name='mls_number' label='MLS #' required value={formData.mls_number}
                                            placeholder='Enter MLS number' handleChange={handleChange} disabled_field />
                                    </div>
                                </div>

                                <div className='w-full mb-6'>
                                    <FloatingInput name='city' label='City' required placeholder='Enter city' value={formData.city}
                                        handleChange={handleChange} />
                                </div>

                                <div className='w-full mb-6'>
                                    <FloatingInput name='neighborhood' label='Neighborhood' required placeholder='Enter neighborhood' value={formData.neighborhood}
                                        handleChange={handleChange} />
                                </div>
                            </div>

                            <div className='col-span-full mt-6'>
                                <div className='w-full grid grid-cols-4 gap-x-4'>
                                    <div className='col-span-3 grid grid-cols-2 gap-x-4'>
                                        <div className='w-full'>
                                            <FloatingInput name='latitude' label='Latitude' required disabled_field
                                                placeholder='Enter property address to get latitude' value={formData.latitude}
                                                handleChange={() => null} />
                                        </div>

                                        <div className='w-full'>
                                            <FloatingInput name='longitude' label='Longitude' required disabled_field
                                                placeholder='Enter property address to get longitude' value={formData.longitude}
                                                handleChange={() => null} />
                                        </div>
                                    </div>

                                    <div className='col-span-1 px-6 py-3 bg-primary text-white rounded-md cursor-pointer 
                                    hover:drop-shadow-xl flex items-center justify-center' onClick={() => getGeolocation()}>
                                        <LuMapPin size={15} /> <span className='ml-1'>Get Geolocation</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Property Type</div>
                        <div className='w-full grid grid-cols-2 mt-3 gap-x-4'>

                            <div className='p-6 bg-white border-2 border-gray-300 flex flex-col cursor-pointer'
                                onClick={() => ChangePropertyType("Single Unit Type")}>
                                <div className='w-full font-semibold text-sm uppercase'>Single Unit Type</div>

                                <div className='w-full mt-2'>
                                    Singe famliy rentals (often abbriviated as SFR) are rentals in which there is only one
                                    rental associated to a specific address. This type of rental is usually used for a
                                    house, singe mobie home, or a single condo. <strong>This type of property does not
                                        allow to add units/rooms
                                    </strong>
                                </div>

                                <div className='w-full mt-2 flex items-center cursor-pointer'>
                                    <div className='mr-2'>
                                        <div className={`bg-white size-6 rounded-full drop-shadow-md 
                                            ${property_type == "Single Unit Type" ? "border-[6px] border-green-700" : "border border-gray-700"} `}></div>
                                    </div>
                                    <div className=' text-purple-800 font-semibold text-sm'>Single Unit Type</div>
                                </div>
                            </div>


                            <div className='p-6 bg-white border-2 border-gray-300 flex flex-col cursor-pointer'
                                onClick={() => ChangePropertyType("Multi Unit Type")}>
                                <div className='w-full font-semibold text-sm uppercase'>Multi Unit Type</div>

                                <div className='w-full mt-2'>
                                    Multi-unit property are for rentals in which there are multipe rental units per single
                                    address. This type of property is typically used for renting out rooms of a house,
                                    apartment units, office units, condos, garage, strorage units, mobile home park etc.
                                </div>

                                <div className='w-full mt-2 flex items-center'>
                                    <div className='mr-2'>
                                        <div className={`bg-white size-6 rounded-full drop-shadow-md 
                                            ${property_type == "Multi Unit Type" ? "border-[6px] border-green-700" : "border border-gray-700"} `}></div>
                                    </div>
                                    <div className=' text-purple-800 font-semibold text-sm'>Multi Unit Type</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {
                        property_type == "Single Unit Type" && (
                            <UnitInfo formData={formData} unit_id={0} property_type="Single Unit Type" setFormData={setFormData}
                                handleUnitInputChange={handleUnitInputChange} toggleUnitPill={toggleUnitPill} all_images={all_images}
                                interior_features={interior_features} equipments={equipments} setAllImages={setAllImages}
                                can_reset={can_reset} render_via="Add New Property" />
                        )
                    }


                    {
                        property_type == "Multi Unit Type" && (
                            formData.unit_data.map((unit_info: any) => {
                                if (unit_info) {
                                    return <>
                                        <UnitInfo formData={formData} unit_id={unit_info.unit_id} property_type="Multi Unit Type"
                                            setFormData={setFormData} handleUnitInputChange={handleUnitInputChange} equipments={equipments}
                                            toggleUnitPill={toggleUnitPill} interior_features={interior_features} all_images={all_images}
                                            setAllImages={setAllImages} can_reset={can_reset} render_via="Add New Property" />
                                    </>
                                }
                            })
                        )

                    }

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Exterior Features</div>
                        <small className='w-full text-sm'>Click items to select</small>

                        <div className='w-full flex flex-wrap *:mb-3 *:mr-3 mt-3'>
                            {exterior_features.map((feature, index) => (
                                <span key={index} onClick={() => togglePill(feature, setPropExteriorFeatures)}
                                    className={`cursor-pointer px-3 py-1 rounded-full hover:shadow-xl border-2
                                    ${prop_exterior_features.includes(feature) ? 'bg-green-500 text-white border-green-500' :
                                            ' text-black border-gray-600'}`}>{feature}</span>
                            ))}
                        </div>
                    </div>

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Amenities</div>
                        <small className='w-full text-sm'>Click items to select</small>

                        <div className='w-full flex flex-wrap *:mb-3 *:mr-3 mt-3'>
                            {amenities.map((feature, index) => (
                                <span key={index} onClick={() => togglePill(feature, setPropAmenities)}
                                    className={`cursor-pointer px-3 py-1 rounded-full hover:shadow-xl border-2
                                    ${prop_amenities.includes(feature) ? 'bg-green-500 text-white border-green-500' :
                                            ' text-black border-gray-600'}`}>{feature}</span>
                            ))}
                        </div>
                    </div>
                    {
                        property_type == "Single Unit Type" && (
                            <EquipmentsPicker formData={formData} unit_id={0} equipments={equipments} toggleUnitPill={toggleUnitPill}
                                property_type={property_type} />
                        )
                    }

                    {
                        property_type == "Single Unit Type" && (
                            <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                                <div className='font-semibold text-lg uppercase'>Property Description</div>
                                <div className='w-full'>
                                    <FloatingTextarea name='unit_description' label='Property Description' height='250px'
                                        value={formData.unit_data[0].unit_description} placeholder='Enter property description'
                                        handleChange={(e) => handleUnitInputChange(e, 0)} />
                                </div>
                            </div>
                        )
                    }

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Neighborhood Overview</div>
                        <div className='w-full'>
                            <FloatingTextarea name='neighborhood_overview' label='Neighborhood Overview' value={formData.neighborhood_overview}
                                placeholder='Enter neighborhood overview' height='250px' handleChange={handleTextAreaChange} />
                        </div>
                    </div>

                    {
                        property_type == "Single Unit Type" && (
                            <FeesInput formData={formData} unit_id={0} property_type="Single Unit Type" handleUnitInputChange={handleUnitInputChange} />
                        )
                    }

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Pets</div>

                        <div className='w-full grid grid-cols-3 mt-3 gap-x-4'>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingOptions name='pets_allowed' label='Pets allowed' required value={formData.pets_allowed}
                                        handleSelectChange={handlePetChange} options={yes_or_no} />
                                </div>
                            </div>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingInput name='max_num_of_pets' label='Maximum number of pets'
                                        disabled_field={extraFields.pet_disabled} placeholder='Maximum number of pets'
                                        handleChange={handleChange} value={formData.max_num_of_pets} data-is-number />
                                </div>
                            </div>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingInput name='each_pets_fee_per_month' label='Each pets fee per month'
                                        disabled_field={extraFields.pet_disabled} placeholder='Each pets fee per month'
                                        handleChange={handleChange} value={formData.each_pets_fee_per_month} data-is-currency />
                                </div>
                            </div>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingInput name='one_time_pets_fee' label='One-off pet fee (per/pet)'
                                        placeholder='One-off pet fee' disabled_field={extraFields.pet_disabled} handleChange={handleChange}
                                        value={formData.one_time_pets_fee} data-is-currency />
                                </div>
                            </div>

                            <div className='w-full mb-6'>
                                <FloatingOptions name='weight_limit_and_restrictions' label='Weight limit & breed restrictions'
                                    handleSelectChange={handleSelectChange} disabled_field={extraFields.pet_disabled}
                                    options={yes_or_no} value={formData.weight_limit_and_restrictions} />
                            </div>

                            <div className='col-span-full'>
                                <div className='w-full mb-6'>
                                    <FloatingTextarea name='prohibited_animals_and_breeds' label='Prohibited animals & breeds'
                                        height='100px' placeholder='Prohibited animals & breeds e.g American Pit Bull Terrier, American Bully, American Staffordshire Terrier etc.' disabled_field={extraFields.pet_disabled}
                                        handleChange={handleTextAreaChange} value={formData.prohibited_animals_and_breeds} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Parking</div>

                        <div className='w-full grid grid-cols-2 mt-3 gap-x-4'>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingOptions name='parking_available' label='Parking available' required
                                        handleSelectChange={handleParkingsChange} options={parkings} value={formData.parking_available} />
                                </div>
                            </div>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingOptions name='parking_fee_required' label='Fee required?' options={parkingsFee}
                                        handleSelectChange={handleSelectChange} value={formData.parking_fee_required} />
                                </div>
                            </div>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingInput name='parking_fee' label='Parking fee (per/vehicle)' value={formData.parking_fee}
                                        placeholder='Parking fee (per/vehicle)' disabled_field={extraFields.parking_disabled}
                                        handleChange={handleChange} data-is-currency />
                                </div>
                            </div>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingInput name='max_num_of_vehicle' label='Maximum number of vehicle'
                                        disabled_field={extraFields.parking_disabled} placeholder='Maximum number of vehicle'
                                        handleChange={handleChange} value={formData.max_num_of_vehicle} data-is-number />
                                </div>
                            </div>

                            <div className='col-span-full'>
                                <div className='w-full mb-6'>
                                    <FloatingTextarea name='parking_descriptions' label='Parking descriptions' height='100px'
                                        placeholder='Prohibited animals & breeds e.g Ground-level covered parking, on premises OR Available via Prudential Center Garage.'
                                        handleChange={handleTextAreaChange} value={formData.parking_descriptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='section-block w-full flex flex-col pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Apartment Rules</div>

                        <div className='w-full grid grid-cols-2 mt-3 gap-x-4'>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingOptions name='move_in_time' label='Move in after' value={formData.move_in_time}
                                        handleSelectChange={handleSelectChange} options={time_options} />
                                </div>
                            </div>

                            <div>
                                <div className='w-full mb-6'>
                                    <FloatingOptions name='move_out_time' label='Move out by' value={formData.move_out_time}
                                        handleSelectChange={handleSelectChange} options={time_options} />
                                </div>
                            </div>
                        </div>

                        <div className='w-full mt-3'>
                            <small className='w-full text-sm'>Click items to select</small>
                            <div className='w-full flex flex-wrap *:mb-3 *:mr-3 mt-1'>
                                {apartment_rules.map((feature, index) => (
                                    <span key={index} onClick={() => togglePill(feature, setPropApartmentRules)}
                                        className={`cursor-pointer px-3 py-1 rounded-full hover:shadow-xl border-2
                                    ${prop_apartment_rules.includes(feature) ? 'bg-green-500 text-white border-green-500' :
                                                ' text-black border-gray-600'}`}>{feature}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {
                        property_type == "Single Unit Type" && <GalleryUploader unit_id={0} all_images={all_images} setAllImages={setAllImages}
                            can_reset={can_reset} />
                    }

                    <div className='w-full flex justify-end mt-4'>
                        {
                            !is_adding
                                ? <div className='px-8 py-4 bg-primary text-white rounded-md cursor-pointer hover:drop-shadow-xl'
                                    onClick={() => handleAddProperty()}>Add Property</div>
                                : <div className='px-8 py-4 bg-primary/50 text-white rounded-md flex items-center cursor-not-allowed'>
                                    <AiOutlineLoading3Quarters size={14} className='animate-spin' /> <span className='ml-1'>Plese wait...</span></div>
                        }
                    </div>
                </div>

            </div>
            <ToastContainer />
        </div>
    )
}

export default AddNewProperty
