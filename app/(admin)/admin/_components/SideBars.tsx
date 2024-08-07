"use client"

import Link from 'next/link'
import React, { useState } from 'react'
import { BsArrowLeftShort, BsBuildingAdd, BsChevronDown, BsInfoSquare, BsShieldLock } from 'react-icons/bs'
import { FaTasks, FaWordpressSimple } from 'react-icons/fa'
import { IoBusinessOutline, IoConstructOutline, IoLocationOutline, IoSettings } from 'react-icons/io5'
import { MdChatBubbleOutline, MdDashboard, MdDashboardCustomize, MdOutlineSupportAgent } from 'react-icons/md'
import { PiBuildingOffice, PiCalendar, PiUserList, PiUserPlus } from 'react-icons/pi'
import { TbCategoryPlus, TbCheckbox, TbListSearch, TbLogout2, TbTemplate } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../GlobalRedux/store'
import { menu_toggled } from '../GlobalRedux/settings/settingsSice'
import { logout, showPageLoader } from '../GlobalRedux/admin/adminSlice'
import { usePathname, useRouter } from 'next/navigation'
import { FaCity, FaGears, FaListOl, FaRegCalendarCheck, FaRobot, FaUsers } from 'react-icons/fa6'
import useCurrentBreakpoint from '@/_hooks/useMediaQuery'
import { GiModernCity } from 'react-icons/gi'
import { AiOutlineApi } from 'react-icons/ai'
import { RiListSettingsLine } from 'react-icons/ri'
import moment from 'moment'

const list_class = "flex items-center text-gray-300 rounded-md text-sm cursor-pointer gap-x-4 hover:bg-slate-800 mt-2 p-2"
export type MainMenuType = {
    title: string
    icon: React.JSX.Element
    subMenu?: undefined
    link: string
}

export type SubMenuType = {
    title: string;
    icon: React.JSX.Element;
    link: string;
    subMenu: {
        title: string;
        icon: React.JSX.Element;
        link: string
    }[];
}

export type MenuType = MainMenuType | SubMenuType

const SideBars = () => {

    //const [menuOpen, setMenuOpen] = useState(true);
    const menuOpen = useSelector((state: RootState) => state.settings.menu_opened);
    const admin = useSelector((state: RootState) => state.admin);
    const dispatch = useDispatch();
    const router = useRouter();
    const use_path = usePathname();

    const menuList: MenuType[] = [
        { "title": "Dashboard", "link": "/admin/dashboard", "icon": <MdDashboardCustomize /> },
        { "title": "Users", "link": "/admin/all-users?stage=Any&page=1", "icon": <FaUsers /> },
        { "title": "Requests", "link": "/admin/requests?type=Reservation Requests&page=1", "icon": <BsInfoSquare /> },
        {
            "title": "Properties", "link": "", "icon": <PiBuildingOffice />,
            "subMenu": [
                { "title": "All Properties", "link": "/admin/all-properties?page=1", "icon": <GiModernCity /> },
                { "title": "New Property", "link": "/admin/add-new-property", "icon": <BsBuildingAdd /> },
            ],
        },
        {
            "title": "Reservations", "link": `/admin/reservations?keyword=&date_type=None&from_date=${moment().format("YYYY-MM-DD")}&to_date=${moment().add(31, "days").format("YYYY-MM-DD")}&page=1`, "icon": <PiCalendar />
        },
    ]

    if (admin && admin.super_admin == "Yes") {
        menuList.push({
            "title": "Agents", "link": "", "icon": <MdOutlineSupportAgent />,
            "subMenu": [
                { "title": "All Agents", "link": "/admin/all-agents?page=1", "icon": <PiUserList /> },
                { "title": "New Agent", "link": "/admin/add-new-agent", "icon": <PiUserPlus /> },
            ],
        })
    }

    menuList.push({ "title": "Auto Responders", "link": "/admin/auto-responders", "icon": <FaRobot /> })

    if (admin && admin.super_admin == "Yes") {
        menuList.push({
            "title": "Settings", "link": "", "icon": <IoSettings />,
            "subMenu": [
                { "title": "Company Info", "link": "/admin/company-info", "icon": <IoBusinessOutline /> },
                { "title": "APIs ", "link": "/admin/api-settings", "icon": <AiOutlineApi /> },
                { "title": "Property Data ", "link": "/admin/property-data", "icon": <RiListSettingsLine /> },
                { "title": "Privacy Policy", "link": "/admin/privacy-settings", "icon": <BsShieldLock /> },
                { "title": "Terms of Service ", "link": "/admin/terms-settings", "icon": <TbCheckbox /> },
            ],
        })
    }
    const LogOut = () => {
        if (dispatch(logout())) {
            dispatch(showPageLoader());
            router.push("/admin/login");
        }
    }

    const closeMenu = () => {
        //setMenuOpen(!menuOpen);
        dispatch(menu_toggled(!menuOpen));
    }

    return (
        <div id='sidebar' className={`bg-gray-900 flex fixed flex-col h-screen pt-8 duration-300 text-white z-[25] 
        ${menuOpen ? "w-72 p-5 !pr-[5px]" : "w-0 md:w-20 p-0 md:p-5 -left-5 md:left-0"}`}>
            <BsArrowLeftShort className={`text-gray-900 bg-white text-3xl rounded-full absolute -right-3 top-8
            border border-gray-900 cursor-pointer ${!menuOpen && "rotate-180"}`} onClick={closeMenu} />

            <div className='inline-flex items-center h-[30px] w-full overflow-x-hidden overflow-y-hidden'>
                <MdDashboard className={`min-w-[30px] text-3xl bg-amber-300 rounded block cursor-pointer float-left text-black p-1 mr-3
                ${menuOpen && "rotate-[360deg]"} duration-300`} />
                <h2 className={`font-medium text-white text-md origin-left duration-300 ${!menuOpen && "scale-0"}`}>Admin Panel</h2>
            </div>

            <ul className='py-2 w-full scrollbar scrollbar-w-3 scrollbar-thumb-rounded-full
            scrollbar-thumb-amber-500 cursor-pointer overflow-y-auto pr-3'>
                {menuList.map((menu, index) => (
                    <MenuItem key={index} menu={menu} menuOpen={menuOpen} closeMenu={closeMenu} />
                ))}
            </ul>

            <div className='w-full self-end mt-auto border-t border-gray-600'>
                <li className={`${list_class} w-full text-left select-none`}>
                    <span className='text-xl block float-left'><TbLogout2 /></span>
                    <span className={`flex-1 text-base font-normal origin-left duration-300 ${!menuOpen && "scale-0"}`}
                        onClick={LogOut}>Logout</span>
                </li>
            </div>
        </div>
    )
}

const MenuItem = ({ menu, menuOpen, closeMenu }: { menu: MenuType, menuOpen: boolean, closeMenu: () => void }) => {

    const [subMenuOpen, setSubMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const { is1Xm, is2Xm, isXs, isSm } = useCurrentBreakpoint();

    const showLoader = () => {
        const pathname = window.location.href.split("admin/")[1];
        const link = menu.link.split("admin/")[1];
        //console.log("decodeURIComponent(pathname):", decodeURIComponent(pathname), "link:", link)
        if (decodeURIComponent(pathname) != link) {
            return dispatch(showPageLoader());
        }
    }

    return (
        <>
            <Link href={`${menu.link ? menu.link : ""}`} onClick={() => {
                (menu.link && menu.link != "") ? showLoader() : undefined;
                (menu.link && menu.link != "" && (is1Xm || is2Xm || isXs || isSm)) ? closeMenu() : undefined;
            }
            }>
                <li className={`${list_class} w-full text-left select-none`} onClick={() => setSubMenuOpen(!subMenuOpen)}>
                    <span className='text-xl block float-left'>{menu.icon}</span>
                    <span className={`flex-1 text-base font-normal origin-left ${!menuOpen && "scale-0 duration-300"}`}>{menu.title}</span>
                    {menu.subMenu && menuOpen && (<BsChevronDown className={`${subMenuOpen && "rotate-180"}`} />)}
                </li>
            </Link>

            {menu.subMenu && menu.subMenu && subMenuOpen && menuOpen && (
                <ul className='select-none'>
                    {menu.subMenu.map((sub_menu, i) => (
                        <Link href={`${sub_menu.link ? sub_menu.link : ""}`} onClick={() => {
                            const pathname = window.location.href.split("admin/")[1];
                            const link = sub_menu.link.split("admin/")[1];
                            if (pathname != link) {
                                dispatch(showPageLoader());
                            }
                            (is1Xm || is2Xm || isXs || isSm) ? closeMenu() : undefined;
                        }}>
                            <li key={i} className={`${list_class} !pl-10`}>
                                <span className='text-xl block float-left'>{sub_menu.icon}</span>
                                <span className={`flex-1 text-base font-normal origin-left ${!subMenuOpen && "scale-0 duration-300"}`}>{sub_menu.title}</span>
                            </li>
                        </Link>
                    ))}
                </ul>
            )}
        </>
    )
}

export default SideBars