import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone';
import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';

interface ImageFile {
    file: File;
    preview: string;
}

interface SortableItemProps {
    value: ImageFile;
    onRemove: (file: ImageFile) => void;
}

const SortableItem = SortableElement<SortableItemProps>(({ value, onRemove }: any) => (
    <div className="relative w-24 h-24 overflow-hidden border border-gray-300 rounded">
        <img src={value.preview} alt="Preview" className="object-cover w-full h-full" />
        <button className="absolute top-1 right-1 bg-red-500 text-white rounded-full flex items-center justify-center size-7"
            onClick={() => onRemove(value)}>&times;</button>
    </div>
));

interface SortableListProps {
    items: ImageFile[];
    onRemove: (file: ImageFile) => void;
}

const SortableList = SortableContainer<SortableListProps>(({ items, onRemove }: any) => {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((value: any, index: any) => (
                <SortableItem key={`item-${index}`} index={index} value={value} onRemove={onRemove} />
            ))}
        </div>
    );
});


const GalleryUploader = ({ unit_id, setAllImages, all_images, can_reset }: {
    unit_id: number, all_images: { [key: number]: any }, can_reset: boolean,
    setAllImages: React.Dispatch<React.SetStateAction<{ [key: number]: ImageFile[] }>>
}) => {

    const [images, setImages] = useState<any[]>([]);
    const onDrop = useCallback((acceptedFiles: any) => {
        const newImages = acceptedFiles.map((file: any) => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setImages((prevImages) => [...prevImages, ...newImages]);
    }, [unit_id]);

    const onSortEnd = ({ oldIndex, newIndex }: any) => {
        setImages((prevImages) => arrayMove(prevImages, oldIndex, newIndex));
    };

    const removeImage = (file: any) => {
        setImages((prevImages) => prevImages.filter((image) => image !== file));
    };

    useEffect(() => {
        setAllImages((prevImages) => ({
            ...prevImages,
            [unit_id]: images
        }));
    }, [images, unit_id]);

    useEffect(() => {
        if (can_reset) {
            setImages([]);
        }
    }, [can_reset]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { "image": ["*"] } });
    return (
        <div className='section-block w-full flex flex-col pb-8 mt-8'>
            <div className='font-semibold text-lg uppercase'>Image Gallery</div>
            <div className='w-full mt-2'>
                <div {...getRootProps({ className: 'flex items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded bg-gray-50 text-gray-500 cursor-pointer mb-5' })}>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                {images && <SortableList items={images} onSortEnd={onSortEnd} onRemove={removeImage} axis="xy" />}
            </div>
        </div>
    )
}

export default GalleryUploader
