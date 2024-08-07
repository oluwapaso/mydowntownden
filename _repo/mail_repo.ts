import { QueueError, SentMailParams } from "@/components/types";
import pool from "@/_lib/db_conn";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface MailRepo { 
    AddMailToQueue(params: SentMailParams): Promise<boolean>
    GetQueuedEmails(): Promise<any>
    DeleteQueue(ids: any[]): Promise<boolean>
    MarkAsErrored(ids: any[]): Promise<boolean>
}

export class MYSQLMailRepo implements MailRepo {

    public async AddMailToQueue(params: SentMailParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const message_body = params.body;
            const from_email = params.from_email;
            const to_email = params.to_email;
            const subject = params.subject;
            const message_type = params.message_type;
            const batch_id = params.batch_id;
            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();

            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO queue_messages(user_id, message_type, message_kind, from_info, to_info, subject, email_body, batch_id, date_queued) 
                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?) `, [user_id, message_type, "Email", from_email, to_email, subject, message_body, batch_id, date]
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

    public async GetQueuedEmails(): Promise<any> {

        let connection: PoolConnection | null = null;
        try{
        
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM queue_messages WHERE message_kind='Email' 
            AND status='Pending' ORDER BY date_queued ASC LIMIT 5`);

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    }
                });
                return formattedRows;
            }else{
                return [];
            }

        }catch(e:any){
            console.log(e.message);
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    
    }

    public async DeleteQueue(ids: any[]): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const implodedString = ids.join("', '");
            const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM queue_messages WHERE queue_id IN('${implodedString}')`);
            
            if(del_result.affectedRows>0){
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

    public async MarkAsErrored(error_info: QueueError[]): Promise<boolean>{
        
        const connection = await pool.getConnection();
        try{

            if (!connection) {
                return false;
            }

            if(error_info && error_info.length > 0){

                await Promise.all(error_info.map(async (err) => {
                    await connection.query<ResultSetHeader>(`UPDATE queue_messages SET status='Errored', error_message=? WHERE queue_id=?`, 
                    [err.error_message, err.queue_id]);
                }))

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

}