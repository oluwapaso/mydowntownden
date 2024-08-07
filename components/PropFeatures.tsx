import React from 'react'

const PropFeatures = ({ title, features }: { title: string, features: any }) => {
    if (!Array.isArray(features) || features.length < 1) return null;

    return (
        <div className='w-full mb-10'>
            <h1 className='w-full text-xl'>{title}</h1>
            <div className='w-full flex items-center flex-wrap !border-transparent mt-1'>
                {features.map((feature: any, index: any) => {
                    return <div key={index} className='flex mr-2 mb-2 rounded items-center justify-center bg-green-200/80 
                    text-green-800 px-4 py-2 cursor-pointer hover:drop-shadow-lg'>{feature}</div>
                })}
            </div>
        </div>
    );
};

export default PropFeatures