import { Helpers } from '@/_lib/helpers';
import { MYSQLPropertyRepo } from '@/_repo/property_repo';
import { AddPropertyParams, APIResponseProps, CloneUnitParams, CustomFile, UpdatePropertyParams } from '@/components/types';
import AWS from 'aws-sdk';
import formidable from 'formidable';
import fs from 'fs';
import { NextApiRequest } from 'next';
import path from 'path';

const helpers = new Helpers();
const PropertyRepo = new MYSQLPropertyRepo();
export class PropertyService {

    s3 = new AWS.S3({
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
        region: process.env.NEXT_PUBLIC_AWS_REGION,
    });

    public uploadToS3 = (filePath: string, fileName: string): Promise<string> => {
        const fileContent = fs.readFileSync(filePath);

        // Determine the content type based on the file extension
        const ext = path.extname(fileName).toLowerCase();
        let contentType = 'application/octet-stream'; // Default content type
        if (ext === '.jpg' || ext === '.jpeg') {
            contentType = 'image/jpeg';
        } else if (ext === '.png') {
            contentType = 'image/png';
        } else if (ext === '.gif') {
            contentType = 'image/gif';
        }

        const params = {
            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME as string,
            Key: fileName,
            Body: fileContent,
            ContentType: contentType, // Set the correct content type
            ACL: 'public-read',
        };

        return new Promise((resolve, reject) => {
            this.s3.upload(params, (err:any, data:any) => {
                if (err) {
                    return reject(err);
                }
                resolve(data.Location);
            });
        });
    };

    // Function to delete an image from the S3 bucket
    public deleteS3Image = async (imageName: string): Promise<boolean> => {
        const params = {
            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME as string,
            Key: imageName,
        };

        try {
            const data = await this.s3.deleteObject(params).promise();
            console.log('Image successfully deleted', data);
            return true;
        } catch (err) {
            console.error('Unable to delete image', err);
            return false;
        }
    };

    private parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields, files: formidable.Files }> {
        const form = formidable({
            uploadDir: path.join(process.cwd(), 'tmp'),
            keepExtensions: true,
        });

        return new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    return reject(err);
                }
                resolve({ fields, files });
            });
        });
    }

    public async AddNewProperty(req: NextApiRequest): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try {
            
            const { fields, files } = await this.parseForm(req);

            // Safely access and parse the form_val field
            const formValStr = Array.isArray(fields.form_val) ? fields.form_val[0] : fields.form_val;
            let form_val: any;
            if (formValStr) {
                form_val = JSON.parse(formValStr as string);
            }

            const num_of_units = form_val.unit_data.length;
            const addParams : Partial<AddPropertyParams> = {
                property_type: form_val.property_type,
                total_units: num_of_units,
                property_name: form_val.property_name,
                address: form_val.address,
                state: form_val.state,
                zip_code: form_val.zip_code,
                city: form_val.city,
                neighborhood: form_val.neighborhood,
                country: form_val.country,
                latitude: form_val.latitude,
                longitude: form_val.longitude,
                year: form_val.year,
                mls_number: form_val.mls_number,
                pets_allowed: form_val.pets_allowed,
                max_num_of_pets: form_val.max_num_of_pets,
                each_pets_fee_per_month: helpers.formatDecimal(form_val.each_pets_fee_per_month),
                one_time_pets_fee: helpers.formatDecimal(form_val.one_time_pets_fee),
                weight_limit_and_restrictions: form_val.weight_limit_and_restrictions,
                prohibited_animals_and_breeds: form_val.prohibited_animals_and_breeds,
                prop_exterior_features: form_val.prop_exterior_features ? JSON.stringify(form_val.prop_exterior_features) : "[]",
                prop_amenities: form_val.prop_amenities ? JSON.stringify(form_val.prop_amenities) : "[]",
                neighborhood_overview: form_val.neighborhood_overview,
                parking_available: form_val.parking_available,
                parking_fee_required: form_val.parking_fee_required,
                parking_fee: helpers.formatDecimal(form_val.parking_fee),
                max_num_of_vehicle: form_val.max_num_of_vehicle,
                parking_descriptions: form_val.parking_descriptions,
                move_in_time: form_val.move_in_time,
                move_out_time: form_val.move_out_time,
                apartment_rules: form_val.apartment_rules ? JSON.stringify(form_val.apartment_rules) : "[]",
            }

            const unit_images = [];
            if(num_of_units > 0){

                for(let i=0; i<num_of_units; i++){

                    const uploadedUrls = [];
                    const uploadedFiles = files[`unit_${i}_images`] instanceof Array 
                    ? files[`unit_${i}_images`] 
                    : [files[`unit_${i}_images`] ];  

                    if(uploadedFiles && uploadedFiles.length > 0){
                        for (const file of uploadedFiles) {
                            const customFile = file as CustomFile;
                            if (customFile) {
                                const filePath = customFile.filepath;
                                const fileName = customFile.newFilename;
                                const fileUrl = await this.uploadToS3(filePath, fileName);
                                uploadedUrls.push(fileUrl);
                                fs.unlinkSync(filePath); // Clean up the file after upload
                            }
                        }
                    }

                    unit_images.push(uploadedUrls);
                }

            }
            
            let AddList: AddPropertyParams[] = [];
            for(let i=0; i<num_of_units; i++){

                const unit_data = form_val.unit_data[i];
                const this_unit: AddPropertyParams = {
                    ...addParams as AddPropertyParams,
                    unit_number: unit_data.unit_number,
                    beds: unit_data.beds,
                    baths: unit_data.baths,
                    listprice: helpers.formatDecimal(unit_data.listprice), 
                    size_sqft: helpers.formatDecimal(unit_data.size_sqft),
                    utilities_per_month: helpers.formatDecimal(unit_data.utilities_per_month),
                    service_fee: helpers.formatDecimal(unit_data.service_fee),
                    cleaning_and_stocking_fee: helpers.formatDecimal(unit_data.cleaning_and_stocking_fee),
                    insurance_fee: helpers.formatDecimal(unit_data.insurance_fee),
                    beds_list: unit_data.beds_list ? JSON.stringify(unit_data.beds_list) : "[]",
                    interior_features: unit_data.interior_features ? JSON.stringify(unit_data.interior_features) : "[]",
                    equipments: unit_data.equipments ? JSON.stringify(unit_data.equipments) : "[]",
                    utilities_includes: unit_data.utilities_includes,
                    unit_description: unit_data.unit_description, 
                    status: unit_data.status,
                    images: unit_images[i] ? JSON.stringify(unit_images[i]) : "[]",
                }

                AddList.push(this_unit);

            }

            const AddResp = await PropertyRepo.AddNewProperty(AddList);
            if(AddResp){
                default_rep.message = 'New property added successfully';
                default_rep.success = true;
            }

        } catch (error:any) {
            default_rep.message = `Error adding property: ${error.message}`;
        }
        
        return default_rep;

    }

    public async UpdateProperty(req: NextApiRequest): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try {
            
            const { fields } = await this.parseForm(req);

            // Safely access and parse the form_val field
            const formValStr = Array.isArray(fields.form_val) ? fields.form_val[0] : fields.form_val;
            let form_val: any;
            if (formValStr) {
                form_val = JSON.parse(formValStr as string);
            }

            const num_of_units = form_val.unit_data.length;
            const upParams : Partial<UpdatePropertyParams> = {
                property_id: form_val.property_id,
                property_type: form_val.original_property_type,
                original_mls_number: form_val.original_mls_number,
                total_units: num_of_units,
                property_name: form_val.property_name,
                address: form_val.address,
                state: form_val.state,
                zip_code: form_val.zip_code,
                city: form_val.city,
                neighborhood: form_val.neighborhood,
                country: form_val.country,
                latitude: form_val.latitude,
                longitude: form_val.longitude,
                year: form_val.year,
                mls_number: form_val.mls_number,
                pets_allowed: form_val.pets_allowed,
                max_num_of_pets: form_val.max_num_of_pets,
                each_pets_fee_per_month: helpers.formatDecimal(form_val.each_pets_fee_per_month),
                one_time_pets_fee: helpers.formatDecimal(form_val.one_time_pets_fee),
                weight_limit_and_restrictions: form_val.weight_limit_and_restrictions,
                prohibited_animals_and_breeds: form_val.prohibited_animals_and_breeds,
                prop_exterior_features: form_val.prop_exterior_features ? JSON.stringify(form_val.prop_exterior_features) : "[]",
                prop_amenities: form_val.prop_amenities ? JSON.stringify(form_val.prop_amenities) : "[]",
                neighborhood_overview: form_val.neighborhood_overview,
                parking_available: form_val.parking_available,
                parking_fee_required: form_val.parking_fee_required,
                parking_fee: helpers.formatDecimal(form_val.parking_fee),
                max_num_of_vehicle: form_val.max_num_of_vehicle,
                parking_descriptions: form_val.parking_descriptions,
                move_in_time: form_val.move_in_time,
                move_out_time: form_val.move_out_time,
                apartment_rules: form_val.apartment_rules ? JSON.stringify(form_val.apartment_rules) : "[]",
            }

            const unit_data = form_val.unit_data[0];
            const UpdateList: UpdatePropertyParams = {
                ...upParams as UpdatePropertyParams,
                unit_number: unit_data.unit_number,
                beds: unit_data.beds,
                baths: unit_data.baths,
                listprice: helpers.formatDecimal(unit_data.listprice), 
                size_sqft: helpers.formatDecimal(unit_data.size_sqft),
                utilities_per_month: helpers.formatDecimal(unit_data.utilities_per_month),
                service_fee: helpers.formatDecimal(unit_data.service_fee),
                cleaning_and_stocking_fee: helpers.formatDecimal(unit_data.cleaning_and_stocking_fee),
                insurance_fee: helpers.formatDecimal(unit_data.insurance_fee),
                beds_list: unit_data.beds_list ? JSON.stringify(unit_data.beds_list) : "[]",
                interior_features: unit_data.interior_features ? JSON.stringify(unit_data.interior_features) : "[]",
                equipments: unit_data.equipments ? JSON.stringify(unit_data.equipments) : "[]",
                utilities_includes: unit_data.utilities_includes,
                unit_description: unit_data.unit_description, 
                status: unit_data.status,
            }

            const UpdateResp = await PropertyRepo.UpdateProperty(UpdateList);
            if(UpdateResp){
                default_rep.message = 'Property info successfully updated';
                default_rep.success = true;
            }else{
                default_rep.message = 'Unable to update property info';
            }

        } catch (error:any) {
            default_rep.message = `Error updating property: ${error.message}`;
        }
        
        return default_rep;

    }

    public async CloneUnit(req: NextApiRequest): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try {
            
            const { fields } = await this.parseForm(req);

            // Safely access and parse the form_val field
            const formValStr = Array.isArray(fields.form_val) ? fields.form_val[0] : fields.form_val;
            let form_val: any;
            if (formValStr) {
                form_val = JSON.parse(formValStr as string);
            }

            const num_of_units = form_val.unit_data.length;
            const upParams : Partial<CloneUnitParams> = {
                property_id: form_val.property_id,
                property_type: form_val.original_property_type,
                original_mls_number: form_val.original_mls_number,
                total_units: num_of_units,
                property_name: form_val.property_name,
                address: form_val.address,
                state: form_val.state,
                zip_code: form_val.zip_code,
                city: form_val.city,
                neighborhood: form_val.neighborhood,
                country: form_val.country,
                latitude: form_val.latitude,
                longitude: form_val.longitude,
                year: form_val.year,
                mls_number: form_val.mls_number,
                pets_allowed: form_val.pets_allowed,
                max_num_of_pets: form_val.max_num_of_pets,
                each_pets_fee_per_month: helpers.formatDecimal(form_val.each_pets_fee_per_month),
                one_time_pets_fee: helpers.formatDecimal(form_val.one_time_pets_fee),
                weight_limit_and_restrictions: form_val.weight_limit_and_restrictions,
                prohibited_animals_and_breeds: form_val.prohibited_animals_and_breeds,
                prop_exterior_features: form_val.prop_exterior_features ? JSON.stringify(form_val.prop_exterior_features) : "[]",
                prop_amenities: form_val.prop_amenities ? JSON.stringify(form_val.prop_amenities) : "[]",
                neighborhood_overview: form_val.neighborhood_overview,
                parking_available: form_val.parking_available,
                parking_fee_required: form_val.parking_fee_required,
                parking_fee: helpers.formatDecimal(form_val.parking_fee),
                max_num_of_vehicle: form_val.max_num_of_vehicle,
                parking_descriptions: form_val.parking_descriptions,
                move_in_time: form_val.move_in_time,
                move_out_time: form_val.move_out_time,
                apartment_rules: form_val.apartment_rules ? JSON.stringify(form_val.apartment_rules) : "[]",
            }
            
            const NumUnits = await PropertyRepo.CountUnits(form_val.original_mls_number);
            const NewUnits = NumUnits + 1;

            const unit_data = form_val.unit_data[0];
            const UpdateList: CloneUnitParams = {
                ...upParams as CloneUnitParams,
                unit_number: unit_data.unit_number,
                total_units: NewUnits,
                beds: unit_data.beds,
                baths: unit_data.baths,
                listprice: helpers.formatDecimal(unit_data.listprice), 
                size_sqft: helpers.formatDecimal(unit_data.size_sqft),
                utilities_per_month: helpers.formatDecimal(unit_data.utilities_per_month),
                service_fee: helpers.formatDecimal(unit_data.service_fee),
                cleaning_and_stocking_fee: helpers.formatDecimal(unit_data.cleaning_and_stocking_fee),
                insurance_fee: helpers.formatDecimal(unit_data.insurance_fee),
                beds_list: unit_data.beds_list ? JSON.stringify(unit_data.beds_list) : "[]",
                interior_features: unit_data.interior_features ? JSON.stringify(unit_data.interior_features) : "[]",
                equipments: unit_data.equipments ? JSON.stringify(unit_data.equipments) : "[]",
                utilities_includes: unit_data.utilities_includes,
                unit_description: unit_data.unit_description,
            }

            const UpdateResp = await PropertyRepo.CloneUnit(UpdateList);
            if(UpdateResp){
                default_rep.message = 'Unit successfully cloned';
                default_rep.success = true;
            }else{
                default_rep.message = 'Unable to clone unit';
            }

        } catch (error:any) {
            default_rep.message = `Error cloning unit: ${error.message}`;
        }
        
        return default_rep;

    }

    public async LoadProperties(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const type = params.type;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!type){
            default_resp.message = "Invalid request."
            return default_resp as APIResponseProps
        }

        const properties = await PropertyRepo.LoadProperties(req);
        return properties;

    }

    public async LoadUserEndProperties(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const search_by = params.search_by;
        const neighborhood = params.neighborhood;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!search_by){
            default_resp.message = "Invalid request.."
            return default_resp as APIResponseProps
        } 

        if(search_by== "Map" && !neighborhood){
            default_resp.message = "Invalid request."
            return default_resp as APIResponseProps
        } 

        const [search_filter, order_by] = helpers.BuildSearchFilterForJoins(req);
        const prop_prms = PropertyRepo.LoadUserEndProperties(req, search_filter, order_by);
        const properties = await prop_prms;
        default_resp.success = true;
        default_resp.data = {properties: properties, search_filter: search_filter};

        return default_resp;

    }

    public async LoadSingleProperty (req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const property_id = params.property_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!property_id){
            default_resp.message = "Invalid request."
            return default_resp as APIResponseProps;
        }

        const property = await PropertyRepo.LoadSingleProperty(req);
        return property;

    }

    public async AddPropertyImage(req: NextApiRequest): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        try {
            
            const { fields, files } = await this.parseForm(req);

            // Safely access and parse the form_val field
            const formValStr = Array.isArray(fields.form_val) ? fields.form_val[0] : fields.form_val;
            let form_val: any;
            if (formValStr) {
                form_val = JSON.parse(formValStr as string);
            }

            const property_id = form_val.property_id;
            const old_images = form_val.old_images;

            const uploadedUrls = [];
            const uploadedFiles = files[`images`] instanceof Array ? files[`images`] : [files[`images`] ];  

            if(uploadedFiles && uploadedFiles.length > 0){
                for (const file of uploadedFiles) {
                    const customFile = file as CustomFile;
                    if (customFile) {
                        const filePath = customFile.filepath;
                        const fileName = customFile.newFilename;
                        const fileUrl = await this.uploadToS3(filePath, fileName);
                        uploadedUrls.push(fileUrl);
                        fs.unlinkSync(filePath); // Clean up the file after upload
                    }
                }
            }

            const NewImages = Array.isArray(old_images) ? [...old_images, ...uploadedUrls] : uploadedUrls; 
            const AddResp = await PropertyRepo.AddPropertyImage(property_id, NewImages.flat());
            if(AddResp){
                default_rep.message = 'New image(s) successfully added';
                default_rep.success = true;
                default_rep.data = {"new_images": NewImages};
            }

        } catch (error:any) {
            default_rep.message = `Error adding property: ${error.message}`;
        }
        
        return default_rep;

    }

    public async RearrangeImage(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const prop_images = params.prop_images;
        const property_id = params.property_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!prop_images || !property_id){
            default_resp.message = "Invalid request."
            return default_resp as APIResponseProps;
        }

        const resp = await PropertyRepo.RearrangeImage(prop_images, property_id);
        default_resp.success = resp;
        if(resp){
            default_resp.message = "Gallery successfully rearranged";
        }else{
            default_resp.message = "Unable to rearrange gallery";
        }

        return default_resp;

    }

    public async DeleteImage(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        let image_to_delete = params.image_to_delete;
        image_to_delete = image_to_delete.replace("https://website-upload.s3.amazonaws.com/", "");
        const prop_images = params.prop_images;
        const property_id = params.property_id;
        
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!image_to_delete || !property_id || !prop_images){
            default_resp.message = "Invalid request."
            return default_resp as APIResponseProps;
        }

        let new_images = prop_images;
        if(Array.isArray(prop_images)){
            new_images = prop_images.filter((val)=> val!= `https://website-upload.s3.amazonaws.com/${image_to_delete}`);
        }else{
            default_resp.message = "Invalid image posted."
            return default_resp as APIResponseProps;
        }

        const deImage = await this.deleteS3Image(image_to_delete);
        if(!deImage){
            default_resp.message = "Unabe to delete image."
            return default_resp as APIResponseProps;
        }

        //RearrangeImage() just updates images
        const resp = await PropertyRepo.RearrangeImage(new_images, property_id);
        default_resp.success = resp;
        if(resp){
            default_resp.message = "Image successfully deleted";
            default_resp.data = {"new_images": new_images};
        }else{
            default_resp.message = "Unable to delete image";
        }

        return default_resp;

    }

    public async DeleteProperty(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const property_id = params.property_id;
        
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!property_id){
            default_resp.message = "Invalid request."
            return default_resp as APIResponseProps;
        }

        const property = await PropertyRepo.LoadSingleProperty(req);
        if(!property.success){
            default_resp.message = "Unabe to load property info."
            return default_resp as APIResponseProps;
        }
        
        let images = property.data.images;
        const mls_number = property.data.mls_number;
        const total_units = parseInt(property.data.total_units);
        const new_units = total_units - 1;
        let property_type = property.data.property_type;
        if(typeof images == "string"){
            images = JSON.parse(images);
        }

        if(Array.isArray(images)){
            for(const image of images){
                if(image){
                    const image_to_delete = image.replace("https://website-upload.s3.amazonaws.com/", "");
                    await this.deleteS3Image(image_to_delete);
                }
            }
        }

        let prop_type = "Property";
        if(property_type == "Multi Unit Type"){
            prop_type = "Unit";
        }

        const del_resp = await PropertyRepo.DeleteProperty(property_id);
        if(del_resp){
             
            if(property_type == "Multi Unit Type" && new_units > 0){
                const up_resp = await PropertyRepo.UpdatePropUnitCount(mls_number, new_units);
            }

            default_resp.success = true;
            default_resp.message = "Property successfully deleted";
        }else{
            default_resp.message = `Unable to delete ${prop_type.toLowerCase()}`;
        }

        return default_resp;

    }

    public async UpdateStatus(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const property_id = params.property_id;
        const status = params.status;
        const mls_number = params.mls_number;
        const property_type = params.mls_number;
        
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!property_id || !status || !property_id){
            default_resp.message = "Invalid request."
            return default_resp as APIResponseProps;
        }
 
        const update_resp = await PropertyRepo.UpdatePropStatus(property_id, status);
        if(update_resp){
             
            if(property_type == "Multi Unit Type"){
                const vac_resp = await PropertyRepo.UpdateVacantCount(mls_number);
                console.log("vac_resp", vac_resp)
            }

            default_resp.success = true;
            default_resp.message = "Status successfully updated";
        }else{
            default_resp.message = `Unable to update status}`;
        }

        return default_resp;

    }

    public async LoadCities(req: NextApiRequest): Promise<APIResponseProps>{

        const property = await PropertyRepo.LoadCities(req);
        return property;

    }

    public async QuickFiltersCount(req: NextApiRequest): Promise<APIResponseProps>{
 
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const [search_filter, order_by] = helpers.BuildSearchFilterForJoins(req);
        const filters_prms = PropertyRepo.QuickFiltersCount(req, search_filter, order_by);
        const total_filters = await filters_prms;
        default_resp.success = true;
        default_resp.data = {total_filters: total_filters, search_filter: search_filter};

        return default_resp;

    }


    public async UpdateFavorites(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const property_id = req_body.property_id;
        const user_id = req_body.user_id;
        const type = req_body.type;
        
        if(!property_id || property_id == "" || !user_id || user_id == "" || !type || type == ""){
            default_resp.message = "Fatal error.";
        }else{
            
            const fav_prms = PropertyRepo.UpdateFavorites(req);
            const favorites = await fav_prms;
            default_resp.success = true;
            default_resp.data = {favorites: favorites};

        }

        return default_resp;

    }

}