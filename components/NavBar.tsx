"use client"

import React, { useEffect, useState } from 'react'
import { NavProps } from './types';
import { useDispatch, useSelector } from 'react-redux';
import { FetchCompInfo, menu_toggled } from '@/app/(user-end)/(main-layout)/GlobalRedux/app/appSlice';
import { AppDispatch, RootState } from '@/app/(user-end)/(main-layout)/GlobalRedux/store';
import { signOut, useSession } from 'next-auth/react'
import { useModal } from '@/app/contexts/ModalContext';
import { BiMenu, BiSearch } from 'react-icons/bi';
import { FaRegUserCircle, FaTimes } from 'react-icons/fa';
import CustomLinkMain from './CustomLinkMain';
import Link from 'next/link';
import moment from 'moment';

function NavBar({ page }: NavProps) {

    const { data: session } = useSession();

    const [hasScrolled, setHasScrolled] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const comp_info = useSelector((state: RootState) => state.app);
    const menuOpen = comp_info.menu_opened;
    const [logged_user, setLoggedUser] = useState({} as any);
    //const city_lists = useSelector((state: RootState) => state.cities);

    useEffect(() => {

        const handleScroll = () => {
            if (window.scrollY > 150) {
                setHasScrolled(true);
            } else {
                setHasScrolled(false);
            }
        }

        window.addEventListener('scroll', handleScroll);

        const fetch_info = async () => {
            await dispatch(FetchCompInfo());
        }
        fetch_info();

        // const fetch_cities = async () => {
        //     await dispatch(FetchCities());
        // }
        //fetch_cities();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        }

    }, []);

    const { handleLoginModal } = useModal();

    const openMenu = () => {
        dispatch(menu_toggled(true));
        document.body.style.overflowY = 'hidden';
    }

    const closeMenu = () => {
        dispatch(menu_toggled(false));
        document.body.style.overflowY = 'auto';
    }

    useEffect(() => {
        let loggedUser = session?.user as any;
        setLoggedUser(loggedUser)
    }, [session]);

    return (
        <nav className={`nav w-full px-4 md:px-16 flex justify-between items-center transition duration-500 py-4 mx-auto 
        bg-white shadow-md  ${page == "Search" ? "fixed z-50" : "static"}`}>
            <div className='logo-container'>
                <CustomLinkMain href="/">
                    <img src={"/my-down-town-den-logo-dark.png"} alt='Logo image' width={40} height={40}
                        className="w-[auto] h-[40px] sm:w-[auto] sm:h-[60px]" />
                </CustomLinkMain>
            </div>

            <div className='center-logo-container hidden lg:flex'>
                <CustomLinkMain href="/">
                    <img src={"/tiny-logo.png"} alt='Logo image' width={120} height={30} className='w-[auto] h-[30px] xs:h-[30px]' />
                </CustomLinkMain>
            </div>

            <div className={`nav-menu-container hidden lg:flex justify-end items-center select-none flex-wrap`}>
                <div className='menu-container mr-5'>
                    <div className={`flex flex-row justify-end items-center space-x-5 cursor-pointer *:font-normal`}>
                        <CustomLinkMain href={`/search?neighborhood=All Neighborhoods&move_in=${moment(moment().add(1, "day")).format("YYYY-MM-DD")}&move_out=${moment(moment().add(32, "days")).format("YYYY-MM-DD")}&map_bounds=${JSON.stringify({ north: 42.60242525588096, south: 42.171848287543746, east: -70.73319879101562, west: -71.38688531445312 })}`} className='bg-primary text-white px-4 py-3 transition duration-300 
                            rounded hover:shadow-md cursor-pointer flex items-center'>
                            <div className='flex flex-row items-center'>
                                <BiSearch size={16} className='mr-1' /> <span className='uppercase text-sm mr-1'>Discover Dens</span>
                            </div>
                        </CustomLinkMain>

                        <CustomLinkMain href={`/about-us`} className='bg-primary text-white px-4 py-3 transition duration-300 
                            rounded hover:shadow-md cursor-pointer flex items-center'>
                            <div className='flex flex-row items-center'>
                                <span className='uppercase text-sm mr-1'>Our Story</span>
                            </div>
                        </CustomLinkMain>
                    </div>
                </div>

                {
                    session?.user
                        ? <div className='mr-5 group relative'>
                            <div className='auth-container flex flex-row items-center'>
                                <button className={`text-sm uppercase bg-primary text-white px-4 py-3 transition duration-300 
                                rounded hover:shadow-md cursor-pointer flex items-center`}>
                                    My Dashboard
                                </button>
                            </div>

                            <div className='absolute hidden w-[220px] z-[200] bg-transparent group-hover:block pt-[24px] right-0'>
                                <ul className='nav-menu bg-white shadow-2xl'>
                                    <CustomLinkMain href='/my-dashboard?tab=Favorites&status=Active&page=1' className='nav-menu-item'>
                                        <div className=' flex items-center px-4 py-3 hover:bg-gray-100'>Favorites {`(${logged_user?.favorites ? logged_user?.favorites.length : "0"})`}</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href='/my-dashboard?tab=Preferences' className='nav-menu-item hover:bg-gray-100'>
                                        <div className=' flex items-center px-4 py-3 hover:bg-gray-100'>Preferences</div>
                                    </CustomLinkMain>
                                    <li className='nav-menu-item hover:bg-gray-100 cursor-pointer' onClick={() => signOut()}>
                                        <div className='flex items-center px-4 py-3'>Sign Out</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        : <div className='auth-container mr-5 bg-primary text-white px-4 py-3 transition duration-300 rounded 
                            hover:shadow-md cursor-pointer flex items-center font-normal h-11' onClick={handleLoginModal}>
                            <FaRegUserCircle size={15} /> <span className='ml-2'>Sign In</span></div>
                }

                <div className='phone-container cursor-pointer hidden xl:block'>
                    <Link href={`tel:617-893-0633;`} className='text-base'>617-893-0633</Link>
                </div>
            </div>

            <div className={`w-full ${menuOpen ? "block backdrop-blur bg-black bg-opacity-35" : "hidden"} absolute z-[150] h-dvh right-0 top-0 left-0`}>
                <div id='mobile_menu' className='bg-gradient-to-br from-primary to-sky-700 to-[100vh] h-[100vh] flex absolute right-0 top-0 w-[100%] max-w-[350px]'>
                    <div className='w-full h-full *:text-white *:font-play-fair-display relative'>
                        <div className='flex justify-between items-center p-4 border-b border-gray-400'>
                            <span className='text-2xl'>Menu</span> <FaTimes size={28} onClick={closeMenu} />
                        </div>
                        <div className='w-full flex flex-col p-3 *:px-4 *:py-4 h-[calc(100dvh-64px)] 
                        overflow-x-hidden overflow-y-auto font-normal *:bg-gray-800/50 *:rounded-md space-y-3' onClick={closeMenu}>

                            <CustomLinkMain href='/'>
                                <div>Home</div>
                            </CustomLinkMain>

                            <CustomLinkMain href={`/search?neighborhood=All Neighborhoods&move_in=${moment(moment().add(1, "day")).format("YYYY-MM-DD")}&move_out=${moment(moment().add(32, "days")).format("YYYY-MM-DD")}&map_bounds=${JSON.stringify({ north: 42.60242525588096, south: 42.171848287543746, east: -70.73319879101562, west: -71.38688531445312 })}`}>
                                <div>Discover Dens</div>
                            </CustomLinkMain>

                            <CustomLinkMain href='/about-us'>
                                <div>Our Story</div>
                            </CustomLinkMain>

                            {
                                session?.user && <>
                                    <CustomLinkMain href={`/my-dashboard?tab=Favorites&status=Active&page=1`}>
                                        <div>Favorites {`(${logged_user?.favorites ? logged_user?.favorites.length : "0"})`}</div>
                                    </CustomLinkMain>
                                    <CustomLinkMain href={`/my-dashboard?tab=Preferences`}>
                                        <div>Preferences</div>
                                    </CustomLinkMain>
                                </>
                            }
                            <CustomLinkMain href={`/contact-us`}>
                                <div>Contact Us</div>
                            </CustomLinkMain>
                            <CustomLinkMain href={`/terms`}>
                                <div>Terms of Use</div>
                            </CustomLinkMain>
                            <CustomLinkMain href={`/privacy-policy`}>
                                <div>Privacy Policy</div>
                            </CustomLinkMain>

                            {
                                session?.user ? <div onClick={() => signOut()}>Sign Out</div> : <div onClick={handleLoginModal}>Sign In</div>
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex lg:hidden items-center justify-center text-primary' onClick={openMenu}>
                <BiMenu size={28} />
            </div>
        </nav>
    )
}

export default NavBar