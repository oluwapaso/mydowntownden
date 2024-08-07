import { MYSQLAdminRepo } from "@/_repo/admin_repo";
import { APIResponseProps, GetSingleAdminParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const adminRepo = new MYSQLAdminRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;
        const params: GetSingleAdminParams = {
            fields: "*",
            admin_id: req_body.admin_id,
            search_by: req_body.search_by,
        }

        const call_resp: APIResponseProps = {success: false, message: "" };
        const admin_info = await adminRepo.GetSingleAdmin({params: params});
        if(typeof admin_info != "string" && typeof admin_info != null) {
            call_resp.success = true;
            call_resp.data = admin_info;
        }

        resp.status(200).json(call_resp);

    }else{
        resp.status(405).end()
    }

}