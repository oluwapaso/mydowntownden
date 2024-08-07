import React from 'react';

interface DropdownFilterProps {
    label: string;
    name: string;
    value: string;
    options: { value: any, text: any }[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FilterDropdown = ({ label, name, value, options, onChange }: DropdownFilterProps) => {
    return (
        <div className={`w-full bg-white border-2 border-gray-300 px-5 py-3 flex flex-col rounded-md`}>
            <div className='w-full flex items-center text-sm'><span>{label}</span></div>
            <div className='w-full'>
                <select name={name} value={value} className='w-full h-11 font-normal text-lg pl-1 outline-none placeholder:font-light 
                placeholder:text-base' onChange={onChange}>
                    <option value="0">Any</option>
                    {options.map(({ value, text }) => (
                        <option value={value} key={value}>{text}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FilterDropdown;
