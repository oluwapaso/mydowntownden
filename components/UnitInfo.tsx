import { baths, beds, PropertyStatus } from '@/_lib/data'
import FloatingInput from '@/app/(admin)/admin/_components/FloatingInput'
import FloatingOptions from '@/app/(admin)/admin/_components/FloatingOptions'
import React from 'react'
import { UnitDataType } from './types'
import { MdContentCopy } from 'react-icons/md'
import InteriorFeaturesPicker from './InteriorFeaturesPicker'
import FloatingTextarea from '@/app/(admin)/admin/_components/FloatingTextarea'
import EquipmentsPicker from './EquipmentsPicker'
import { RiDeleteBin6Line } from 'react-icons/ri'
import FeesInput from './FeesInput'
import GalleryUploader from './GalleryUploader'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import { FaAsterisk } from 'react-icons/fa'

function UnitInfo({ formData, unit_id, property_type, handleUnitInputChange, setFormData, interior_features, toggleUnitPill,
    equipments, setAllImages, all_images, can_reset, render_via }: {
        formData: any, unit_id: number, property_type: string, setFormData: React.Dispatch<any>, can_reset: boolean, render_via: string,
        interior_features: string[], equipments: string[], toggleUnitPill: (feature: string, unit_id: number, pills: string) => void,
        setAllImages: React.Dispatch<React.SetStateAction<{ [key: number]: any }>>, all_images: { [key: number]: any },
        handleUnitInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>, unit_id: number) => void
    }) {

    let numSFRBeds = 0;
    if (formData.unit_data[unit_id] && formData.unit_data[unit_id].beds && formData.unit_data[unit_id].beds != "") {
        numSFRBeds = parseInt(formData.unit_data[unit_id].beds) || 1;
    }

    const handleBedChange = (e: React.ChangeEvent<HTMLInputElement>, unit_id: number) => {
        setFormData((prev_val: any) => {

            const prevVal = { ...prev_val }
            let numBeds = parseInt(formData.unit_data[unit_id].beds);

            const bed_lists: any = [];
            if (numBeds > 0) {
                for (let i = 0; i <= numSFRBeds; i++) {
                    const this_bed = document.querySelector(`[name="unit_${unit_id}_bed_${i}"]`) as HTMLInputElement;
                    if (this_bed) {
                        bed_lists.push(this_bed.value)
                    }
                }
            }

            const updatedUnitData = prevVal.unit_data.map((unit: UnitDataType) => {
                if (unit.unit_id === unit_id) {
                    return { ...unit, beds_list: bed_lists };
                }
                return unit;
            });

            return { ...prevVal, unit_data: updatedUnitData }

        });
    }

    const CloneUnit = (unit_id: number) => {

        const rand = Math.floor(Math.random() * 91) + 10;
        const num_of_units = formData.unit_data.length;
        const objectToClone = formData.unit_data.find((obj: UnitDataType) => obj.unit_id === unit_id);
        if (objectToClone) {
            const newObject = { ...objectToClone, unit_id: num_of_units, unit_number: parseInt(num_of_units) + 1 }; // Clone and set a new unit_id
            const newUnits = [...formData.unit_data, newObject]
            setFormData((prev_val: any) => {
                const prevVal = { ...prev_val }
                return { ...prevVal, unit_data: newUnits }
            });
        }
    }

    const RemoveUnit = (unit_id: number) => {
        const newObjects = formData.unit_data.filter((_: any, i: number) => i !== unit_id);
        const mappedUnits = newObjects.map((unit: any, index: number) => {
            return { ...unit, unit_id: index, }
        })
        setFormData((prev_val: any) => {
            const prevVal = { ...prev_val }
            return { ...prevVal, unit_data: mappedUnits }
        });
    }

    return (
        <div className='section-block w-full flex flex-col border-b border-gray-300 pb-8 mt-8'>
            <div className='font-semibold text-lg uppercase'>
                {property_type != "Single Unit Type" && "Unit Information"}
            </div>

            <div className={`w-full ${property_type != "Single Unit Type" ? "pl-10" : null}`}>
                <div className={`w-full grid grid-cols-3 mt-3 gap-x-4`}>
                    {property_type != "Single Unit Type" &&
                        <div className='col-span-full flex justify-between items-center mb-3'>
                            <div className='font-medium'>Unit #{formData.unit_data[unit_id].unit_number}</div>
                            <div className='flex items-center'>
                                <div className='flex items-center px-4 py-2 bg-primary text-white cursor-pointer hover:shadow-xl 
                                    rounded text-xs font-semibold' onClick={() => CloneUnit(unit_id)}>
                                    <span className='mr-1'>Clone</span> <MdContentCopy size={13} />
                                </div>

                                {unit_id > 0 &&
                                    <div className='flex items-center ml-2 px-4 py-2 bg-red-600 text-white cursor-pointer hover:shadow-xl 
                                    rounded text-xs font-semibold' onClick={() => RemoveUnit(unit_id)}>
                                        <span className='mr-1'>Remove</span> <RiDeleteBin6Line size={13} />
                                    </div>
                                }
                            </div>
                        </div>
                    }

                    {((property_type != "Single Unit Type" && render_via == "Add New Property") ||
                        (property_type == "Single Unit Type" && render_via == "Edit Unit")) &&
                        <div>
                            <div className='w-full mb-6'>
                                <FloatingInput name='unit_number' label='Unit #' required value={formData.unit_data[unit_id].unit_number}
                                    placeholder='Enter a unique unit number' handleChange={(e) => handleUnitInputChange(e, unit_id)} />
                            </div>
                        </div>
                    }

                    <div>
                        <div className='w-full mb-6'>
                            <FloatingInput name='listprice' label='Rent Price' required
                                placeholder='Enter rent price' handleChange={(e) => handleUnitInputChange(e, unit_id)}
                                value={formData.unit_data[unit_id].listprice} data-is-currency />
                        </div>
                    </div>

                    <div>
                        <div className='w-full mb-6'>
                            <FloatingOptions name='beds' label='Beds' required value={formData.unit_data[unit_id].beds}
                                handleSelectChange={(e) => handleUnitInputChange(e, unit_id)} options={beds} />
                        </div>
                    </div>

                    <div>
                        <div className='w-full mb-6'>
                            <FloatingOptions name='baths' label='Baths' required value={formData.unit_data[unit_id].baths}
                                handleSelectChange={(e) => handleUnitInputChange(e, unit_id)} options={baths} />
                        </div>
                    </div>

                    <div>
                        <div className='w-full mb-6'>
                            <FloatingInput name='size_sqft' label='Size, sqft' value={formData.unit_data[unit_id].size_sqft}
                                placeholder='Enter property size in sqft' handleChange={(e) => handleUnitInputChange(e, unit_id)} data-is-number />
                        </div>
                    </div>

                    <div className='w-full'>
                        <FloatingOptions name='status' label='Status' required value={formData.unit_data[unit_id].status}
                            handleSelectChange={(e) => handleUnitInputChange(e, unit_id)} options={PropertyStatus} />
                    </div>

                </div>

                <div className='font-semibold text-lg uppercase mt-6'>Beds</div>
                <div className='w-full grid grid-cols-2 mt-3 gap-x-4'>
                    {(!formData.unit_data[unit_id].beds || formData.unit_data[unit_id].beds == '') && "Select number of bed"}
                    {
                        Array(numSFRBeds).fill(0).map((_, bed_num) => {
                            return (
                                <div className='w-full mb-6'>
                                    <FloatingInput name={`unit_${unit_id}_bed_${bed_num}`} label={`Bed #${bed_num + 1} description`}
                                        placeholder='E.g King bed, 63 in / 160 cm'
                                        value={formData.unit_data[unit_id].beds_list ? formData.unit_data[unit_id].beds_list[bed_num] : ""}
                                        handleChange={(e) => handleBedChange(e, unit_id)} />
                                </div>
                            )
                        })
                    }
                </div>

                <InteriorFeaturesPicker formData={formData} unit_id={unit_id} interior_features={interior_features}
                    toggleUnitPill={toggleUnitPill} property_type={property_type} />

                {property_type != "Single Unit Type" &&
                    <>
                        <EquipmentsPicker formData={formData} unit_id={unit_id} equipments={equipments} toggleUnitPill={toggleUnitPill}
                            property_type={property_type} />

                        <FeesInput formData={formData} unit_id={unit_id} property_type={property_type} handleUnitInputChange={(e) => handleUnitInputChange(e, unit_id)} />

                        <div className='section-block w-full flex flex-col border-t border-gray-300 pt-8 mt-8'>
                            <div className='font-semibold text-lg uppercase'>{`Unit #${formData.unit_data[unit_id].unit_number} Description`}</div>
                            <div className='w-full'>
                                <FloatingTextarea name='unit_description' label='Property Description' value={formData.unit_data[unit_id].unit_description}
                                    placeholder='Enter property description' height='250px' handleChange={(e) => handleUnitInputChange(e, unit_id)} />
                            </div>
                        </div>
                    </>
                }

                {
                    property_type != "Single Unit Type" && <GalleryUploader unit_id={unit_id} all_images={all_images} can_reset={can_reset}
                        setAllImages={setAllImages} />
                }

            </div>
        </div>
    )
}

export default UnitInfo