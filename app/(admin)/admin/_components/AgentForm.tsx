import { ErrorMessage, Field, Form } from 'formik'
import React from 'react'

const AgentForm = ({ type }: { type: string }) => {
    return (
        <Form className='w-full'>
            <div className='w-full grid grid-cols-1 xs:grid-cols-2 gap-4'>

                <div className='col-span-1'>
                    <label htmlFor="firstname" className='form-label'>Firstname</label>
                    <Field type="text" name="firstname" className='form-field' placeholder='Firstname' />
                    <ErrorMessage name="firstname" component="div" />
                </div>

                <div className='col-span-1'>
                    <label htmlFor="lastname" className='form-label'>Lastname</label>
                    <Field type="text" name="lastname" className='form-field' placeholder='Lastname' />
                    <ErrorMessage name="lastname" component="div" />
                </div>

                <div className='col-span-1 xs:col-span-2'>
                    <label htmlFor="email" className='form-label'>Email</label>
                    <Field type="email" name="email" className='form-field' placeholder="Email" />
                    <ErrorMessage name="email" component="div" />
                </div>

                <div className='col-span-1'>
                    <label htmlFor="phone" className='form-label'>Phone Number</label>
                    <Field type="tel" name="phone" className='form-field' placeholder="Phone Number" />
                    <ErrorMessage name="phone" component="div" />
                </div>

                <div className='col-span-1'>
                    <label htmlFor="role" className='form-label'>Role</label>
                    <Field type="text" name="role" className='form-field' placeholder="Role" />
                    <ErrorMessage name="role" component="div" />
                </div>

                <div className='col-span-1 xs:col-span-2 mt-4'>
                    <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right hover:bg-gray-700 
                    hover:drop-shadow-md rounded-md'>
                        {type == "Add" ? "Add New Agent" : "Update Info"}
                    </button>
                </div>
            </div>
        </Form>
    )
}

export default AgentForm