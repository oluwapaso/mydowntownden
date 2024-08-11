import React from 'react'

function EquipmentsPicker({ formData, unit_id, equipments, toggleUnitPill, property_type }: {
    formData: any, unit_id: number, equipments: string[], toggleUnitPill: (feature: string, unit_id: number, pills: string) => void,
    property_type: string
}) {
    return (
        <div className={`section-block w-full flex flex-col border-gray-300 mt-8 
        ${property_type == "Single Unit Type" ? "border-b pb-8" : "border-t pt-8"}`}>
            <div className='font-semibold text-lg uppercase'>
                {property_type != "Single Unit Type" && `Unit #${formData.unit_data[unit_id].unit_number}`} Equipments
            </div>
            <small className='w-full text-sm'>Click items to select</small>

            <div className='w-full flex flex-wrap *:mb-3 *:mr-3 mt-3'>
                {equipments.map((feature, index) => (
                    <span key={index} onClick={() => toggleUnitPill(feature, unit_id, "equipments")}
                        className={`cursor-pointer px-3 py-1 rounded-full hover:shadow-xl border-2 
                            ${formData.unit_data[unit_id].equipments.includes(feature)
                                ? 'bg-green-500 text-white border-green-500'
                                : ' text-black border-gray-600'}`}>{feature}</span>
                ))}
            </div>
        </div>
    )
}

export default EquipmentsPicker
