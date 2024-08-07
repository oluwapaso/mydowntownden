import React from 'react'
import FloatingInput from "@/app/(admin)/admin/_components/FloatingInput";
import FloatingTextarea from "@/app/(admin)/admin/_components/FloatingTextarea";

const FeesInput = ({ formData, unit_id, property_type, handleUnitInputChange }: {
    formData: any, unit_id: number, property_type: string,
    handleUnitInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>, unit_id: number) => void
}) => {
    return (
        <div className={`section-block w-full flex flex-col border-gray-300 mt-8 
        ${property_type == "Single Unit Type" ? "border-b pb-8" : "border-t pt-8"}`}>
            <div className='font-semibold text-lg uppercase'>Other Fees</div>

            <div className='w-full grid grid-cols-2 mt-3 gap-x-4'>

                <div>
                    <div className='w-full mb-6'>
                        <FloatingInput name='utilities_per_month' label='Utilities per month'
                            placeholder='Enter utilities price' handleChange={(e) => handleUnitInputChange(e, 0)}
                            value={formData.unit_data[unit_id].utilities_per_month} data-is-currency />
                    </div>
                </div>

                <div>
                    <div className='w-full mb-6'>
                        <FloatingInput name='service_fee' label='Service fee' placeholder='Enter service fee amount'
                            handleChange={(e) => handleUnitInputChange(e, 0)} value={formData.unit_data[unit_id].service_fee}
                            data-is-currency />
                    </div>
                </div>

                <div>
                    <div className='w-full mb-6'>
                        <FloatingInput name='cleaning_and_stocking_fee' label='Exit cleaning & stocking fee'
                            placeholder='Enter cleaning & stocking fee' handleChange={(e) => handleUnitInputChange(e, 0)}
                            value={formData.unit_data[unit_id].cleaning_and_stocking_fee} data-is-currency />
                    </div>
                </div>

                <div>
                    <div className='w-full mb-6'>
                        <FloatingInput name='insurance_fee' label='Insurance fee'
                            placeholder='Enter insurance fee amount' handleChange={(e) => handleUnitInputChange(e, 0)}
                            value={formData.unit_data[unit_id].insurance_fee} data-is-currency />
                    </div>
                </div>

                <div className='col-span-full'>
                    <div className='w-full mb-6'>
                        <FloatingTextarea name='utilities_includes' label='Utilities includes' height='100px'
                            placeholder='Enter utilities fee descriptions e.g Cost of power, Tv/Cable, Internet etc.'
                            value={formData.unit_data[unit_id].utilities_includes} handleChange={(e) => handleUnitInputChange(e, 0)} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FeesInput