import { AddPropertyParams, APIResponseProps, CloneUnitParams, PropertyLists, UpdatePropertyParams } from "@/components/types";
import pool from "@/_lib/db_conn";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";
import { NextApiRequest } from "next";

export interface PropertyRepo { 
    AddNewProperty(properties: AddPropertyParams[]): Promise<boolean>
    LoadProperties(req: NextApiRequest): Promise<APIResponseProps>
    UpdateProperty(property: UpdatePropertyParams): Promise<boolean>
    CountUnits(mls_number: any): Promise<number>
    AddPropertyImage(property_id: number, images: any[]): Promise<boolean>
    RearrangeImage(prop_images: any, property_id: number): Promise<boolean>
    DeleteProperty(property_id: number): Promise<boolean>
    UpdatePropUnitCount(mls_number: string, new_units: number): Promise<boolean>
    UpdatePropStatus(property_id: string, status: string): Promise<boolean>
    CountOccupiedUnits(mls_number: any): Promise<number>
    UpdateVacantCount(mls_number: string): Promise<boolean>
    LoadCities(req: NextApiRequest): Promise<APIResponseProps>
    QuickFiltersCount(req: NextApiRequest, search_filter: string, order_by: string): Promise<number>
    LoadUserEndProperties(req: NextApiRequest, search_filter: string, order_by: string): Promise<any> 
    UpdateFavorites(req: NextApiRequest): Promise<any[]>
}

export class MYSQLPropertyRepo implements PropertyRepo {

    public async AddNewProperty(properties: AddPropertyParams[]): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();

            let placeholders = '';
            // Array to hold the flattened values
            const values:any = [];

            // Dynamically create the query string with placeholders and fill the values array
             properties.map((property, index) => {
                const { property_type, total_units, unit_number, property_name, address, state, zip_code, city, neighborhood, country, 
                    latitude, longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, each_pets_fee_per_month, 
                    one_time_pets_fee, weight_limit_and_restrictions, prohibited_animals_and_breeds, prop_exterior_features, 
                    prop_amenities, unit_description, neighborhood_overview, parking_available, parking_fee_required, parking_fee, 
                    max_num_of_vehicle, parking_descriptions, move_in_time, move_out_time, apartment_rules, utilities_includes, beds, 
                    baths, listprice, size_sqft, utilities_per_month, service_fee, cleaning_and_stocking_fee, insurance_fee, beds_list, 
                    interior_features, equipments, status, images } = property;
                
                    values.push(property_type, total_units, unit_number, property_name, address, state, zip_code, city, neighborhood,
                    country, latitude, longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, 
                    each_pets_fee_per_month, one_time_pets_fee, weight_limit_and_restrictions, prohibited_animals_and_breeds, 
                    prop_exterior_features, prop_amenities, unit_description, neighborhood_overview, parking_available, 
                    parking_fee_required, parking_fee, max_num_of_vehicle, parking_descriptions, move_in_time, move_out_time, 
                    apartment_rules, utilities_includes, beds, baths, listprice, size_sqft, utilities_per_month, service_fee, 
                    cleaning_and_stocking_fee, insurance_fee, beds_list, interior_features, equipments, status, images, date);
                
                //count the destructed fields
                const valueLen = Object.keys({ property_type, total_units, unit_number, property_name, address, state, zip_code, city, 
                    neighborhood, country, latitude, longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, 
                    each_pets_fee_per_month, one_time_pets_fee, weight_limit_and_restrictions, prohibited_animals_and_breeds, 
                    prop_exterior_features, prop_amenities, unit_description, neighborhood_overview, parking_available, 
                    parking_fee_required, parking_fee, max_num_of_vehicle, parking_descriptions, move_in_time, move_out_time, 
                    apartment_rules, utilities_includes, beds, baths, listprice, size_sqft, utilities_per_month, service_fee, 
                    cleaning_and_stocking_fee, insurance_fee, beds_list, interior_features, equipments, status, 
                    images }).length;

                const fill = Array(valueLen + 1).fill("?").join(","); //+1 for date
                // Add the placeholders for this property
                placeholders += `(${fill})`; //last one for date

                // Add a comma if this is not the last property
                if (index < properties.length - 1) {
                    placeholders += `, `;
                }
            });
            
            // console.log("values length", values.length, "placeholders length", placeholders.split(",").length, 
            // "placeholders", placeholders, "properties.length", properties.length)
            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO properties(property_type, total_units, unit_number, property_name, address, state, zip_code, city, neighborhood,
                country, latitude, longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, each_pets_fee_per_month, 
                one_time_pets_fee, weight_limit_and_restrictions, prohibited_animals_and_breeds, prop_exterior_features, prop_amenities, 
                unit_description, neighborhood_overview, parking_available, parking_fee_required, parking_fee, max_num_of_vehicle, 
                parking_descriptions, move_in_time, move_out_time, apartment_rules, utilities_includes, beds, baths, listprice, 
                size_sqft, utilities_per_month, service_fee, cleaning_and_stocking_fee, insurance_fee, beds_list, interior_features, 
                equipments, status, images, date_added) VALUES ${placeholders}`, [...values]
            );

            if(result.affectedRows>0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateProperty(property: UpdatePropertyParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            let updateResult: ResultSetHeader;
            connection = await pool.getConnection();
            
            const { property_id, property_type, original_mls_number, unit_number, property_name, address, state, zip_code, city, 
                neighborhood, country, latitude, longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, 
                each_pets_fee_per_month, one_time_pets_fee, weight_limit_and_restrictions, prohibited_animals_and_breeds, 
                prop_exterior_features, prop_amenities, unit_description, neighborhood_overview, parking_available, parking_fee_required, 
                parking_fee, max_num_of_vehicle, parking_descriptions, move_in_time, move_out_time, apartment_rules, utilities_includes, 
                beds, baths, listprice, size_sqft, utilities_per_month, service_fee, cleaning_and_stocking_fee, insurance_fee, beds_list, 
                interior_features, equipments, status } = property;
            
            if(property_type == "Single Unit Type") {

                const values:any = [unit_number, property_name, address, state, zip_code, city, neighborhood, country, latitude, 
                longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, each_pets_fee_per_month, one_time_pets_fee, 
                weight_limit_and_restrictions, prohibited_animals_and_breeds, prop_exterior_features, prop_amenities, unit_description, 
                neighborhood_overview, parking_available, parking_fee_required, parking_fee, max_num_of_vehicle, parking_descriptions, 
                move_in_time, move_out_time, apartment_rules, utilities_includes, beds, baths, listprice, size_sqft, utilities_per_month, 
                service_fee, cleaning_and_stocking_fee, insurance_fee, beds_list, interior_features, equipments, status, property_id];
            
                [updateResult] = await connection.query<ResultSetHeader>(` 
                    UPDATE properties SET unit_number=?, property_name=?, address=?, state=?, zip_code=?, city=?, neighborhood=?, country=?, 
                    latitude=?, longitude=?, year=?, mls_number=?, unit_mls_number=?, pets_allowed=?, max_num_of_pets=?, 
                    each_pets_fee_per_month=?, one_time_pets_fee=?, weight_limit_and_restrictions=?, prohibited_animals_and_breeds=?, 
                    prop_exterior_features=?, prop_amenities=?, unit_description=?, neighborhood_overview=?, parking_available=?, 
                    parking_fee_required=?, parking_fee=?, max_num_of_vehicle=?, parking_descriptions=?, move_in_time=?, move_out_time=?, 
                    apartment_rules=?, utilities_includes=?, beds=?, baths=?, listprice=?, size_sqft=?, utilities_per_month=?, 
                    service_fee=?, cleaning_and_stocking_fee=?, insurance_fee=?, beds_list=?, interior_features=?, equipments=?, 
                    status=? WHERE property_id=?`, 
                    [...values]
                );

            }else{

                const values:any = [property_name, address, state, zip_code, city, neighborhood, country, latitude, longitude, year, 
                mls_number, pets_allowed, max_num_of_pets, each_pets_fee_per_month, one_time_pets_fee, weight_limit_and_restrictions, 
                prohibited_animals_and_breeds, prop_exterior_features, prop_amenities, neighborhood_overview, 
                parking_available, parking_fee_required, parking_fee, max_num_of_vehicle, parking_descriptions, move_in_time, 
                move_out_time, apartment_rules, original_mls_number];
                 
                //Update whole property with mls_number
                [updateResult] = await connection.query<ResultSetHeader>(` 
                    UPDATE properties SET property_name=?, address=?, state=?, zip_code=?, city=?, neighborhood=?, country=?, 
                    latitude=?, longitude=?, year=?, mls_number=?, pets_allowed=?, max_num_of_pets=?, 
                    each_pets_fee_per_month=?, one_time_pets_fee=?, weight_limit_and_restrictions=?, prohibited_animals_and_breeds=?, 
                    prop_exterior_features=?, prop_amenities=?, neighborhood_overview=?, parking_available=?, 
                    parking_fee_required=?, parking_fee=?, max_num_of_vehicle=?, parking_descriptions=?, move_in_time=?, move_out_time=?, 
                    apartment_rules=? WHERE mls_number=?`, 
                    [...values]
                );
                
                const values_2:any = [unit_number, unit_mls_number, unit_description, utilities_includes, beds, baths, listprice, 
                size_sqft, utilities_per_month, service_fee, cleaning_and_stocking_fee, insurance_fee, beds_list, interior_features, 
                equipments, status, property_id];
                apartment_rules
                //Update individual unit
                const [updateResult2] = await connection.query<ResultSetHeader>(` 
                    UPDATE properties SET unit_number=?, unit_mls_number=?, unit_description=?, utilities_includes=?, beds=?, baths=?, 
                    listprice=?, size_sqft=?, utilities_per_month=?, service_fee=?, cleaning_and_stocking_fee=?, insurance_fee=?, 
                    beds_list=?, interior_features=?, equipments=?, status=? WHERE property_id=?`, 
                    [...values_2]
                );
            }

            

            if(updateResult.affectedRows >= 0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadProperties(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const type = params.type;
        let connection: PoolConnection | null = null;
        let rows: RowDataPacket[] = [];

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        try{
            
            connection = await pool.getConnection();
            
            if(type =="Property Lists") {
                
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;

                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM properties) 
                AS total_records FROM properties LIMIT ${start_from}, ${limit}`);

            }else if(type =="Other Units") {
                
                const mls_number = params.mls_number;
                const property_id = params.property_id;

                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM properties WHERE mls_number=? AND property_id!=?`, [mls_number, property_id]);
            
            }
            

            // const [rows] = await connection.query<RowDataPacket[]>(`SELECT p.*, t.total_records FROM properties p 
            // JOIN (SELECT mls_number, COUNT(*) AS total_records FROM properties GROUP BY mls_number) t ON p.mls_number=t.mls_number
            // GROUP BY p.mls_number LIMIT ${start_from}, ${limit}`);

            const formattedRows = rows.map((row) => {
                return {
                    ...row,
                } as PropertyLists
            });
            
            default_resp.success = true;
            default_resp.data = formattedRows;
            return default_resp;

        }catch(e:any){

            console.log("e.sqlMessage", e.sqlMessage)
            default_resp.message = e.sqlMessage;
            return default_resp;
            
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadSingleProperty(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const property_id = params.property_id;
        let connection: PoolConnection | null = null;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM properties WHERE property_id='${property_id}'`);

            const formattedRows = rows.map((row) => {
                return {
                    ...row,
                } as PropertyLists
            });
            
            if(formattedRows.length > 0) {
                default_resp.success = true;
                default_resp.data = formattedRows[0];
            }

            return default_resp;

        }catch(e:any){

            console.log("e.sqlMessage", e.sqlMessage)
            default_resp.message = e.sqlMessage;
            return default_resp;
            
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async CountUnits(mls_number: any): Promise<number>{

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties 
                WHERE mls_number='${mls_number}'`);

                if(rows.length > 0){
                    return rows[0].total_records;
                }else{
                    return 0;        
                }

        }catch(e:any){

            console.log("e.sqlMessage", e.sqlMessage)
            return 0;
            
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async CloneUnit(property: CloneUnitParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();

            let placeholders = '';
            // Array to hold the flattened values
            const values:any = [];

            // Dynamically create the query string with placeholders and fill the values array
            const { property_type, original_mls_number, total_units, unit_number, property_name, address, state, zip_code, city, 
                neighborhood, country, latitude, longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, 
                each_pets_fee_per_month, one_time_pets_fee, weight_limit_and_restrictions, prohibited_animals_and_breeds, 
                prop_exterior_features, prop_amenities, unit_description, neighborhood_overview, parking_available, parking_fee_required, 
                parking_fee, max_num_of_vehicle, parking_descriptions, move_in_time, move_out_time, apartment_rules, utilities_includes, 
                beds, baths, listprice, size_sqft, utilities_per_month, service_fee, cleaning_and_stocking_fee, insurance_fee, beds_list, 
                interior_features, equipments, images 
            } = property;
            
            const update_values:any = [property_name, total_units, address, state, zip_code, city, neighborhood, country, latitude, 
                longitude, year, mls_number, pets_allowed, max_num_of_pets, each_pets_fee_per_month, one_time_pets_fee, 
                weight_limit_and_restrictions, prohibited_animals_and_breeds, prop_exterior_features, prop_amenities, 
                neighborhood_overview, parking_available, parking_fee_required, parking_fee, max_num_of_vehicle, parking_descriptions, 
                move_in_time, move_out_time, apartment_rules, original_mls_number];
                 
            //Update whole property with mls_number
            const [updateResult] = await connection.query<ResultSetHeader>(` 
                UPDATE properties SET property_name=?, total_units=?, address=?, state=?, zip_code=?, city=?, neighborhood=?, country=?, 
                latitude=?, longitude=?, year=?, mls_number=?, pets_allowed=?, max_num_of_pets=?, each_pets_fee_per_month=?, 
                one_time_pets_fee=?, weight_limit_and_restrictions=?, prohibited_animals_and_breeds=?, prop_exterior_features=?, 
                prop_amenities=?, neighborhood_overview=?, parking_available=?, parking_fee_required=?, parking_fee=?, 
                max_num_of_vehicle=?, parking_descriptions=?, move_in_time=?, move_out_time=?, apartment_rules=? WHERE mls_number=?`, 
                [...update_values]
            );

            values.push(property_type, total_units, unit_number, property_name, address, state, zip_code, city, neighborhood, country, 
            latitude, longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, each_pets_fee_per_month, 
            one_time_pets_fee, weight_limit_and_restrictions, prohibited_animals_and_breeds, prop_exterior_features, prop_amenities, 
            unit_description, neighborhood_overview, parking_available, parking_fee_required, parking_fee, max_num_of_vehicle, 
            parking_descriptions, move_in_time, move_out_time, apartment_rules, utilities_includes, beds, baths, listprice, size_sqft, 
            utilities_per_month, service_fee, cleaning_and_stocking_fee, insurance_fee, beds_list, interior_features, equipments, 
            images, date);
            
            //count the destructed fields
            const valueLen = Object.keys({ property_type, total_units, unit_number, property_name, address, state, zip_code, city, 
                neighborhood, country, latitude, longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, 
                each_pets_fee_per_month, one_time_pets_fee, weight_limit_and_restrictions, prohibited_animals_and_breeds, 
                prop_exterior_features, prop_amenities, unit_description, neighborhood_overview, parking_available, 
                parking_fee_required, parking_fee, max_num_of_vehicle, parking_descriptions, move_in_time, move_out_time, 
                apartment_rules, utilities_includes, beds, baths, listprice, size_sqft, utilities_per_month, service_fee, 
                cleaning_and_stocking_fee, insurance_fee, beds_list, interior_features, equipments, images }).length;

            const fill = Array(valueLen + 1).fill("?").join(","); //+1 for date
            // Add the placeholders for this property
            placeholders += `(${fill})`; //last one for date
 
            
            // console.log("values length", values.length, "placeholders length", placeholders.split(",").length, 
            // "placeholders", placeholders, "properties.length", properties.length)
            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO properties(property_type, total_units, unit_number, property_name, address, state, zip_code, city, 
                neighborhood, country, latitude, longitude, year, mls_number, unit_mls_number, pets_allowed, max_num_of_pets, 
                each_pets_fee_per_month, one_time_pets_fee, weight_limit_and_restrictions, prohibited_animals_and_breeds, 
                prop_exterior_features, prop_amenities, unit_description, neighborhood_overview, parking_available, parking_fee_required, 
                parking_fee, max_num_of_vehicle, parking_descriptions, move_in_time, move_out_time, apartment_rules, utilities_includes, 
                beds, baths, listprice, size_sqft, utilities_per_month, service_fee, cleaning_and_stocking_fee, insurance_fee, beds_list, 
                interior_features, equipments, images, date_added) VALUES ${placeholders}`, [...values]
            );

            if(result.affectedRows>0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }
    
    public async AddPropertyImage(property_id: number, images: any[]): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();

            const [updateResult] = await connection.query<ResultSetHeader>(` 
                    UPDATE properties SET images=? WHERE property_id=?`, [JSON.stringify(images), property_id]
                );

            if(updateResult.affectedRows>0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async RearrangeImage(prop_images: any, property_id: number): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [updateResult] = await connection.query<ResultSetHeader>(` 
                UPDATE properties SET images=? WHERE property_id=?`, [JSON.stringify(prop_images), property_id]
            );
 
            if(updateResult.affectedRows > 0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async DeleteProperty(property_id: number): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [updateResult] = await connection.query<ResultSetHeader>(`DELETE FROM properties WHERE property_id=?`, [property_id]);
 
            if(updateResult.affectedRows > 0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdatePropUnitCount(mls_number: string, new_units: number): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [updateResult] = await connection.query<ResultSetHeader>(` 
                UPDATE properties SET total_units=? WHERE mls_number=?`, [new_units, mls_number]
            );
 
            if(updateResult.affectedRows > 0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdatePropStatus(property_id: string, status: string): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [updateResult] = await connection.query<ResultSetHeader>(` 
                UPDATE properties SET status=? WHERE property_id=?`, [status, property_id]
            );
 
            if(updateResult.affectedRows > 0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async CountOccupiedUnits(mls_number: any): Promise<number>{

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties 
                WHERE mls_number='${mls_number}' AND status='Occupied'`);

                if(rows.length > 0){
                    return rows[0].total_records;
                }else{
                    return 0;        
                }

        }catch(e:any){

            console.log("e.sqlMessage", e.sqlMessage)
            return 0;
            
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateVacantCount(mls_number: string): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const occupied = await this.CountOccupiedUnits(mls_number);
            console.log("occupied", occupied, "mls_number", mls_number)
            const [updateResult] = await connection.query<ResultSetHeader>(` 
                UPDATE properties SET units_occupied=? WHERE mls_number=?`, [occupied, mls_number]
            );
 
            if(updateResult.affectedRows > 0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadCities(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        let connection: PoolConnection | null = null;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        try{
            
            connection = await pool.getConnection(); 
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT neighborhood FROM properties GROUP BY neighborhood`); 

            const formattedRows = rows.map((row) => {
                return row["neighborhood"]
            });
            
            default_resp.success = true;
            default_resp.data = formattedRows;
            return default_resp;

        }catch(e:any){

            console.log("e.sqlMessage", e.sqlMessage)
            default_resp.message = e.sqlMessage;
            return default_resp;
            
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async QuickFiltersCount(req: NextApiRequest, search_filter: string, order_by: string): Promise<number> {

        const params = req.body;
        const move_in = params.move_in;
        const move_out = params.move_out; 

        let connection: PoolConnection | null = null;
        try {
            
            connection = await pool.getConnection();
            
            const [total_row] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties AS p
            WHERE (p.latitude!='' AND p.latitude IS NOT NULL) AND (p.longitude!='' AND p.longitude IS NOT NULL) ${search_filter}
            AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.property_id=p.property_id AND r.move_in <= '${move_out}' AND 
            r.move_out > '${move_in}') `); 

            let total_records = 0;
            if(total_row.length){
                total_records = total_row[0]["total_records"];
            }

            return total_records;

        } catch (error) {
            return 0;
        }finally{
            if (connection) { 
                connection.release();
            }
        }
               

    }

    public async LoadUserEndProperties(req: NextApiRequest, search_filter: string, order_by: string): Promise<any> {

        const params = req.body;
        const search_by = params.search_by;
        let rows: any[] = [];
        let total_row: any[] = [];
        let list_rows: any[] = [];
            
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const page = params.page;
            const limit = params.limit;
            const start_from = (page - 1) * limit;

            let fields = `p.property_id, p.property_type, p.total_units, p.unit_number, p.property_name, p.address, p.state, p.zip_code, 
            p.city, p.neighborhood, p.latitude, p.longitude, p.mls_number, p.beds, p.baths, p.listprice, p.size_sqft, 
            p.utilities_per_month, p.status, p.images`;

            let query = "";
            if(search_by == "List"){

                // [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties WHERE Status='Active' ${search_filter} 
                // ORDER BY ${order_by} LIMIT ${start_from}, ${limit}`);

                // [total_row] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties WHERE Status='Active' ${search_filter} `);
                
                [[rows], [total_row]] = await Promise.all([
                    connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties WHERE Status='Active' ${search_filter} ORDER BY ${order_by} LIMIT ${start_from}, ${limit}`),
                    connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties WHERE Status='Active' ${search_filter} `),
                ])

            } else if(search_by == "Favorites-Active" || search_by == "Favorites-Sold"){
                
                const user_id  = params.user_id;
                fields = fields.replace(/,/gi, "")
                const field_array = fields.split(",");
                const fieldsRslt = field_array.map(entry => 'L.' + entry).join(', ');
                
                [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fieldsRslt}, (SELECT COUNT(*) AS total_records FROM properties AS L 
                JOIN favorites AS F on L.property_id=F.property_id WHERE F.user_id='${user_id}') AS total_records FROM properties AS L 
                JOIN favorites AS F on L.property_id=F.property_id WHERE F.user_id='${user_id}' LIMIT ${start_from}, ${limit}`);
            
            } else if(search_by == "Map"){
                
                const north = params.map_bounds.north;
                const south = params.map_bounds.south;
                const east = params.map_bounds.east;
                const west = params.map_bounds.west;

                let map_filter = `p.latitude>=${south} AND p.latitude<=${north} AND p.longitude<=${east} AND p.longitude>=${west}`;
                let drawn_filter = "";
                if(params.poly_list.length > 0){

                    // Convert each point to the format required by MySQL
                    const formattedPoints = params.poly_list.map((point: string) => {
                    const [latitude, longitude] = point.split(',').map(parseFloat);
                        return `${latitude.toFixed(6)} ${longitude.toFixed(6)} `;
                    });

                    // Close the polygon by adding the first point at the end
                    formattedPoints.push(formattedPoints[0]);
                    
                    // Join the points to create the polygon string
                    const snappedPoly = formattedPoints.join(',');

                    map_filter = ` ST_CONTAINS(ST_GeomFromText('POLYGON((${snappedPoly}))'), POINT(p.latitude, p.longitude))`;
                    drawn_filter = ` AND ${map_filter}`;
                }

                if(params.mobile_view == "Map"){
                    
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties AS p WHERE p.status='Vacant' ${search_filter} AND ${map_filter} 
                    AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.property_id=p.property_id AND r.move_in <= '${params.move_out}' 
                    AND r.move_out > '${params.move_in}') ORDER BY ${order_by} LIMIT 500`);

                }
                
                if((params.mobile_view == "List" && params.screen_width <= 960) || (params.mobile_view == "Map" && params.screen_width > 960)){
                    
                    [list_rows] = await connection.query<RowDataPacket[]>(`SELECT ${fields} FROM properties AS p WHERE p.status='Vacant' ${search_filter} 
                    ${drawn_filter} AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.property_id=p.property_id 
                    AND r.move_in <= '${params.move_out}' AND r.move_out > '${params.move_in}') 
                    ORDER BY ${order_by} LIMIT ${start_from}, ${limit}`);
                    //AND Latitude>=$minLat AND Latitude<=$maxLat AND Longitude<=$maxLng AND Longitude>=$minLng
                    
                    [total_row] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties AS p 
                    WHERE p.status='Vacant' AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.property_id=p.property_id 
                    AND r.move_in <= '${params.move_out}' AND r.move_out > '${params.move_in}') ${search_filter} ${drawn_filter}`);
                }

            }else{
                console.log("Invalid search type:", search_by)
            }
            
            let total_records = 0;
            if(total_row.length){
                total_records = total_row[0]["total_records"];
            }

            if(search_by == "Map"){

                if(rows.length || list_rows.length){
                    
                    const formattedRows = rows.map((row) => {
                        
                        ["beds_list", "prop_exterior_features", "prop_amenities", "interior_features", "equipments", "apartment_rules", "images"].map((column)=>{
                            if(row[column] && row[column].length && typeof row[column] === 'string'){
                                row[column] = JSON.parse(row[column]);
                            }
                        })

                        // if(row.Images && row.Images.length && typeof row.Images === 'string'){
                        //     row.Images = JSON.parse(row.Images);
                        // }
                        
                        return {
                            ...row,
                            total_records: total_records,
                        }

                    });

                    const formattedLists = list_rows.map((l_row) => {

                         ["beds_list", "prop_exterior_features", "prop_amenities", "interior_features", "equipments", "apartment_rules", "images"].map((column)=>{
                            if(l_row[column] && l_row[column].length && typeof l_row[column] === 'string'){
                                l_row[column] = JSON.parse(l_row[column]);
                            }
                        })

                        // if(l_row.Images && l_row.Images.length && typeof l_row.Images === 'string'){
                        //     l_row.Images = JSON.parse(l_row.Images);
                        // }

                        return {
                            ...l_row,
                            total_records: total_records,
                        }
                    });

                    return {"map_data":formattedRows, "list_data": formattedLists, total_records: total_records, "query": query}
                    //return formattedRows;
                }else{
                    return [];
                }

            } else{

                console.log("Process time:",moment().format("HH:mm:ss"));
                if(rows.length){
                    const formattedRows = rows.map((row) => {
                        
                        if(row.Images && row.Images.length && typeof row.Images === 'string'){
                            row.Images = JSON.parse(row.Images);
                        }

                        return {
                            ...row,
                            total_records: total_records,
                        }

                    });

                    console.log("Return time:",moment().format("HH:mm:ss"));
                    return formattedRows;
                }else{
                    return [];
                }

            }

            
        } catch (error) {
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateFavorites(req: NextApiRequest): Promise<any[]> {

        const req_body = req.body;
        const property_id = req_body.property_id;
        const user_id = req_body.user_id;
        const type = req_body.type; 
        
        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            let up_result: ResultSetHeader | null = null;
            if(type == "Add") {
                let now = moment().format("YYYY-MM-DD H:m:s");
                [up_result] = await connection.query<ResultSetHeader>(`INSERT INTO favorites(property_id, user_id, date_added) VALUES(?, ?, ?)`, [property_id, user_id, now]);
            }else if(type == "Remove") {
                [up_result] = await connection.query<ResultSetHeader>(`DELETE FROM favorites WHERE property_id=? AND user_id=?`, [property_id, user_id]);
            }
            
            let upResult = "";
            if(up_result && up_result.affectedRows > 0) {
                
                upResult = "success."; 

            } else{
                upResult = "Unable to update property favorite status";
            }

            const [fav_row] = await connection.query<RowDataPacket[]>(`SELECT property_id FROM favorites WHERE user_id=?`, [user_id]);
            const favs: any[] = [];
            if(fav_row.length){
                fav_row.forEach(fav=> {
                    favs.push(fav.property_id);
                });
            }

            return favs;

        }catch(e: any){
            console.log(e.sqlMessage);
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}