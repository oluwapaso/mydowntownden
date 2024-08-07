import React from 'react'
import { FaAsterisk } from 'react-icons/fa6'

const FloatingTextarea = ({ name, label, placeholder, handleChange, height, required = false, value, disabled_field, ...rest }:
    {
        name: string, label: string, placeholder: string, handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
        required?: boolean, value?: string, height: string, disabled_field?: boolean,
    }) => {

    return (
        <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col rounded-md 
            ${disabled_field && "!opacity-45 !cursor-not-allowed"}`}>
            <div className='w-full flex items-center text-sm'>
                <span>{label}</span> {required && <FaAsterisk className='text-red-600 ml-1' size={12} />}
            </div>
            <div className='w-full'>
                <textarea name={name} value={value} className={`w-full font-normal text-lg pl-1 outline-none
                    placeholder:font-light placeholder:text-base appearance-none h-[${height}]`} placeholder={placeholder}
                    required={required} disabled={disabled_field || false} onChange={(e) => { handleChange(e) }} {...rest} />
            </div>
        </div>
    )
}

export default FloatingTextarea