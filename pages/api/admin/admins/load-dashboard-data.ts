 import { MYSQLAdminRepo } from "@/_repo/admin_repo";
import { GetAgentsParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const adminRepo = new MYSQLAdminRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const agents = await adminRepo.GetDashboardData();
        resp.status(200).json(agents);

    }else{
        resp.status(405).end();
    }

}