import { Helpers } from "@/_lib/helpers";
import { MYSQLRequestRepo } from "@/_repo/property_request";
import { APIResponseProps, AcknowledgeMultiRequestParams, AcknowledgeRequestParams, SendMailParams, SentMailParams } from "@/components/types";
import { NextApiRequest } from "next";
import { MailService } from "./mail_service";
import { MYSQLReservationRepo } from "@/_repo/reservation_repo";
import moment from "moment";
import numeral from "numeral";
import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { MYSQLMailRepo } from "@/_repo/mail_repo";

const mail_service = new MailService();
export class RequestsService {

    req_repo = new MYSQLRequestRepo();
    resv_repo = new MYSQLReservationRepo();
    helpers = new Helpers();

    public async AcknowledgeRequest(params: AcknowledgeRequestParams):Promise<APIResponseProps>{

        const request_id = params.request_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!request_id){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        console.log("params:", params)
        const is_updated = await this.req_repo.AcknowledgeRequest(params);
        default_resp.success = is_updated;
        
        if(is_updated){
            default_resp.message = "Request succesfully updated";
        }else{
            default_resp.message = "Unable to update request status";
        }
        return default_resp;

    }

    public async AcknowledgeMultiRequest(params: AcknowledgeMultiRequestParams):Promise<APIResponseProps>{

        const request_ids = params.request_ids;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!request_ids || request_ids.length < 1){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        let implode_ids = request_ids.join("', '");
        implode_ids = `'${implode_ids}'`;

        console.log("implode_ids:", implode_ids)
        const is_updated = await this.req_repo.AcknowledgeMultiRequests(implode_ids);
        default_resp.success = is_updated;
        
        if(is_updated){
            default_resp.message = "Request succesfully updated";
        }else{
            default_resp.message = "Unable to update request status";
        }
        return default_resp;

    }

    public async BookApartment(req: NextApiRequest):Promise<APIResponseProps>{

        const params = req.body;
        const user_id = params.user_id;
        const property_id = params.property_id;
        const move_in = params.move_in;
        const move_out = params.move_out;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!user_id || !property_id || !move_in || !move_out){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }
        
        const is_availabile = await this.resv_repo.CheckAvailability(req);
        if(is_availabile.success){
            if (is_availabile.data.reservations_found > 0 ) {
                default_resp.message = "Selected date range is not availabe again. Please go back and select another date."
                return default_resp as APIResponseProps
            }
        }

        const is_added = await this.req_repo.BookApartment(req);
        default_resp.success = is_added;
        
        if(is_added){
            
            const com_repo = new MYSQLCompanyRepo();
            const mail_repo = new MYSQLMailRepo();
            const comp_info = await com_repo.GetCompayInfo();

            const msg_body = `<table cellspacing="0" cellpadding="0" border="0" bgcolor="white" style="color:#5e6670;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.25em;background-color:white;padding:0;text-align:left;padding-bottom:20px">
            <tbody>
            <tr>
            <td width="92%">  
            <table align="center" width="600" style="color:#5e6670;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.25em;background-color:white;padding:0;text-align:left;padding-bottom:20px">
            <tbody> 
            <tr>
            <td>  
            
            <div style="font-weight:bold; font-size: 23px;">New Reservation Request</div>
            <p style="line-height: 1.5em;">
                <b>Contact Name: </b>${params.firstname} ${params.lastname}<br />
                <b>Contact Email: </b>${params.email}<br />
                <b>Contact Phone Number: </b>${params.phone_number}<br />
                <b>Booking Type: </b>${params.booking_type}<br />
                <b>Move In: </b>${moment(params.move_in).format("MM/DD/YYYY")}<br />
                <b>Move Out: </b>${moment(params.move_out).format("MM/DD/YYYY")}<br />
                <b>Subtotal: </b>${numeral(params.sub_total_fee).format("$0,0")}<br />
                <b>Total Amount: </b>${numeral(params.total_amount).format("$0,0")}<br />
                <b>Property Link: </b><a href="${process.env.NEXT_PUBLIC_BASE_URL}/listings/${params.property_id}/${params.listing_address}?move_in=${moment().format("YYYY-MM-DD")}&move_out=${moment().add(31,"days").format("YYYY-MM-DD")}&pets=0&parkings=0">View Property</a>
                </div>
            </p>
            
            <br>
            <br> 
            <br />
            <br /> 
            </td>
            </tr>
                
            </tbody>
            </table>
            
            </td>
            </tr>
            </tbody>
            </table>`

            const mail_params: SentMailParams = {
                user_id: 0,
                from_email: process.env.NEXT_PUBLIC_MAILER as string,
                to_email: comp_info.data.default_email,
                subject: `New Reservation Request From ${params.firstname}`,
                body: msg_body,
                message_type: "Alert",
            }

            const isQueued = await mail_repo.AddMailToQueue(mail_params);
            if(!isQueued) {
                //default_resp.message = "Unable to send email new agent.";
                //return default_resp as APIResponseProps;
            }

            const ar_params: SendMailParams = {
                user_id: req.body.user_id,
                mailer: "Nodemailer",
                from_email: process.env.NEXT_PUBLIC_MAILER as string,
                to_email: req.body.email,
                subject: "",
                body:"",
                message_type: "Reservation Request",
                user_firstname: req.body.firstname,
                user_lastname: req.body.lastname,
                user_email: req.body.email,
            } 

            const send_email_ar = await mail_service.SendAutoResponder(ar_params);
            default_resp.message = "Booking request succesfully sent";

        }else{
            default_resp.message = "Unable to send booking request status";
        }
        return default_resp;

    }

}
