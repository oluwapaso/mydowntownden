import { InputExtraField } from '@/components/types';
import React, { useRef } from 'react'
import { FaAsterisk } from 'react-icons/fa6'

const FloatingInput = ({ name, label, placeholder, handleChange, type, required = false, value, disabled_field, ...rest }:
    {
        name: string, label: string, placeholder: string, handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        type?: string, required?: boolean, value?: string, disabled_field?: boolean
    }) => {

    let input_type = "text";
    if (type && type != "") {
        input_type = type;
    }

    return (
        <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col rounded-md 
            ${disabled_field && "!opacity-45 !cursor-not-allowed"}`}>
            <div className='w-full flex items-center text-sm'>
                <span>{label}</span> {required && <FaAsterisk className='text-red-600 ml-1' size={12} />}
            </div>
            <div className='w-full'>
                <input type={input_type} name={name} value={value} className='w-full h-11 font-normal text-lg pl-1 outline-none 
                    placeholder:font-light placeholder:text-base appearance-none' placeholder={placeholder} required={required}
                    disabled={disabled_field || false} onChange={(e) => { handleChange(e) }} {...rest} />
            </div>
        </div>
    )
}

export default FloatingInput