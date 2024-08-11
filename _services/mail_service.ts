import { Helpers } from "@/_lib/helpers";
import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { APIResponseProps, LoadSingleAutoResponderParams, SendMailParams } from "@/components/types";
import { sendEmail } from "@/_lib/sendgridMailer";
import nodemailer from 'nodemailer';
import { MYSQLMailRepo } from "@/_repo/mail_repo"; 
import { MYSQLAutoResponderRepo } from "@/_repo/auto_responder"; 
import { MYSQLTemplateRepo } from "@/_repo/templates_repo";
import { MYSQLRequestRepo } from "@/_repo/property_request";
import { NextApiRequest } from "next";

export class MailService {

    helpers = new Helpers();
    mail_repo = new MYSQLMailRepo();
    ar_repo = new MYSQLAutoResponderRepo();
    temp_repo = new MYSQLTemplateRepo();
    //user_repo = new MYSQLUserRepo();

    public async SendMail(params: SendMailParams): Promise<APIResponseProps> {

        console.log("made it here SendMail() with")
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        let mailer = params.mailer;
        const user_id = params.user_id;
        const from_email = params.from_email;
        const to_email = params.to_email;
        const subject = params.subject;
        const body = params.body;

        if(!mailer || mailer == ""){
            mailer = "Sendgrid";
        }

        if(!this.helpers.validateEmail(from_email)){
            default_resp.message = "Provide a valid from email";
            return default_resp;
        }

        if(!this.helpers.validateEmail(to_email)){
            default_resp.message = "Provide a valid to email";
            return default_resp;
        }

        if(!subject || subject == "" || !body || body == ""){
            default_resp.message = "All fields are required";
            return default_resp;
        }

        if (mailer === 'Nodemailer') {

            console.log("Using nodemailer");
            const transporter = nodemailer.createTransport({
                host: process.env.NEXT_PUBLIC_MAIL_HOST,
                port: 465,
                secure: true,
                auth:{
                    user: process.env.NEXT_PUBLIC_MAILER,
                    pass: process.env.NEXT_PUBLIC_PWORD,
                }
            });

            const mailOptions = {
                from: from_email,
                to: to_email,
                subject: subject,
                html: body
            }

            await transporter.sendMail(mailOptions)
            default_resp.message = "Email sent!";
            default_resp.success = true;

        }else if(mailer == "Sendgrid"){

            try{

                const com_repo = new MYSQLCompanyRepo();
                const comp_info = await com_repo.GetCompayInfo();
                const api_info_prms = com_repo.GetApiInfo();
                const api_info = await api_info_prms

                const response = await sendEmail(from_email, to_email, subject, body, api_info.data.sendgrid_key); 
                
                if(response == "Email sent"){
                    default_resp.success = true;
                    default_resp.message = "Email sent!";
                    default_resp.data = {sent_to:comp_info.data.selling_req_email};
                }else{
                    default_resp.message = "Error sending email:: "+response;
                    //throw new Error(response);
                }
            
            }catch(e:any){
                console.log("Send Mail Error:", e)
                default_resp.message = "Error sending email: "+e;
            }

        }

        return default_resp;

    }

    public async SendAutoResponder(params: SendMailParams): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
 
        const user_id = params.user_id;
        const ar_params: LoadSingleAutoResponderParams = {
            search_by: "AR Type",
            search_value: params.message_type,
            template_type: "Email",
        }
        const ar_template = await this.ar_repo.LoadARInfo(ar_params);
        if(ar_template){
            
            if(ar_template.send_ar == "Yes"){

                const replaced_body = await this.temp_repo.ReplaceTemplateCode(ar_template.email_body, "Email", user_id, params);
                const replaced_subject = await this.temp_repo.ReplaceTemplateCode(ar_template.email_subject, "Email", user_id, params);
                params.body = replaced_body;
                params.subject = replaced_subject;

                const add_to_queue = await this.mail_repo.AddMailToQueue(params);
                
                if(add_to_queue){
                    default_resp.success = add_to_queue;
                    default_resp.message = "Auto responder queued successfully.";
                }else{
                    default_resp.message = "Unable to add auto responder to queue.";
                }

            }else{
                console.log("Not sending auto responder");
            }
        }else{
            console.log("UNable to load ar for :", params.message_type);
        }
        
        return default_resp;

    }

    public async AddContactUsRequest(req: NextApiRequest):Promise<APIResponseProps>{

        const req_repo = new MYSQLRequestRepo();
        const is_added = await req_repo.AddContactUsRequest(req);

        const default_resp = {
            message: "",
            data: {},
            success: is_added,
        }

        return default_resp;
    }

}   