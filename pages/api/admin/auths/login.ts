import { MYSQLAdminRepo } from "@/_repo/admin_repo";
import { AdminService } from "@/_services/admin_service";
import { NextApiRequest, NextApiResponse } from "next";

const adminService = new AdminService(new MYSQLAdminRepo());
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        const login_resp = await adminService.AdminLogin(req);
        console.log("login_resp:", login_resp)
        resp.status(200).json(login_resp);
    }else{
        resp.status(405).end()
    }

}