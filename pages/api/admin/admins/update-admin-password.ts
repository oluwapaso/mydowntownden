import { APIResponseProps, GetSingleAdminParams, UpAdminPasswordParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from 'bcryptjs';
import { MYSQLAdminRepo } from "@/_repo/admin_repo";

const admin_repo = new MYSQLAdminRepo();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body;
        const account_email = req_body.account_email;
        const token = req_body.token;
        const password = req_body.password as string;

        if (password.length < 5) {
            resp.status(400).json({"message":"Password can't be less that 5 characters"})
        }

        const params: GetSingleAdminParams = {
            search_by:"Email",
            fields:"admin_id,status",
            email: account_email
        } 

        let admin_id: number | undefined
        let status: string | undefined

        const admin_info = await admin_repo.GetSingleAdmin({params}) 
        if(admin_info && typeof admin_info != "string"){

            admin_id = admin_info?.admin_id
            status = admin_info?.status

        }else if (typeof admin_info === "string"){
            resp.status(400).json({"message":admin_info})
        }else{
            resp.status(400).json({"message":"Invalid account info provided."})
        }

        if(status=="Active" || status=="Inactive" || status=="Reset Password"){

            const resetToken = admin_repo.GetResetToken({
                params:{
                    search_by:"Token",
                    token:token
                }
            })

            await resetToken.then(async (reset_token: string | null) => {
                if(reset_token){
                    /** Add new token via repo */
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const tok_params: UpAdminPasswordParams = {
                        admin_id: admin_id as number,
                        account_email: account_email,
                        password: hashedPassword
                    }
                    const is_updated = admin_repo.UpdateAdminPassword({params:tok_params})
                    
                    if(!is_updated){
                        resp.status(500).json({"message":"Unable to update new password."})
                    }

                    resp.status(200).json({"message":"Password successfully updated."})
                    /** Add new token via repo */ 
                }else{
                    resp.status(404).json({"message":"Invalid token provided."})
                }
            })

        }else{
             resp.status(401).json({"message":"Account is not active. Please contact support."})
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request"})
    
    }

}