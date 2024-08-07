import React from 'react'

function InteriorFeaturesPicker({ formData, unit_id, interior_features, toggleUnitPill, property_type }: {
    formData: any, unit_id: number, interior_features: string[], toggleUnitPill: (feature: string, unit_id: number, pills: string) => void,
    property_type: string
}) {
    return (
        <div className='section-block w-full flex flex-col border-t border-gray-300 pt-8 mt-8'>
            <div className='font-semibold text-lg uppercase'>
                {property_type != "Single Unit Type" && `Unit #${formData.unit_data[unit_id].unit_number}`} Interior Features
            </div>
            <small className='w-full text-sm'>Click items to select</small>

            <div className='w-full flex space-x-4 mt-3'>
                {interior_features.map((feature, index) => (
                    <span key={index} onClick={() => toggleUnitPill(feature, unit_id, "interior_features")}
                        className={`cursor-pointer px-3 py-1 rounded-full hover:shadow-xl border-2 
                            ${formData.unit_data[unit_id].interior_features.includes(feature)
                                ? 'bg-green-500 text-white border-green-500'
                                : ' text-black border-gray-600'}`}>{feature}</span>
                ))}
            </div>
        </div>
    )
}

export default InteriorFeaturesPicker
