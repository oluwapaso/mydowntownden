import pool from "@/_lib/db_conn";
import { Helpers } from "@/_lib/helpers";
import { AddAdminParams, AddTokenParams, AdminInfo, AdminLoginParams, APIResponseProps, GetAgentsParams, GetResetTokenParams, GetSingleAdminParams, UpAdminPasswordParams, UpdateAdminParams } from "@/components/types";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs"
import { PoolConnection } from "mysql2/promise";

export interface AdminRepo {
    AdminLogin(params:AdminLoginParams): Promise<any>
    GetAllAdmins({params}:{params: GetAgentsParams}): Promise<AdminInfo[] | null>
    GetSingleAdmin({params}:{params: GetSingleAdminParams}): Promise<AdminInfo | string | null>
    GetResetToken({params}:{params: GetResetTokenParams}): Promise<string | null>
    AddNewToken({params}:{params: AddTokenParams}): Promise<boolean>
    AddNewAdmin(params: AddAdminParams): Promise<APIResponseProps>
    UpdateAdminInfo(params: UpdateAdminParams): Promise<APIResponseProps> 
    DeleteAdmin(admin_id: number): Promise<APIResponseProps>
    UpdateAdminPassword({params}:{params: UpAdminPasswordParams}): Promise<boolean>
    GetDashboardData(): Promise<APIResponseProps>
}

export class MYSQLAdminRepo implements AdminRepo {

    public async AdminLogin(params:AdminLoginParams): Promise<APIResponseProps>{

        const username_or_email = params.username;
        const password = params.password;
        const helpers = new Helpers();
        let connection: PoolConnection | null = null;

        if(!username_or_email || !password){
            return {"message":"Provide a valid login credential.", "success": false}
        }

        let success = false
        let message = ""
        try{

            connection = await pool.getConnection();
            const [admin_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM admins WHERE (email=? OR username=?) `, [username_or_email, username_or_email]);
            if(admin_row.length){

                const admin_info = admin_row[0];
                const hashed_password = admin_info.password;
                const status = admin_info.status;

                if(status == "Reset Password"){
                    return {"message": "Password reset is required", "data":null, "success": false}
                }else if(status == "Inactive"){
                    return {"message": "Account is inactive, contact a super admin", "data":null, "success": false}
                }

                const isValidPwrd = await bcrypt.compare(password, hashed_password).then(async (result) => {

                    if (result && connection) {

                        const adminInfo = admin_row[0]
                        const token = helpers.GenarateRandomString(50)
                        const expire_on = moment().add(30, "days").unix()
                        
                        const [sess_result] = await connection.query<ResultSetHeader>(`INSERT INTO admin_session(admin_id, token, expire_on) VALUES (?, ?, ?) `, 
                        [adminInfo.admin_id, token, expire_on]);
                        
                        if(sess_result.affectedRows > 0){

                            success = true
                            message = "Success."
                            adminInfo.token = token
                            delete(adminInfo.password)
                            return adminInfo as AdminInfo
                        
                        }else{

                            message = "Unable to add new session, try again later"
                            success = false
                            return null

                        }

                    } else {
                        message = "Invalid credentials provided.."
                        success = false
                        return null
                    }
                
                }).catch(e => {
                    console.log(e)
                    message = e.message
                    success = false
                    return null
                })

                return {"message":message, "data":isValidPwrd, "success":success}

            }else{
                throw new Error("Invalid credentials provided.")
            }

        }catch(e: any){
            return {"message":e.message, "data":null, "success": false}
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async GetSingleAdmin({params}:{params: GetSingleAdminParams}): Promise<AdminInfo | string | null>{

        const search_type = params.search_by;
        const field = params.fields; 

        let connection = await pool.getConnection();
        if(search_type == "Email"){

            const email = params?.email;

            try{
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM admins WHERE email=? `, [email]);
                return row.length ? row[0] as AdminInfo : null
            }catch(e: any){
                return e.sqlMessage
            }finally{
                if (connection) { 
                    connection.release();
                }
            }

        }else if(search_type == "Email ALT"){

            const email = params?.email;
            const admin_id = params?.admin_id;

            try{
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM admins WHERE email=? AND admin_id!=?`, [email, admin_id]);
                return row.length ? row[0] as AdminInfo : null
            }catch(e: any){
                return `search_type == "Email ALT": ${e.sqlMessage}`
            }finally{
                if (connection) { 
                    connection.release();
                }
            }

        }else if(search_type == "Admin ID"){

            const admin_id = params?.admin_id;

            try{
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM admins WHERE admin_id=? `, [admin_id]);
                return row.length ? row[0] as AdminInfo : null
            }catch(e: any){
                return e.sqlMessage
            }finally{
                if (connection) { 
                    connection.release();
                }
            }

        }else{
            return null
        }

    }

    public async GetAllAdmins({params}:{params: GetAgentsParams}): Promise<AdminInfo[] | null>{

        const page = params.page;
        const limit = params.limit;
        const start_from = (page - 1) * limit;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM admins) AS total_records 
            FROM admins LIMIT ${start_from}, ${limit}`);

            const formattedRows = rows.map((row) => {

                return {
                    ...row,
                } as AdminInfo
            });
        
            return formattedRows;

        }catch(e:any){

            console.log("e.sqlMessage", e.sqlMessage)
            return null;
            
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async GetResetToken({params}:{params: GetResetTokenParams}): Promise<string | null>{
        
        const search_by = params.search_by
        let connection: PoolConnection | null = null;
        try{    

            connection = await pool.getConnection();
            let query = ``
            let qry_params:(string | number)[] = []

            if(search_by == "Email"){

                const email = params.email as string
                query = `SELECT token FROM admin_reset_tokens WHERE email=?`
                qry_params.push(email)

            }else if (search_by == "Token"){

                const token = params.token as string
                query = `SELECT token FROM admin_reset_tokens WHERE token=?`
                qry_params.push(token)

            }

            const [row] = await connection.query<RowDataPacket[]>(query, [...qry_params]);
            return  row.length ? row[0].token as string : null

        }catch(e:any){
            console.log(e.sqlMessage)
            return null
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    }

    public async AddNewToken({params}:{params: AddTokenParams}): Promise<boolean> {

        const email = params.email
        const date = params.date
        const token = params.token
        let connection: PoolConnection | null = null;

        try{
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO admin_reset_tokens(email, token, date) VALUES (?, ?, ?) `, [email, token, date]);
            await connection.query(`UPDATE admins SET status='Reset Password' WHERE email=? `, [email]);
            return result.affectedRows > 0
        }catch(e: any){
            console.log(e.sqlMessage)
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddNewAdmin(params: AddAdminParams): Promise<APIResponseProps> {

        const default_resp:APIResponseProps = {
            message:"",
            success:false,
            data: null
        }

        const p = params;
        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO admins(firstname, lastname, email, phone, role) 
            VALUES (?, ?, ?, ?, ?) `, [p.firstname, p.lastname, p.email, p.phone, p.role]);
            
            default_resp.success = true;
            default_resp.message = "New admin successfully added";
            default_resp.data = {"admin_id":result.insertId}

        }catch(e: any){
            default_resp.message = e.sqlMessage
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp
    
    }

    public async UpdateAdminInfo(params: UpdateAdminParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        const p = params
        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE admins SET firstname=?, lastname=?, email=?, phone=?, role=?
            WHERE admin_id=?`, [p.firstname, p.lastname, p.email, p.phone, p.role, p.admin_id]);
            if(result.affectedRows >= 0){
                
                default_rep.success = true
                default_rep.message = "Agent info successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update agent info."
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

    public async DeleteAdmin(admin_id: number): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`DELETE FROM admins WHERE admin_id=? AND super_admin='No'`, [admin_id]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = "Agent profile successfully deleted."
                return default_rep

            }else{
                default_rep.message = "Unable to delete agent profile."
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

    public async UpdateAdminPassword({params}:{params: UpAdminPasswordParams}): Promise<boolean> {

        const email = params.account_email
        const admin_id = params.admin_id
        const password = params.password
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE admins SET password=?, status=? WHERE admin_id=? `, [password, 'Active', admin_id]);
            const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM admin_reset_tokens WHERE email=? `, [email]);
            return (up_result.affectedRows > 0 && del_result.affectedRows > 0)

        }catch(e: any){
            console.log(e.sqlMessage)
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }
    
    public async GetDashboardData(): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<RowDataPacket[]>(`SELECT 
                (SELECT COUNT(*) AS total_users FROM users) AS Users, 
                (SELECT COUNT(*) AS total_properties FROM properties) AS Properties, 
                (SELECT COUNT(*) AS total_requests FROM property_requests WHERE request_type='Contact Request') AS ContactRequest, 
                (SELECT COUNT(*) AS total_requests FROM property_requests WHERE request_type='Reservation Request') AS ReservationRequest `);

            const formattedRows = result.map((row) => {
                return {
                    ...row,
                }
            });

            default_rep.success = true;
            default_rep.message = "Success.";
            default_rep.data = formattedRows[0];
            return default_rep;

        }catch(e: any){
            default_rep.message = e.sqlMessage;
            return default_rep;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}
