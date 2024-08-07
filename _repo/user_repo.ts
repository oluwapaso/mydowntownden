import pool from "@/_lib/db_conn";
import { Helpers } from "@/_lib/helpers";
import { AddTokenParams, GetResetTokenParams, GetSingleUserParams, LoadUsersParams, SendMailParams, UpUserPasswordParams, User, 
UserAuthParams, UserLoginParams } from "@/components/types"
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs"
import moment from "moment";
import { NextApiRequest } from "next";
//import { MailService } from "@/_services/mail_service";
import { MYSQLCompanyRepo } from "./company_repo";
import { PoolConnection } from "mysql2/promise";

export interface UserRepo {
    UserLogin(params: UserLoginParams): Promise<any>
    UserAuthLogin(params: UserAuthParams): Promise<any>
    GetSingleUser({params}:{params: GetSingleUserParams}): Promise<User | string | null>
    GetResetToken({params}:{params: GetResetTokenParams}): Promise<string | null>
    AddNewToken({params}:{params: AddTokenParams}): Promise<boolean>
    UpdateAccountPassword({params}:{params: UpUserPasswordParams}): Promise<boolean>
    UpdateLeadDetails(req: NextApiRequest): Promise<boolean>
    Registerccount(email: string, password: string): Promise<[boolean, number]>
    DeleteAccount(req: NextApiRequest): Promise<boolean>
    AddInquiryRequest(req: NextApiRequest): Promise<boolean>
    UpdateLeadStatus(req: NextApiRequest): Promise<boolean>
}

export class MYSQLUserRepo implements UserRepo {

    //mail_service = new MailService();
    com_repo = new MYSQLCompanyRepo();

    public async UserLogin(params: UserLoginParams): Promise<any>{

        const email = params.email;
        const password = params.password;
        const helpers = new Helpers();
        let connection: PoolConnection | null = null;

        if(!email || !password){
            return {"message":"Provide a valid login credential.", "success": false}
        }

        let success = false;
        let message = "";
        try{

            connection = await pool.getConnection();
            const [user_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM users WHERE email=?`, [email]);
            if(user_row.length){

                const user_info = user_row[0];
                const hashed_password = user_info.password;
                const status = user_info.status;
                
                if(status == "Inactive"){
                    throw new Error("Account not active, please contact support.");
                }else if(status == "Reset Password"){
                    throw new Error("A password reset is required to access your account.");
                }

                const isValidPwrd = await bcrypt.compare(password, hashed_password).then(async (result) => {

                    if (result && connection) {

                        const userInfo = user_row[0];
                        const token = helpers.GenarateRandomString(50);
                        const expire_on = moment().add(30, "days").unix();
                        
                        const [sess_result] = await connection.query<ResultSetHeader>(`INSERT INTO user_session(user_id, token, expire_on) VALUES (?, ?, ?) `, 
                        [userInfo.user_id, token, expire_on]);
                        
                        if(sess_result.affectedRows > 0){

                            const [fav_row] = await connection.query<RowDataPacket[]>(`SELECT property_id FROM favorites WHERE user_id=?`, [userInfo.user_id]);
                            const favs: any[] = [];
                            if(fav_row.length){
                                fav_row.forEach(fav=> {
                                    favs.push(fav.property_id);
                                });
                            }

                            success = true
                            message = "Success."
                            userInfo.token = token;
                            userInfo.favorites = favs;
                            delete(userInfo.password);
                            return userInfo as User;
                        
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
                });

                return {"message":message, "data":isValidPwrd, "success":success}

            }else{
                throw new Error("Invalid credentials provided.");
            }

        }catch(e: any){
            return {"message":e.message, "data":null, "success": false}
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UserAuthLogin(params: UserAuthParams): Promise<any>{

        const email = params.email;
        const name = params.name;
        const helpers = new Helpers();
        let connection: PoolConnection | null = null;

        if(!email){
            return {"message":"Invalid auth credential provided, email is missing.", "success": false}
        }

        let success = false;
        let message = "";
        try{

            connection = await pool.getConnection();
            const [user_row] = await connection.query<RowDataPacket[]>(`SELECT * FROM users WHERE email=? `, [email]);
            if(user_row.length){

                const user_info = user_row[0];
                const token = helpers.GenarateRandomString(50);
                
                const [fav_row] = await connection.query<RowDataPacket[]>(`SELECT property_id FROM favorites WHERE user_id=?`, [user_info.user_id]);
                const favs: any[] = [];
                if(fav_row.length){
                    fav_row.forEach(fav=> {
                        favs.push(fav.property_id);
                    });
                }

                success = true;
                message = "Success.";
                user_info.token = token;
                user_info.favorites = favs;
                delete(user_info.password);
                return {"message":message, "data": user_info as User, "success":success}

            }else{
                
                const first_name = name.split(" ")[0];
                const last_name = name.split(" ")[1];
                
                // Generate a random password of length 8
                const password = helpers.GenarateRandomString(13);
                const hashedPassword = await bcrypt.hash(password, 10);

                const [sess_result] = await connection.query<ResultSetHeader>(`INSERT INTO users(email, firstname, lastname, password) VALUES (?, ?, ?, ?) `, 
                [email, first_name, last_name, hashedPassword]);
                
                if(sess_result.affectedRows > 0){
                    
                    const api_info_prms = this.com_repo.GetApiInfo();
                    const api_info = await api_info_prms;
                    const user_id = sess_result.insertId;

                    const mail_params: SendMailParams = {
                        user_id: user_id,
                        mailer: "Nodemailer",
                        from_email: process.env.NEXT_PUBLIC_MAILER as string,
                        to_email: email,
                        subject: "",
                        body: "",
                        message_type: "New Account"
                    } 
                    //Lazy-load MYSQLUserRepo to avoid import cycle
                    const {MailService} = await import("@/_services/mail_service");
                    const mail_service = new MailService();
                    const send_email_ar = await mail_service.SendAutoResponder(mail_params);

                    return this.UserAuthLogin(params);
                }else{
                    return {"message": "Unable to add new account, try again later", "data":null, "success": false}
                }

            }

        }catch(e: any){
            return {"message":e.message, "data":null, "success": false}
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async GetSingleUser({params}:{params: GetSingleUserParams}): Promise<User | string | null>{

        const search_type = params.search_by;
        const field = params.fields; 

        let connection = await pool.getConnection();
        if(search_type == "Email"){

            const email = params?.email;

            try{
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM users WHERE email=? `, [email]);
                return row.length ? row[0] as User : null
            }catch(e: any){
                return e.sqlMessage
            }finally{
                if (connection) { 
                    connection.release();
                }
            }

        }else if(search_type == "Email ALT"){

            const email = params?.email;
            const user_id = params?.user_id;

            try{
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM users WHERE email=? AND user_id!=?`, [email, user_id]);
                return row.length ? row[0] as User : null
            }catch(e: any){
                return `search_type == "Email ALT": ${e.sqlMessage}`
            }finally{
                if (connection) { 
                    connection.release();
                }
            }

        }else if(search_type == "User ID"){

            const user_id = params?.user_id;

            try{
                const [row] = await connection.query<RowDataPacket[]>(`SELECT ${field} FROM users WHERE user_id=? `, [user_id]);
                return row.length ? row[0] as User : null
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

    public async GetResetToken({params}:{params: GetResetTokenParams}): Promise<string | null>{
        
        const search_by = params.search_by;
        let connection: PoolConnection | null = null;
        try{    

            let query = ``;
            let qry_params:(string | number)[] = [];
            connection = await pool.getConnection();

            if(search_by == "Email"){

                const email = params.email as string
                query = `SELECT token FROM reset_tokens WHERE email=?`
                qry_params.push(email)

            }else if (search_by == "Token"){

                const token = params.token as string
                query = `SELECT token FROM reset_tokens WHERE token=?`
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

        const email = params.email;
        const date = params.date;
        const token = params.token;

        let connection: PoolConnection | null = null;
        try{
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO reset_tokens(email, token, date) VALUES (?, ?, ?) `, [email, token, date]);
            await connection.query(`UPDATE users SET status='Reset Password' WHERE email=? `, [email]);
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

    public async UpdateAccountPassword({params}:{params: UpUserPasswordParams}): Promise<boolean> {

        const email = params.account_email;
        const user_id = params.user_id;
        const password = params.password;
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE users SET password=?, status=? WHERE user_id=? `, [password, 'Active', user_id]);
            const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM reset_tokens WHERE email=? `, [email]);
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

    public async Registerccount(email: string, password: string): Promise<[boolean, number]> {

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO users(email, password) VALUES (?, ?) `, [email, password]);
            if(result.affectedRows){
                return [true, result.insertId]
            }else{
                return [false, 0] 
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return [false, 0]
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddNewAccount(req: NextApiRequest): Promise<[boolean, number]>{

        const req_body = req.body;
        let connection: PoolConnection | null = null; 

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO users(email, secondary_email, firstname, lastname, phone_1, 
            phone_2, work_phone, fax, street_address, city, state, zip, background, birthday, facebook, tictoc, twitter, whatsapp, linkedin, 
            lead_stage, price_range, spouse_name, profession) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, [req_body.email, req_body.secondary_email, 
            req_body.firstname, req_body.lastname, req_body.phone_1, req_body.phone_2, req_body.work_phone, req_body.fax, 
            req_body.street_address, req_body.city, req_body.state, req_body.zip, req_body.background, req_body.birthday, req_body.facebook, 
            req_body.tictoc, req_body.twitter, req_body.whatsapp, req_body.linkedin, req_body.lead_stage, req_body.price_range, 
            req_body.spouse_name, req_body.profession]);
            if(result.affectedRows){
                return [true, result.insertId]
            }else{
                return [false, 0] 
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return [false, 0]
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateAccountDetails(req: NextApiRequest): Promise<boolean> {

        const req_body = req.body;
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE users SET email=?, secondary_email=?, firstname=?, lastname=?, 
            phone_1=?, phone_2=?, work_phone=?, fax=?, street_address=?, city=?, state=?, zip=?, country=? WHERE user_id=? `, 
            [req_body.email, req_body.secondary_email, req_body.firstname, req_body.lastname, req_body.phone_1, req_body.phone_2, 
            req_body.work_phone, req_body.fax, req_body.street_address, req_body.city, req_body.state, req_body.zip, req_body.country, 
            req_body.user_id]);
            return up_result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage);
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async UpdateLeadDetails(req: NextApiRequest): Promise<boolean> {

        const req_body = req.body;
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const birthday = moment(req_body.birthday).format("YYYY-MM-DD");
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE users SET email=?, secondary_email=?, firstname=?, lastname=?, 
            phone_1=?, phone_2=?, work_phone=?, fax=?, street_address=?, city=?, state=?, zip=?, price_range=?, spouse_name=?, profession=?, 
            birthday=?, facebook=?, linkedin=?, twitter=?, tictoc=?, whatsapp=?, background=?, lead_stage=? WHERE user_id=? `, 
            [req_body.email, req_body.secondary_email, req_body.firstname, req_body.lastname, req_body.phone_1, req_body.phone_2, 
            req_body.work_phone, req_body.fax, req_body.street_address, req_body.city, req_body.state, req_body.zip, req_body.price_range, 
            req_body.spouse_name, req_body.profession, birthday, req_body.facebook, req_body.linkedin, req_body.twitter, req_body.tictoc, 
            req_body.whatsapp, req_body.background, req_body.lead_stage, req_body.user_id]);
            return up_result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage);
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async DeleteAccount(req: NextApiRequest): Promise<boolean> {

        const user_id = req.body.user_id;
        let connection: PoolConnection | null = null;
        
        try{
            
            connection = await pool.getConnection();
            const [fav_result] = await connection.query<ResultSetHeader>(`DELETE FROM favorites WHERE user_id=? `, [user_id]);
            //const [srch_result] = await connection.query<ResultSetHeader>(`DELETE FROM saved_searches WHERE user_id=? `, [user_id]);
            const [sess_result] = await connection.query<ResultSetHeader>(`DELETE FROM user_session WHERE user_id=? `, [user_id]);
            const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM users WHERE user_id=? `, [user_id]);

            return del_result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage);
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }
 

    public async UpdateLeadStatus(req: NextApiRequest): Promise<boolean> {

        const user_ids = req.body.user_ids;
        const lead_stage = req.body.lead_stage;
        let userIds = user_ids.join("', '");
        userIds = `'${userIds}'`;

        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE users SET lead_stage=? WHERE user_id IN(${userIds}) `, [lead_stage]);
            return result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadUsers(params: LoadUsersParams): Promise<User[] | null> {

        const paginated = params.paginated;
        const search_type = params.search_type;
        const lead_stage = params.lead_stage;
        const keyword = params.keyword;
        let rows: RowDataPacket[] = [];
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;
                let kw_filter = "";
                let stage_filter = "";

                if(keyword && keyword !=""){
                    kw_filter = ` AND (firstname LIKE '%${keyword}%' OR lastname LIKE '%${keyword}%' OR CONCAT(firstname, " ", lastname) 
                    LIKE '%${keyword}%' OR email LIKE '%${keyword}%' OR secondary_email LIKE '%${keyword}%' OR phone_1 LIKE '%${keyword}%' 
                    OR phone_2 LIKE '%${keyword}%' OR work_phone LIKE '%${keyword}%')`;
                }

                if(lead_stage && lead_stage !="" && lead_stage !="Any"){
                    stage_filter = ` AND lead_stage='${lead_stage}'`;
                }

                if(search_type == "User Lists"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM users WHERE user_id IS NOT NULL 
                    ${kw_filter} ${stage_filter}) AS total_records FROM users WHERE user_id IS NOT NULL ${kw_filter} ${stage_filter} 
                    ORDER BY CONCAT(firstname, ' ', lastname) ASC LIMIT ${start_from}, ${limit}`);
                }
                
            }else{

            }

            const formattedRows = rows.map((row) => {
                delete row.password;
                return {
                    ...row,
                }
            });

            return formattedRows as User[] | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadSingleUser(user_id: string): Promise<User | null> {
        
        let connection: PoolConnection | null = null;
        try{
        
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM users WHERE user_id=?`,[user_id]);
            const formattedRows = rows.map((row) => {
                delete row.password;
                return {
                    ...row,
                } as User
            });

            return formattedRows[0] as User | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddInquiryRequest(req: NextApiRequest): Promise<boolean> {

        const req_body = req.body;
        const user_id = req_body.user_id;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        let connection: PoolConnection | null = null;

        let request_type = "Info Request";
        const type = req_body.type;
        if(type == "Tour"){
            request_type = "Tour Request";
        }

        let request_body: any = {
            first_name: req_body.first_name, 
            last_name: req_body.last_name, 
            phone_number: req_body.phone_number,
            email: req_body.email,
            type: req_body.type,
            tour_type: req_body.tour_type,
            comments: req_body.comments,
            prop_link: req_body.prop_link,
        };
        request_body = JSON.stringify(request_body);

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO property_requests(user_id, request_type, request_info, date_added) 
            VALUES (?, ?, ?, ?) `, [user_id, request_type, request_body, date]);
            if(result.affectedRows){
                return true;
            }else{
                return false;
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}