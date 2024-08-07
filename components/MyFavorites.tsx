"use client"

import { useSearchParams } from 'next/navigation';
import React from 'react'
import PropertyLists from './PropertyLists';
import Link from 'next/link';

const MyFavorites = () => {

    const searchParams = useSearchParams();
    const status = searchParams?.get("status") as string;
    const page = searchParams?.get("page") as string;
    const pagination_path = `/my-dashboard`;
    const list_type = `Favorites-${status}`;

    return (
        <div className='container mx-auto max-w-[1260px] text-left min-h-[50vh]'>
            <h2 className='w-full font-play-fair-display text-2xl md:text-3xl lg:text-3xl mb-2'>MY FAVORITE LISTINGS</h2>
            <PropertyLists list_type={list_type} pagination_path={pagination_path} />
        </div>
    )
}

export default MyFavorites