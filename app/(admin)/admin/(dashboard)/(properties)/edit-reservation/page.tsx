"use client"

import { Helpers } from '@/_lib/helpers';
import { ErrorMessage, Field, Form, Formik, FieldProps } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { hidePageLoader, showPageLoader } from '../../../GlobalRedux/admin/adminSlice';
import { APIResponseProps, PropertyDetails, Reservation } from '@/components/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageTitle from '../../../_components/PageTitle';
import { useRouter, useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as Yup from 'yup';
import { format } from 'date-fns';
import moment from 'moment';

interface DatePickerFieldProps extends FieldProps {
    placeholderText?: string;
    dateFormat?: string;
}

const helpers = new Helpers();
const EditReservation = () => {

    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const reservation_id = parseInt(searchParams?.get("reservation_id") as string);

    const [reservation, setReservation] = useState<Reservation>({} as Reservation);
    const [resv_fetched, setResvFetched] = useState(false);
    const [show_more, setShowMore] = useState(false);

    const [initialValues, setInitialValues] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phone_1: "",
        phone_2: "",
        move_in: null as Date | null,
        move_out: null as Date | null,
    });

    const validationSchema = Yup.object({
        move_in: Yup.date().required('Move-in date is required'),
        move_out: Yup.date().required('Move-out date is required'),
    });

    const payload = {
        reservation_id: reservation_id,
    }

    useEffect(() => {

        const fetchReservation = async () => {
            const resvsPromise: Promise<APIResponseProps> = helpers.LoadSingleReservations(payload)
            const resvResp = await resvsPromise;

            if (resvResp.success) {
                const reservationData = resvResp.data;
                reservationData.move_in = moment(reservationData.move_in).format("MM-DD-YYYY");
                reservationData.move_out = moment(reservationData.move_out).format("MM-DD-YYYY");
                setReservation(reservationData);
                setInitialValues(reservationData);
            }

            setResvFetched(true);
            dispatch(hidePageLoader());
        }

        dispatch(showPageLoader());
        setReservation({} as Reservation);
        fetchReservation();

    }, [reservation_id]);

    const handleSubmit = async (value: any, action: any) => {

        dispatch(showPageLoader());

        value.mls_number = reservation.mls_number;
        value.property_id = reservation.property_id;
        value.move_in = formatDate(value.move_in);
        value.move_out = formatDate(value.move_out);

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/admin/reservations/manage-reservations`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        }).then((resp): Promise<APIResponseProps> => {
            dispatch(hidePageLoader());
            return resp.json();
        }).then(data => {

            toast.dismiss();
            if (data.success) {
                toast.success("Reservation succesfully updated", {
                    position: "top-center",
                    theme: "colored"
                })

            } else {
                toast.error(data.message, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });
    }

    const formatDate = (date: any) => {
        if (!date) return '';
        // Format the date to exclude the timezone
        return format(date, 'yyyy-MM-dd');
    };

    return (
        <div className='w-full'>
            <PageTitle text="Company Info" show_back={true} />
            <div className='container m-auto max-w-[650px] lg:max-w-[1100px]'>
                <div className='w-full mt-6'>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>

                        <div className='lg:col-span-1'>
                            <div className='font-semibold'>Provide reservation info.</div>
                            <div className=''>Notes: the dates selected here will be used to filter out
                                proprty search on front end</div>
                        </div>

                        <div className='col-span-1 lg:col-span-2 p-3 sm:p-7 bg-white shadow-lg'>
                            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}
                                enableReinitialize={true}>
                                {({ errors, touched }) => (
                                    <Form className='w-full'>
                                        <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>

                                            <div className='col-span-1'>
                                                <label htmlFor="firstname" className='form-label'>Tenant First Name</label>
                                                <Field type="tel" name="firstname" className='form-field' placeholder="Tenant First Name" />
                                                <ErrorMessage name="firstname" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="lastname" className='form-label'>Tenant Last Name</label>
                                                <Field type="tel" name="lastname" className='form-field' placeholder="Tenant Last Name" />
                                                <ErrorMessage name="lastname" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="phone_1" className='form-label'>Phone Number 1</label>
                                                <Field type="tel" name="phone_1" className='form-field' placeholder="Phone Number 1" />
                                                <ErrorMessage name="phone_1" component="div" />
                                            </div>

                                            <div className='col-span-1'>
                                                <label htmlFor="phone_2" className='form-label'>Phone Number 2</label>
                                                <Field type="tel" name="phone_2" className='form-field' placeholder="Phone Number 2" />
                                                <ErrorMessage name="phone_2" component="div" />
                                            </div>

                                            <div className='col-span-full'>
                                                <label htmlFor="email" className='form-label'>Email Address</label>
                                                <Field type="email" name="email" className='form-field' placeholder="Email Address" />
                                                <ErrorMessage name="email" component="div" />
                                            </div>

                                            <div className='col-span-1 flex flex-col'>
                                                <label htmlFor="move_in" className='form-label w-full'>Move-in</label>
                                                <Field type="text" name="move_in" component={DatePickerField}
                                                    className='form-field w-full' autoComplete="off" placeholder='Move-in' />
                                                {errors.move_in && touched.move_in ? (
                                                    <div className="error w-full text-red-600">{errors.move_in}</div>
                                                ) : null}
                                            </div>

                                            <div className='col-span-1 flex flex-col'>
                                                <label htmlFor="move_out" className='form-label w-full'>Move-out</label>
                                                <Field type="text" name="move_out" component={DatePickerField}
                                                    className='form-field' autoComplete="off" placeholder='Move-out' />
                                                {errors.move_out && touched.move_out ? (
                                                    <div className="error w-full text-red-600">{errors.move_out}</div>
                                                ) : null}
                                            </div>

                                            <div className='col-span-1 sm:col-span-2 mt-4'>
                                                <button type="submit" className='bg-gray-800 py-3 px-6 text-white float-right rounded-md 
                                            hover:bg-gray-700 hover:drop-shadow-xl'>
                                                    Update Reservation
                                                </button>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    )

}


const DatePickerField = ({ field, form, placeholderText = "Select date", dateFormat = "MM/dd/yyyy", ...props }: DatePickerFieldProps) => {
    return (
        <DatePicker
            {...field}
            {...props}
            selected={(field.value && new Date(field.value)) || null}
            onChange={(val) => {
                form.setFieldValue(field.name, val);
            }}
            placeholderText={placeholderText}
            dateFormat={dateFormat}
        />
    );
};


export default EditReservation