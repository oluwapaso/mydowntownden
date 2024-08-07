import { ReservationService } from "@/_services/reservation_service";
import { NextApiRequest, NextApiResponse } from "next"

const resv_service = new ReservationService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    }  else if(req.method == "POST"){
        
        const response = await resv_service.LoadReservation(req);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
