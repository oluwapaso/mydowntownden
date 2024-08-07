import { useState } from "react";

const AccordionComponent = ({ title, children, selectedItems }: { title: string, children: React.ReactNode, selectedItems: () => React.JSX.Element }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            <button className="flex justify-between items-center w-full p-4 text-left text-gray-800 focus:outline-none
            bg-gray-50"
                onClick={() => setIsOpen(!isOpen)}>
                <span className='font-semibold text-gray-900'>{title} {selectedItems()}</span>
                <svg className={`w-6 h-6 transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && (
                <div className="">
                    {children}
                </div>
            )}
        </div>
    );
};

export default AccordionComponent;