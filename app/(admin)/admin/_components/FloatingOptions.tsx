import React from 'react'
import { FaAsterisk } from 'react-icons/fa6'

const FloatingOptions = ({ name, label, handleSelectChange, required = false, options, disabled_field, value }:
    {
        name: string, label: string, handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
        required?: boolean, options: any[], disabled_field?: boolean, value?: string
    }) => {

    return (
        <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col rounded-md 
            ${disabled_field && "!opacity-45 !cursor-not-allowed"}`}>
            <div className='w-full flex items-center text-sm'>
                <span>{label}</span> {required && <FaAsterisk className='text-red-600 ml-1' size={12} />}
            </div>
            <div className='w-full'>
                <select name={name} value={value} className='w-full h-11 font-normal text-lg pl-1 outline-none placeholder:font-light 
                    placeholder:text-base' disabled={disabled_field || false} onChange={(e) => { handleSelectChange(e) }}>
                    {options.map((option) => (
                        <option key={option.code} value={option.code}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default FloatingOptions