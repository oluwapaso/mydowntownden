"use client";

import NavBar from "@/components/NavBar";
import { APIResponseProps } from "@/components/types";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup';
import { RootState } from "../GlobalRedux/store";
import { useSelector } from "react-redux";
import CustomLinkMain from "@/components/CustomLinkMain";
import { FaFacebookSquare } from "react-icons/fa";
import { BsInstagram } from "react-icons/bs";
import { FaTiktok, FaXTwitter } from "react-icons/fa6";
import { IoLogoYoutube } from "react-icons/io5";
import Link from "next/link";

export default function Home() {

  const comp_info = useSelector((state: RootState) => state.app);

  const emptyVal = {
    firstname: "",
    lastname: "",
    email: "",
    message: "",
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState(emptyVal);

  const onSubmit = (values: any, action: any) => {

    setIsSubmitting(true);
    fetch("/api/users/emails/send-contact-us-email", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    }).then((resp): Promise<APIResponseProps> => {
      setIsSubmitting(false);
      return resp.json();
    }).then(data => {

      if (data.message == "Email sent!") {

        toast.success("Message successfully sent, we will get back to you as soon as possible.", {
          position: "top-center",
          theme: "colored"
        });

        action.resetForm();
        setInitialValues(emptyVal);

      } else {

        toast.error("Unable to send your message, please try again later " + data.message, {
          position: "top-center",
          theme: "colored"
        });

        console.log(data.message)

      }

    });
  }

  const validationSchema = Yup.object({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
    email: Yup.string().required('Email is required'),
    message: Yup.string().required('Message is required'),
  });

  return (
    <main className="flex min-h-screen flex-col items-center">
      <NavBar page="Home" />
      <section className="w-full bg-[#1C2E3B] py-16 lg:py-32 px-4 2xl:p-0">
        <div className="container mx-auto max-w-[600px] lg:max-w-[1350px] *:text-white">

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center justify-between gap-20">
            <div className="flex flex-col">
              <h1 className="w-full font-extralight text-5xl lg:text-7xl xl:text-8xl tracking-wide">We are ready for your next adventure</h1>
              <div className="w-full mt-16 text-xl font-light tracking-wide">
                Stay in one of our beautifully furnished apartments during your next business trip, nursing assignment, or
                vacation.
              </div>
              <div className="w-full mt-2 text-xl font-light tracking-wide">Contact us today to learn more!</div>
            </div>

            <div className="flex justify-end">
              <div className="h-[400px] lg:h-[500px] xl:h-[600px] w-full max-w-[600px] !bg-cover !bg-center overflow-hidden rounded-lg shadow-2xl shadow-gray-500"
                style={{ background: `url('/Contact-1.png')` }}>
              </div>
            </div>
          </div>


          <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-20 mt-28 lg:mt-32 xl:mt-48">

            <div className=" hidden lg:block h-[600px] max-w-[600px] !bg-cover !bg-center overflow-hidden rounded-lg shadow-2xl shadow-gray-500"
              style={{ background: `url('/Contact-2.png')` }}>
            </div>

            <div className="flex flex-col">
              <h1 className="w-full font-extralight text-4xl tracking-wide">Have Questions or Feedback?</h1>
              <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} enableReinitialize>
                <Form>
                  <div className="w-full mt-8 flex flex-col">

                    <div className="w-full mb-10">
                      <label className="w-full" htmlFor="firstname">First Name *</label>
                      <Field name="firstname" className="w-full border-b border-gray-200 py-4 h-[50px] !bg-transparent 
                    outline-none focus:outline-none font-light p-3" />
                      <ErrorMessage name="firstname" component="div" className="text-red-500 mt-1" />
                    </div>

                    <div className="w-full mb-5">
                      <label className="w-full" htmlFor="lastname">Last Name *</label>
                      <Field name="lastname" className="w-full border-b border-gray-200 py-4 h-[50px] !bg-transparent 
                    outline-none focus:outline-none font-light p-3" />
                      <ErrorMessage name="lastname" component="div" className="text-red-500 mt-1" />
                    </div>

                    <div className="w-full mb-5">
                      <label className="w-full" htmlFor="email">Email *</label>
                      <Field type="email" name="email" className="w-full border-b border-gray-200 py-4 h-[50px] !bg-transparent 
                    outline-none focus:outline-none font-light p-3" />
                      <ErrorMessage name="email" component="div" className="text-red-500 mt-1" />
                    </div>

                    <div className="w-full mb-5">
                      <label className="w-full" htmlFor="message">Message *</label>
                      <Field as="textarea" name="message" className="w-full border-b border-gray-200 py-4 h-[250px] !bg-transparent 
                    outline-none focus:outline-none font-light p-3 resize-none" />
                      <ErrorMessage name="message" component="div" className="text-red-500 mt-1" />
                    </div>

                    <div>
                      {!isSubmitting
                        ? <button type="submit" className="border border-gray-200 px-6 py-4 flex items-center justify-center 
                        uppercasehover:bg-white hover:text-primary font-light duration-200">
                          Send Message
                        </button>
                        : <div className="border border-gray-200 px-6 py-4 flex items-center justify-center 
                         font-light duration-200 cursor-not-allowed w-[200px] opacity-50">
                          <AiOutlineLoading3Quarters size={13} className="mr-2 animate-spin" /> <span>Pease wait...</span>
                        </div>}

                    </div>
                  </div>
                </Form>
              </Formik>

            </div>

          </div>
        </div>
      </section>

      <section className="w-full bg-white py-20 lg:py-32 px-4 lg:px-0">
        <div className="container mx-auto max-w-[1350px] *:text-primary">
          <div className="w-full text-3xl lg:text-4xl font-normal flex items-center justify-center">Follow Us @mydowntownden</div>
          <div className="w-full flex space-x-3 lg:space-x-6 justify-center items-center mt-10 *:p-3 lg:*:p-4 *:shadow-xl *:border *:border-gray-100">
            <Link href={`${comp_info.facebook}`} target='_blank' className='hover:shadow-2xl hover:shadow-gray-900'><FaFacebookSquare size={23} /></Link>
            <Link href={`${comp_info.instagram}`} target='_blank' className='hover:shadow-2xl hover:shadow-gray-900'><BsInstagram size={23} /></Link>
            <Link href={`${comp_info.twitter}`} target='_blank' className='hover:shadow-2xl hover:shadow-gray-900'><FaXTwitter size={23} /></Link>
            <Link href={`${comp_info.youtube}`} target='_blank' className='hover:shadow-2xl hover:shadow-gray-900'><IoLogoYoutube size={23} /></Link>
            <Link href={`${comp_info.youtube}`} target='_blank' className='hover:shadow-2xl hover:shadow-gray-900 !mr-0'><FaTiktok size={23} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
