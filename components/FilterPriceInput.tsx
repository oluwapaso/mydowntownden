import React from 'react';

interface DropdownFilterProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FilterPriceInput = ({ label, name, value, onChange, onBlur }: DropdownFilterProps) => {
    return (
        <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col rounded-md`}>
            <div className='w-full flex items-center text-sm'><span>{label}</span></div>
            <div className='w-full'>
                <input name={name} value={value} className='w-full h-11 font-normal text-lg pl-1 outline-none placeholder:font-light 
                placeholder:text-base' onChange={onChange} onBlur={onBlur} />
            </div>
        </div>
    );
};

export default FilterPriceInput;
