 import { MYSQLAdminRepo } from "@/_repo/admin_repo";
import { GetAgentsParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const adminRepo = new MYSQLAdminRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body
        const page = req_body.page
        const limit = req_body.limit
        const params: GetAgentsParams = {
            page: page, 
            limit: limit
        }

        const agents = await adminRepo.GetAllAdmins({params})
        resp.status(200).json(agents);

    }else{
        resp.status(405).end()
    }

}