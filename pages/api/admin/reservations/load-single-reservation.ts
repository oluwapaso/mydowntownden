import type { NextApiRequest, NextApiResponse } from 'next';
import { ReservationService } from '@/_services/reservation_service';

const resv_service = new ReservationService();
const handler = async (req: NextApiRequest, resp: NextApiResponse) => {
  
    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const add_resp = await resv_service.LoadSingleReservation(req);
        resp.status(200).json(add_resp);

    }else{
        resp.status(405).end()
    }

};

export default handler;