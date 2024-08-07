import { PropertyService } from "@/_services/property_service";
import { NextApiRequest, NextApiResponse } from "next";

const propertyService = new PropertyService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "PATCH"){
        
        const property = await propertyService.UpdateFavorites(req);
        resp.status(200).json(property);

    }else{
        resp.status(405).end()
    }

}