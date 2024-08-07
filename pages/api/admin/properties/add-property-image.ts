import type { NextApiRequest, NextApiResponse } from 'next';
import { PropertyService } from '@/_services/property_service';

export const config = {
  api: {
    bodyParser: false,
  },
};

const property_service = new PropertyService();
const handler = async (req: NextApiRequest, resp: NextApiResponse) => {
  
    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "PUT"){

        const add_resp = await property_service.AddPropertyImage(req);
        resp.status(200).json(add_resp);

    }else{
        resp.status(405).end()
    }

};

export default handler;