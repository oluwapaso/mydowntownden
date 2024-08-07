import { MYSQLAdminRepo } from "@/_repo/admin_repo";
import { MYSQLMailRepo } from "@/_repo/mail_repo";
import { AdminService } from "@/_services/admin_service";
import { APIResponseProps, AddAdminParams, UpdateAdminParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const admin_service = new AdminService(new MYSQLAdminRepo(), new MYSQLMailRepo());

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body;

        const response = await admin_service.AddNewAdmin(req_body as AddAdminParams);
        if(response.success){

            resp.status(200).json(response);

        }else{
            resp.status(400).json({"message":response.message, "success": false})
        }
    
    }else if(req.method == "PATCH") {
        
        const req_body = req.body

        const response = await admin_service.UpdateAdminInfo(req_body as UpdateAdminParams) 
        if(response.success){

            resp.status(200).json(response)

        }else{
            resp.status(400).json({"message":"Invalid account info provided.", "success": false, "data": response})
        }
    
    }else if(req.method == "DELETE") {
        
        const req_body = req.body;
        const admin_id = req_body.admin_id;

        const response = await admin_service.DeleteAdmin(admin_id);
        if(response.success){
            resp.status(200).json(response);
        }else{
            resp.status(400).json({"message":"Invalid account info provided.", "success": false, "data": response})
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request", "success": false})
    
    }

}