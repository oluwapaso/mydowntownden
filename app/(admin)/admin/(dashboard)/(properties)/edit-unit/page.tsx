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
import { AddPropertyType, APIResponseProps, InputExtraField, PropertyDetails, UnitDataType } from '@/components/types';
import { LuMapPin } from 'react-icons/lu';

import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import UnitInfo from '@/components/UnitInfo';
import FeesInput from '@/components/FeesInput';
import EquipmentsPicker from '@/components/EquipmentsPicker';
import { useSearchParams } from 'next/navigation';
import moment from 'moment';

const helpers = new Helpers();
const EditUnitProperty = () => {

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
        mls_number: "",
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
    const searchParams = useSearchParams();
    const property_type = "Single Unit Type"; //Even though it's Multi Unit Type, i has to be passed as Single, because we are dealinf with one unit
    const property_id = parseInt(searchParams?.get("property_id") as string);
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
    const [is_updating, setIsUpdating] = useState(false);
    const [can_reset, setCanReset] = useState(false);

    const [property, setProperty] = useState<PropertyDetails>({} as PropertyDetails)
    const [prop_fetched, setPropFetched] = useState(false);

    const payload = {
        property_id: property_id,
    }

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
                    parking_available: e.target.value,
                    parking_fee: "$0",
                    max_num_of_vehicle: "0",
                    ///parking_descriptions: "",
                }
            })

            if (vehicle_input.current) {
                vehicle_input.current.disabled = true;
            }

            setParkingDisabled(true);

        }
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

                //dispatch(hidePageLoader());
                fetchPropertyDetails();

            }
        }

        const fetch_api_info = async () => {
            const api_info_prms = helpers.FetchAPIInfo();
            const api_info = await api_info_prms

            if (api_info.success && api_info.data) {
                set_API_Info(api_info.data);
                //dispatch(hidePageLoader());
            }
        }

        const fetchPropertyDetails = async () => {
            const propPromise: Promise<APIResponseProps> = helpers.LoadSingleProperty(payload)
            const propResp = await propPromise;

            if (propResp.success) {
                const propertyData = propResp.data;
                setProperty(propertyData);
            }

            setPropFetched(true);
            dispatch(hidePageLoader());
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

    const handleUpdateProperty = async () => {

        const form_val = {
            ...formData,
            prop_exterior_features: prop_exterior_features,
            prop_amenities: prop_amenities,
            apartment_rules: prop_apartment_rules,
            original_property_type: property.property_type,
            original_mls_number: property.mls_number
        }

        delete form_val.unit_number;
        delete form_val.unit_mls_number;
        delete form_val.beds;
        delete form_val.baths;
        delete form_val.listprice;
        delete form_val.size_sqft;
        delete form_val.beds_list;
        delete form_val.interior_features;
        delete form_val.equipments;
        delete form_val.unit_description;
        delete form_val.units_occupied;
        delete form_val.utilities_includes;
        delete form_val.images;
        delete form_val.date_added;
        delete form_val.status;

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

        setIsUpdating(true);
        form_data.append("form_val", JSON.stringify(form_val));
        await fetch('/api/admin/properties/manage-properties', {
            method: 'PATCH',
            body: form_data
        }).then((resp): Promise<APIResponseProps> => {
            setIsUpdating(false);
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.success) {

                toast.success(data.message, {
                    position: "top-center",
                    theme: "colored"
                });

            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });

    }

    useEffect(() => {

        if (prop_fetched) {

            setPropExteriorFeatures(property.prop_exterior_features as unknown as string[]);
            setPropAmenities(property.prop_amenities as unknown as string[]);
            setPropApartmentRules(property.apartment_rules as unknown as string[]);
            //setInteriorFeatures(property.interior_features as unknown as string[]);
            //setEquipments(property.equipments as unknown as string[]);

            setFormData(() => {
                return {
                    ...formData,
                    ...property,
                    property_type: "Single Unit Type",//Even though it's Multi Unit Type, i has to be passed as Single, because we are dealinf with one unit
                    property_name: property.property_name,
                    each_pets_fee_per_month: helpers.formatCurrency(property.each_pets_fee_per_month),
                    one_time_pets_fee: helpers.formatCurrency(property.one_time_pets_fee),
                    parking_fee: helpers.formatCurrency(property.parking_fee),
                    unit_data: [{
                        unit_id: 0,
                        unit_number: property.unit_number,
                        beds: property.beds,
                        baths: parseFloat(property.baths),
                        listprice: helpers.formatCurrency(property.listprice),
                        size_sqft: helpers.formatNumber(property.size_sqft.toString()),
                        utilities_per_month: helpers.formatCurrency(property.utilities_per_month),
                        utilities_includes: property.utilities_includes,
                        service_fee: helpers.formatCurrency(property.service_fee),
                        cleaning_and_stocking_fee: helpers.formatCurrency(property.cleaning_and_stocking_fee),
                        insurance_fee: helpers.formatCurrency(property.insurance_fee),
                        beds_list: property.beds_list,
                        interior_features: property.interior_features,
                        equipments: property.equipments,
                        unit_description: property.unit_description,
                        status: property.status
                    }]
                }
            })

            if (property.parking_available != "Yes") {
                setParkingDisabled(true);
            }

            if (property.pets_allowed != "Yes") {
                setPetsDisabled(true);
            }

        }

        //setTimeout(() => { console.log("formData", formData); console.log("unitData", unitData) }, 2000)
    }, [prop_fetched, property])

    //Dirty address, reset geolocation
    useEffect(() => {

        if (prop_fetched) {
            setFormData((prev_val: any) => {
                const prevVal = { ...prev_val }
                return {
                    ...prevVal,
                    longitude: "",
                    latitude: "",
                }
            })
        }

    }, [formData.address, formData.city, formData.state])

    return (
        <div className='w-full'>
            <div className='container m-auto lg:max-w-[1100px]'>

                <PageTitle text={`Edit Unit #${property.unit_number}`} show_back={true} />
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
                                        <FloatingInput name='mls_number' label='MLS #' type='number' required value={formData.mls_number}
                                            placeholder='Enter MLS number' handleChange={handleChange} />
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

                    <UnitInfo formData={formData} unit_id={0} property_type={property_type} setFormData={setFormData}
                        handleUnitInputChange={handleUnitInputChange} toggleUnitPill={toggleUnitPill} all_images={all_images}
                        interior_features={interior_features} equipments={equipments} setAllImages={setAllImages}
                        can_reset={can_reset} render_via="Edit Unit" />

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Exterior Features</div>
                        <small className='w-full text-sm'>Click items to select</small>

                        <div className='w-full flex space-x-4 mt-3'>
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

                        <div className='w-full flex space-x-4 mt-3'>
                            {amenities.map((feature, index) => (
                                <span key={index} onClick={() => togglePill(feature, setPropAmenities)}
                                    className={`cursor-pointer px-3 py-1 rounded-full hover:shadow-xl border-2
                                    ${prop_amenities.includes(feature) ? 'bg-green-500 text-white border-green-500' :
                                            ' text-black border-gray-600'}`}>{feature}</span>
                            ))}
                        </div>
                    </div>

                    <EquipmentsPicker formData={formData} unit_id={0} equipments={equipments} toggleUnitPill={toggleUnitPill}
                        property_type={property_type} />

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Property Description</div>
                        <div className='w-full'>
                            <FloatingTextarea name='unit_description' label='Property Description' height='250px'
                                value={formData.unit_data[0].unit_description} placeholder='Enter property description'
                                handleChange={(e) => handleUnitInputChange(e, 0)} />
                        </div>
                    </div>

                    <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
                        <div className='font-semibold text-lg uppercase'>Neighborhood Overview</div>
                        <div className='w-full'>
                            <FloatingTextarea name='neighborhood_overview' label='Neighborhood Overview' value={formData.neighborhood_overview}
                                placeholder='Enter neighborhood overview' height='250px' handleChange={handleTextAreaChange} />
                        </div>
                    </div>

                    <FeesInput formData={formData} unit_id={0} property_type="Single Unit Type" handleUnitInputChange={handleUnitInputChange} />


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
                            <div className='w-full flex space-x-4 mt-1'>
                                {apartment_rules.map((feature, index) => (
                                    <span key={index} onClick={() => togglePill(feature, setPropApartmentRules)}
                                        className={`cursor-pointer px-3 py-1 rounded-full hover:shadow-xl border-2
                                    ${prop_apartment_rules.includes(feature) ? 'bg-green-500 text-white border-green-500' :
                                                ' text-black border-gray-600'}`}>{feature}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/***
                     *<GalleryUploader unit_id={0} all_images={all_images} setAllImages={setAllImages} can_reset={can_reset} />
                     */}

                    {property.property_type == "Multi Unit Type" && <div className='mt-4 font-medium text-red-600 text-sm'>
                        Note: you are updating a "Multi Unit Type" property, general property information will be updated accross
                        all other units in this property
                    </div>}

                    <div className='w-full flex justify-end mt-2'>
                        {
                            !is_updating
                                ? <div className='px-8 py-4 bg-primary text-white rounded-md cursor-pointer hover:drop-shadow-xl'
                                    onClick={() => handleUpdateProperty()}>
                                    {property.property_type == "Multi Unit Type" ? "Update Unit" : "Update Property"}</div>
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

export default EditUnitProperty
