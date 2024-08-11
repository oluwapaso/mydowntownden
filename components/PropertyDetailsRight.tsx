import React, { useCallback, useEffect, useState } from 'react'
import { APIResponseProps, PropertyDetails } from './types'
import { Helpers } from '@/_lib/helpers';
import { HiOutlineHomeModern } from 'react-icons/hi2';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import { FaRegTrashAlt, FaTools } from 'react-icons/fa';
import { PiCityLight, PiSwimmingPoolDuotone } from 'react-icons/pi';
import { MdOutlineRoomPreferences } from 'react-icons/md';
import { TbHomeEco } from 'react-icons/tb';
import { LuBedDouble } from 'react-icons/lu';
import { BiBed, BiSolidCalendarHeart } from 'react-icons/bi';
import { GrGallery } from 'react-icons/gr';
import OtherUnits from './OtherUnits';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { hidePageLoader, showPageLoader } from '@/app/(admin)/admin/GlobalRedux/admin/adminSlice';
//import { toast } from 'react-toastify';
import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';
import Swal from 'sweetalert2';
import moment from 'moment';
import { IoCalendarNumberOutline } from 'react-icons/io5';
import PropertyMiniReservations from './PropertyMiniReservations';

const helpers = new Helpers();
const PropertyDetailsRight = ({ prop, toast, setTotalReservations }:
    { prop: PropertyDetails, toast: any, setTotalReservations: React.Dispatch<React.SetStateAction<number>> }) => {

    const dispatch = useDispatch();
    const [images, setImages] = useState<any[]>([]);
    const [prop_images, setPropImages] = useState<any>(prop.images);
    const [dirtyGallery, setDirtyGallery] = useState(false);

    const onDrop = useCallback((acceptedFiles: any) => {

        const newImages = acceptedFiles.map((file: any) => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setImages(() => [...newImages]);

    }, []);


    useEffect(() => {

        const form_data = new FormData();
        images.forEach((unit_image) => {
            form_data.append(`images`, unit_image);
        });

        form_data.append("form_val", JSON.stringify({ "property_id": prop.property_id, "old_images": prop_images }));
        const UploadImage = async () => {

            await fetch('/api/admin/properties/add-property-image', {
                method: 'PUT',
                body: form_data
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    toast.success(data.message, {
                        position: "top-center",
                        theme: "colored"
                    })

                    setImages(() => []);

                    setPropImages(() => {
                        return data.data.new_images
                    });

                    const element = document.getElementById('default_dp') as HTMLElement;
                    if (element) {
                        const initialImage = (data.data.new_images && data.data.new_images.length > 0) ? data.data.new_images[0] : "/no-image-added.png";
                        element.style.background = `url(${initialImage})`;
                    }

                } else {
                    toast.error(data.message, {
                        position: "top-center",
                        theme: "colored"
                    })
                }

            });

        }

        if (images && images.length > 0) {
            dispatch(showPageLoader());
            UploadImage();
        }

    }, [images, prop_images])

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { "image": ["*"] } });

    type SortableItemProps = {
        index: number,
        image: string,
        handleDeleteImg: (index: number, image: string) => Promise<void>,
    }

    const onSortEnd = ({ oldIndex, newIndex }: any) => {
        setPropImages((prevImages: any) => arrayMove(prevImages, oldIndex, newIndex));
        setDirtyGallery(true);
    };

    const SortableItem = SortableElement<SortableItemProps>(({ image, index, handleDeleteImg }: any) => (
        <div key={index} className=' group h-24 !bg-cover !bg-center rounded-md hover:shadow-2xl cursor-pointer relative'
            style={{ background: `url(${image})` }}>
            <button className="hidden group-hover:flex absolute top-1 right-1 bg-red-500 text-white rounded-full items-center 
            justify-center size-7" onClick={() => handleDeleteImg(index, image)}>&times;</button>
        </div>
    ));

    interface SortableListProps {
        images: any[];
    }

    const SortableList = SortableContainer<SortableListProps>(({ images }: any) => {
        return (
            <div className="w-full grid grid-cols-[repeat(5,3fr)] gap-3">
                {images.map((image: any, index: any) => (
                    <SortableItem key={`item-${index}`} index={index} image={image} handleDeleteImg={handleDeleteImg} />
                ))}
            </div>
        );
    });

    const SaveArrangement = async () => {

        dispatch(showPageLoader());
        toast.dismiss();
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await fetch(`${apiBaseUrl}/api/admin/properties/rearrange-images`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "prop_images": prop_images, "property_id": prop.property_id, }),
        }).then((resp): Promise<APIResponseProps> => {
            dispatch(hidePageLoader());
            return resp.json();
        }).then(data => {

            if (data.success) {

                toast.success(`${data.message}`, {
                    position: "top-center",
                    theme: "colored"
                });
                setDirtyGallery(false);

            } else {
                toast.error(`${data.message}`, {
                    position: "top-center",
                    theme: "colored"
                })
            }

        });

    }

    const handleDeleteImg = async (index: number, image: string) => {

        const result = await Swal.fire({
            title: "Are you sure you want to delete this image?",
            text: "This can not be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Continue',
        });

        if (result.isConfirmed) {

            dispatch(showPageLoader());

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            await fetch(`${apiBaseUrl}/api/admin/properties/delete-image`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "image_to_delete": image, "prop_images": prop_images, "property_id": prop.property_id }),
            }).then((resp): Promise<APIResponseProps> => {
                dispatch(hidePageLoader());
                return resp.json();
            }).then(data => {

                toast.dismiss();
                if (data.success) {

                    const item = document.getElementById(`image_${index}`);
                    item?.remove();

                    toast.success(data.message, {
                        position: "top-center",
                        theme: "colored"
                    });

                    setDirtyGallery(false);
                    setPropImages(() => {
                        return data.data.new_images
                    });

                } else {
                    toast.error(data.message, {
                        position: "top-center",
                        theme: "colored"
                    })
                }

            });

        } else {
            // Handle cancel action
            console.log('Canceled');
        }

    }

    return (
        <div className='w-full flex flex-col'>

            <div className='w-full'>
                <div className='w-full font-semibold flex items-center'>
                    <span><HiOutlineHomeModern size={18} /></span> <span className='ml-2'>General Information</span>
                </div>

                <div className='w-full font-semibold grid grid-cols-4 gap-y-6 pl-7 py-4'>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Property Name</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.property_name}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Year Built</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.year}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>MLS #</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.mls_number}</div>
                    </div>

                    {prop.property_type == "Multi Unit Type" &&
                        <div className='flex flex-col'>
                            <div className='font-normal text-gray-500 text-base'>Unit #</div>
                            <div className='font-medium text-lg text-gray-600'>{prop.unit_number}</div>
                        </div>
                    }

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Property Status</div>
                        <div className='font-medium text-lg text-gray-600' id='property_status_text'>{prop.status}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Beds</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.beds}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Baths</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.baths}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Total Units</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.total_units}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Size Sqft</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.size_sqft}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Pets Allowed</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.pets_allowed}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Max # of Pets</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.max_num_of_pets}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Parking Available</div>
                        <div className='font-medium text-lg text-gray-600'>{prop.parking_available}</div>
                    </div>

                </div>
            </div>

            <div className='divider h-3 bg-gray-200 my-6'></div>

            <div className='w-full mt-2'>
                <div className='w-full font-semibold flex items-center'>
                    <span><FaHandHoldingDollar size={18} /></span> <span className='ml-2'>Fees</span>
                </div>

                <div className='w-full font-semibold grid grid-cols-4 gap-y-6 pl-7 py-4'>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>List Price</div>
                        <div className='font-medium text-lg text-gray-600'>{helpers.formatCurrency(prop.listprice)}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Service Fee</div>
                        <div className='font-medium text-lg text-gray-600'>{helpers.formatCurrency(prop.service_fee)}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Cleaning &amp; Stocking Fee</div>
                        <div className='font-medium text-lg text-gray-600'>{helpers.formatCurrency(prop.cleaning_and_stocking_fee)}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Insurance Fee</div>
                        <div className='font-medium text-lg text-gray-600'>{helpers.formatCurrency(prop.insurance_fee)}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Fees Per Pet</div>
                        <div className='font-medium text-lg text-gray-600'>{helpers.formatCurrency(prop.insurance_fee)}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>One Time Pets Fee</div>
                        <div className='font-medium text-lg text-gray-600'>{helpers.formatCurrency(prop.one_time_pets_fee)}</div>
                    </div>

                    <div className='flex flex-col'>
                        <div className='font-normal text-gray-500 text-base'>Parking Fee</div>
                        <div className='font-medium text-lg text-gray-600'>{helpers.formatCurrency(prop.parking_fee)}</div>
                    </div>
                </div>
            </div>

            <div className='divider h-3 bg-gray-200 my-6'></div>

            <div className='w-full mt-2'>
                <div className='w-full font-semibold flex items-center'>
                    <span><LuBedDouble size={18} /></span> <span className='ml-2'>Beds</span>
                </div>

                <div className='w-full font-normal flex pl-7 py-4 space-x-6'>
                    {
                        Array.isArray(prop.beds_list) && (
                            prop.beds_list.map((feature, index) => (
                                <span key={index} className={`flex items-center text-sm`}>
                                    <span><BiBed size={18} /></span>
                                    <span className='ml-2 text-base'>{feature}</span>
                                </span>
                            ))
                        )
                    }
                </div>
            </div>

            <div className='divider h-3 bg-gray-200 my-6'></div>

            <div className='w-full mt-2'>
                <div className='w-full font-semibold flex items-center'>
                    <span><PiSwimmingPoolDuotone size={18} /></span> <span className='ml-2'>Amenities</span>
                </div>

                <div className='w-full font-semibold flex flex-wrap *:mb-3 *:mr-3 pl-7 py-4'>
                    {
                        Array.isArray(prop.prop_amenities) && (
                            prop.prop_amenities.map((feature, index) => (
                                <span key={index} className={`cursor-pointer px-5 py-1 rounded-full border-2 bg-green-500 
                                text-white border-green-500 font-semibold text-sm`}>{feature}</span>
                            ))
                        )
                    }
                </div>
            </div>

            <div className='divider h-3 bg-gray-200 my-6'></div>

            <div className='w-full mt-2'>
                <div className='w-full font-semibold flex items-center'>
                    <span><FaTools size={18} /></span> <span className='ml-2'>Equipments</span>
                </div>

                <div className='w-full font-semibold flex flex-wrap *:mb-3 *:mr-3 pl-7 py-4'>
                    {
                        Array.isArray(prop.equipments) && (
                            prop.equipments.map((feature, index) => (
                                <span key={index} className={`cursor-pointer px-5 py-1 rounded-full border-2 bg-green-500 
                                text-white border-green-500 font-semibold text-sm`}>{feature}</span>
                            ))
                        )
                    }
                </div>
            </div>

            <div className='divider h-3 bg-gray-200 my-6'></div>

            <div className='w-full mt-2'>
                <div className='w-full font-semibold flex items-center'>
                    <span><MdOutlineRoomPreferences size={18} /></span> <span className='ml-2'>Interior Features</span>
                </div>

                <div className='w-full font-semibold flex flex-wrap *:mb-3 *:mr-3 pl-7 py-4'>
                    {
                        Array.isArray(prop.interior_features) && (
                            prop.interior_features.map((feature, index) => (
                                <span key={index} className={`cursor-pointer px-5 py-1 rounded-full border-2 bg-green-500 
                                text-white border-green-500 font-semibold text-sm`}>{feature}</span>
                            ))
                        )
                    }
                </div>
            </div>

            <div className='divider h-3 bg-gray-200 my-6'></div>

            <div className='w-full mt-2'>
                <div className='w-full font-semibold flex items-center'>
                    <span><TbHomeEco size={18} /></span> <span className='ml-2'>Exterior Features</span>
                </div>

                <div className='w-full font-semibold flex flex-wrap *:mb-3 *:mr-3 pl-7 py-4'>
                    {
                        Array.isArray(prop.prop_exterior_features) && (
                            prop.prop_exterior_features.map((feature, index) => (
                                <span key={index} className={`cursor-pointer px-5 py-1 rounded-full border-2 bg-green-500 
                                text-white border-green-500 font-semibold text-sm`}>{feature}</span>
                            ))
                        )
                    }
                </div>
            </div>

            <div className='divider h-3 bg-gray-200 my-6'></div>

            <div className='w-full mt-2'>
                <div className='w-full font-semibold flex items-center'>
                    <span><GrGallery size={18} /></span> <span className='ml-2'>Gallery</span>
                </div>

                <div className='w-full pl-7 py-4'>
                    {
                        Array.isArray(prop_images) && (
                            <SortableList images={prop_images} onSortEnd={onSortEnd} axis="xy" />
                        )
                    }

                    <div className='w-full mt-1 text-sm text-sky-700 font-medium'>Drag images arround to rearrange.</div>

                    {dirtyGallery &&
                        <div className='w-full'>
                            <div className='flex justify-center px-4 py-2 bg-sky-600 text-white mt-2 rounded max-w-[210px]
                        hover:shadow-2xl cursor-pointer' onClick={SaveArrangement}>Save Arrangement</div>
                        </div>
                    }
                </div>

                <div className='w-full mt-2 pl-7'>
                    <div className='section-block w-full flex flex-col pb-8 mt-8'>
                        <div className='w-full mt-2'>
                            <div {...getRootProps({ className: 'flex items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded bg-gray-50 text-gray-500 cursor-pointer mb-5' })}>
                                <input {...getInputProps()} />
                                <p>Drag 'n' drop some files here, or click to select files</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='divider h-3 bg-gray-200 my-6'></div>

            <div className='w-full mt-2'>
                <div className='w-full font-semibold flex items-center'>
                    <span><IoCalendarNumberOutline size={18} /></span> <span className='ml-2'>Reservations</span>
                </div>

                <PropertyMiniReservations property_id={prop.property_id} setTotalReservations={setTotalReservations} />
            </div>

            {prop.property_type == "Multi Unit Type" &&
                <>
                    <div className='divider h-3 bg-gray-200 my-6'></div>

                    <div className='w-full mt-2'>
                        <div className='w-full font-semibold flex items-center'>
                            <span><PiCityLight size={18} /></span> <span className='ml-2'>Other Units</span>
                        </div>

                        <OtherUnits mls_number={prop.mls_number} property_id={prop.property_id} />
                    </div>
                </>
            }

        </div>
    )
}

export default PropertyDetailsRight
