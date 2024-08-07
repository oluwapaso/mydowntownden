import pool from "@/_lib/db_conn";
import { APIResponseProps, Reservation } from "@/components/types";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";
import { NextApiRequest } from "next";

export interface ReservationRepo { 
    LoadReservations(params: NextApiRequest): Promise<APIResponseProps> 
    AddReservation(req: NextApiRequest): Promise<boolean>
    LoadSingleReservation(req: NextApiRequest): Promise<APIResponseProps>
    DeleteReservation(req: NextApiRequest): Promise<boolean>
}

export class MYSQLReservationRepo implements ReservationRepo {
 

    public async LoadReservations(req: NextApiRequest): Promise<APIResponseProps> {

        const params = req.body;
        const paginated = params.paginated;
        let rows: RowDataPacket[] = [];
        const keyword = params.keyword;
        const date_type = params.date_type;
        const from_date = params.from_date;
        const to_date = params.to_date;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;
                let kw_filter = "";
                let date_filter = "";

                if(keyword && keyword !=""){
                    kw_filter = ` AND (firstname LIKE '%${keyword}%' OR lastname LIKE '%${keyword}%' OR CONCAT(firstname, " ", lastname) 
                    LIKE '%${keyword}%' OR email LIKE '%${keyword}%' OR mls_number LIKE '%${keyword}%' OR phone_1 LIKE '%${keyword}%' 
                    OR phone_2 LIKE '%${keyword}%')`;
                }

                 if(date_type && date_type !="" && date_type !="None"){

                    let field = ""
                    if(date_type == "Move Out Date" ){
                       field = "move_out"
                    }else {
                        field = "move_in"
                    }

                    date_filter = ` AND (${field} BETWEEN '${from_date}' AND '${to_date}')`
                 }

                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM reservations 
                    WHERE reservation_id IS NOT NULL ${kw_filter} ${date_filter}) AS total_records FROM reservations 
                    WHERE reservation_id IS NOT NULL ${kw_filter} ${date_filter} ORDER BY CONCAT(firstname, ' ', lastname) ASC 
                    LIMIT ${start_from}, ${limit}`);
                    
            }
    
            const formattedRows = rows.map((row) => {

                return {
                    ...row,
                }
            });

            return  {
                message: "Success",
                data: formattedRows,
                success: true,
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return {
                message: e.sqlMessage,
                success: false,
            }
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    } 

    public async LoadMiniReservations(req: NextApiRequest): Promise<APIResponseProps> {

        const params = req.body;
        const property_id = params.property_id;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM reservations 
            WHERE property_id='${property_id}') AS total_records FROM reservations WHERE property_id='${property_id}' 
            ORDER BY move_in ASC LIMIT 3`);
    
            const formattedRows = rows.map((row) => {
                return {
                    ...row,
                }
            });

            return  {
                message: "Success",
                data: formattedRows,
                success: true,
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return {
                message: e.sqlMessage,
                success: false,
            }
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    } 

    public async AddReservation(req: NextApiRequest): Promise<boolean> {
         
        const req_bdy = req.body;
        const property_id = req_bdy.property_id;
        const mls_number = req_bdy.mls_number;
        const move_in = req_bdy.move_in;
        const move_out = req_bdy.move_out;
        const firstname = req_bdy.firstname;
        const lastname = req_bdy.lastname;
        const email = req_bdy.email;
        const phone_1 = req_bdy.phone_1;
        const phone_2 = req_bdy.phone_2;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO reservations(property_id, mls_number, move_in, 
            move_out, firstname, lastname, email, phone_1, phone_2, date_added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, 
            [property_id, mls_number, move_in, move_out, firstname, lastname, email, phone_1, phone_2, date]);
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

    public async UpdateReservation(req: NextApiRequest): Promise<boolean> {
         
        const req_bdy = req.body;
        const reservation_id = req_bdy.reservation_id;
        const property_id = req_bdy.property_id;
        const mls_number = req_bdy.mls_number;
        const move_in = req_bdy.move_in;
        const move_out = req_bdy.move_out;
        const firstname = req_bdy.firstname;
        const lastname = req_bdy.lastname;
        const email = req_bdy.email;
        const phone_1 = req_bdy.phone_1;
        const phone_2 = req_bdy.phone_2;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE reservations SET move_in=?, move_out=?, firstname=?, 
            lastname=?, email=?, phone_1=?, phone_2=? WHERE reservation_id=? `, [move_in, move_out, firstname, lastname, email, 
            phone_1, phone_2, reservation_id]);
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

    public async LoadSingleReservation(req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const reservation_id = params.reservation_id;
        let connection: PoolConnection | null = null;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM reservations WHERE reservation_id='${reservation_id}'`);

            const formattedRows = rows.map((row) => {
                return {
                    ...row,
                } as Reservation
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

    public async DeleteReservation(req: NextApiRequest): Promise<boolean> {
         
        const req_bdy = req.body;
        const reservation_id = req_bdy.reservation_id;
        let connection: PoolConnection | null = null;

        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`DELETE FROM reservations WHERE reservation_id=? `, [reservation_id]);
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

    public async CheckAvailability(req: NextApiRequest): Promise<APIResponseProps> {

        const params = req.body;
        const property_id = params.property_id;
        const move_in = params.move_in;
        const move_out = params.move_out;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS total_records FROM properties AS p 
            WHERE p.status='Vacant' AND p.property_id='${property_id}' AND EXISTS (SELECT 1 FROM reservations r 
            WHERE r.property_id='${property_id}' AND r.move_in <= '${move_out}' AND r.move_out > '${move_in}')`);

            const formattedRows = rows.map((row) => {
                return {
                    ...row,
                }
            });

            return  {
                message: "Success",
                data: {"reservations_found" :formattedRows[0].total_records},
                success: true,
            }

        }catch(e: any){
            console.log(e.sqlMessage)
            return {
                message: e.sqlMessage,
                success: false,
            }
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    } 

}