import pool from "@/_lib/db_conn";
import { APIResponseProps, UpdateAPIParams, UpdateCompanyParams, UpdatePrivacyAndTermsParams, UpdatePropDataParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";

export interface CompanyRepo {
    GetCompayInfo(): Promise<APIResponseProps>
    GetApiInfo(): Promise<APIResponseProps>
    UpdateCompayInfo(params: UpdateCompanyParams): Promise<APIResponseProps>
    UpdatePropertyData(params: UpdatePropDataParams): Promise<APIResponseProps>
    UpdatePrivacyAndTerms(params: UpdatePrivacyAndTermsParams): Promise<APIResponseProps>
}

export class MYSQLCompanyRepo implements CompanyRepo {
    
    public async GetCompayInfo(): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [row] = await connection.query<RowDataPacket[]>(`SELECT * FROM company_info WHERE company_id='1' `);
            if(row.length){
                
                default_rep.success = true;
                let data = row[0];

                delete data.google_auth_client_id;
                delete data.google_auth_client_secret;
                delete data.facebook_auth_app_id;
                delete data.facebook_auth_app_secret;
                delete data.google_map_key;
                
                if(data.interi && typeof data.google_map_key == "string"){
                    data.google_map_key
                }

                ['interior_features', 'exterior_features', 'amenities', 'equipments', 'apartment_rules'].forEach((field) => {
                    if (data[field] && data[field].length && typeof data[field] === 'string') {
                        data[field] = JSON.parse(data[field]);
                    }
                });

                default_rep.data = data;
                return default_rep;

            }else{
                default_rep.message = "No company info loaded"
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async GetApiInfo(): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const field = `google_auth_client_id, google_auth_client_secret, facebook_auth_app_id, facebook_auth_app_secret, google_map_key, 
            sendgrid_key, sendgrid_mailer`;
            const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM company_info WHERE company_id='1' `);
            if(row.length){
                 
                default_rep.success = true;
                default_rep.data = row[0];
                return default_rep;

            }else{
                default_rep.message = "No company api loaded";
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateCompayInfo(params: UpdateCompanyParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE company_info SET company_name=?, default_email=?, phone_number=?, 
            address_1=?, address_2=?, facebook=?, instagram=?, twitter=?, youtube=?, tiktok=? WHERE company_id=?`, [params.company_name, 
            params.default_email, params.phone_number, params.address_1, params.address_2, params.facebook, params.instagram, params.twitter, 
            params.youtube, params.tiktok, "1"]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = "Company info successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update company info."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateApiInfo(params: UpdateAPIParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE company_info SET google_auth_client_id=?, google_auth_client_secret=?, 
            facebook_auth_app_id=?, facebook_auth_app_secret=?, google_map_key=?, sendgrid_key=?, sendgrid_mailer=? WHERE company_id=?`, 
            [params.google_auth_client_id, params.google_auth_client_secret, params.facebook_auth_app_id, params.facebook_auth_app_secret, 
            params.google_map_key, params.sendgrid_key, params.sendgrid_mailer, "1"]
            );

            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = "API info successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update API info."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage;
            console.log("e.sqlMessagee", e.sqlMessage)
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdatePropertyData(params: UpdatePropDataParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE company_info SET interior_features=?, 
            exterior_features=?, amenities=?, equipments=?, apartment_rules=? WHERE company_id=?`, [JSON.stringify(params.interior_features), 
            JSON.stringify(params.exterior_features), JSON.stringify(params.amenities), JSON.stringify(params.equipments), 
             JSON.stringify(params.apartment_rules),"1"]
            );

            if(result.affectedRows >= 0){
                
                default_rep.success = true
                default_rep.message = "Property data successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update property data."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage;
            console.log("e.sqlMessagee", e.sqlMessage)
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdatePrivacyAndTerms(params: UpdatePrivacyAndTermsParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }
        let connection: PoolConnection | null = null;

        try{
            
            let field = ""
            let type_resp = ""
            if(params.update_type == "Privacy"){
                field = "privacy_policy"
                type_resp = "Privacy policy"
            }else if(params.update_type == "Terms"){
                field = "terms_of_service"
                type_resp = "Terms of service"
            }else if(params.update_type == "Disclaimer"){
                field = "mls_disclaimer"
                type_resp = "MLS disclaimer"
            }else if(params.update_type == "About Us"){
                field = "about_us"
                type_resp = "About us"
            }

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE company_info SET ${field}=? WHERE company_id=?`, [params.value, "1"]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = type_resp+" successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update "+type_resp.toLocaleLowerCase()+"."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}