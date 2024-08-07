import { Helpers } from "@/_lib/helpers"; 
import { MYSQLReservationRepo } from "@/_repo/reservation_repo";
import { APIResponseProps } from "@/components/types";
import { NextApiRequest } from "next";

export class ReservationService {

    resv_repo = new MYSQLReservationRepo();
    helpers = new Helpers();

    public async AddReservation(req: NextApiRequest):Promise<APIResponseProps>{

        const params = req.body;
        const property_id = params.property_id;
        const mls_number = params.mls_number;
        const move_in = params.move_in;
        const move_out = params.move_out;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!mls_number || !property_id || !move_in || !move_out){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }
 
        const is_added = await this.resv_repo.AddReservation(req);
        default_resp.success = is_added;
        
        if(is_added){
            default_resp.message = "Success"
        }else{
            default_resp.message = "Unable to send booking request status";
        }
        return default_resp;

    }
    
    public async LoadReservation(req: NextApiRequest): Promise<APIResponseProps>{
        const properties = await this.resv_repo.LoadReservations(req);
        return properties;
    }

    public async LoadMiniReservations(req: NextApiRequest): Promise<APIResponseProps>{
        const properties = await this.resv_repo.LoadMiniReservations(req);
        return properties;
    }

    public async LoadSingleReservation (req: NextApiRequest): Promise<APIResponseProps>{

        const params = req.body;
        const reservation_id = params.reservation_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!reservation_id){
            default_resp.message = "Invalid request."
            return default_resp as APIResponseProps;
        }

        const property = await this.resv_repo.LoadSingleReservation(req);
        return property;

    }

    public async UpdateReservation(req: NextApiRequest):Promise<APIResponseProps>{

        const params = req.body;
        const reservation_id = params.reservation_id;
        const property_id = params.property_id;
        const mls_number = params.mls_number;
        const move_in = params.move_in;
        const move_out = params.move_out;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!reservation_id || !mls_number || !property_id || !move_in || !move_out){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }
 
        const is_added = await this.resv_repo.UpdateReservation(req);
        default_resp.success = is_added;
        
        if(is_added){
            default_resp.message = "Success"
        }else{
            default_resp.message = "Unable to update reservation";
        }
        return default_resp;

    }

    public async DeleteReservation(req: NextApiRequest):Promise<APIResponseProps>{

        const params = req.body;
        const reservation_id = params.reservation_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!reservation_id){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }
 
        const is_added = await this.resv_repo.DeleteReservation(req);
        default_resp.success = is_added;
        
        if(is_added){
            default_resp.message = "Success"
        }else{
            default_resp.message = "Unable to delete reservation";
        }
        return default_resp;

    }

    public async CheckAvailability(req: NextApiRequest): Promise<APIResponseProps>{
        const is_availability = await this.resv_repo.CheckAvailability(req);
        return is_availability;
    }

}
