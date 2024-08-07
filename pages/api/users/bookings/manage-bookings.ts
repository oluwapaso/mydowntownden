import { RequestsService } from "@/_services/requests_service";
import { APIResponseProps } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const req_service = new RequestsService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const response = await req_service.BookApartment(req);
        if(response.success){

            resp.status(200).json(response);

        }else{
            console.log("response:", response)
            resp.status(400).json({"message":response.message || "Unable to process request.", "success": false})
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request"})
    
    }

}