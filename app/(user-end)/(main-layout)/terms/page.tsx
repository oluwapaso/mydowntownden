"use client";

import NavBar from "@/components/NavBar";
import 'react-toastify/dist/ReactToastify.css';
import { RootState } from "../GlobalRedux/store";
import { useSelector } from "react-redux";
import CustomLinkMain from "@/components/CustomLinkMain";
import "../../../../CkEditor/content-styles.css";

export default function Terms() {

    const comp_info = useSelector((state: RootState) => state.app);

    return (
        <main className="flex min-h-screen flex-col items-center">
            <NavBar page="Home" />
            <section className="w-full bg-gray-50 py-16 px-4 ">
                <div className='container mx-auto max-w-[1200px] px-3 sm:px-4 md:px-6 xl:px-0 text-left'>
                    <div className='w-full font-normal p-4 sm:p-6 md:p-10 bg-white shadow-md ck-content'
                        dangerouslySetInnerHTML={{ __html: comp_info.terms_of_service }} />

                </div>
            </section>
        </main>
    );
}
