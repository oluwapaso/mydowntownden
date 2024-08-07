import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { MailService } from "@/_services/mail_service";
import { APIResponseProps, SendMailParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const mail_service = new MailService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body;
        const fname = req_body.firstname;
        const lname = req_body.lastname;
        const email = req_body.email;
        const message = req_body.message;

        const com_repo = new MYSQLCompanyRepo();
        const comp_info = await com_repo.GetCompayInfo();

        const msg_body = `<table cellspacing="0" cellpadding="0" border="0" bgcolor="white" style="color:#5e6670;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.25em;background-color:white;padding:0;text-align:left;padding-bottom:20px">
        <tbody>
        <tr>
        <td width="92%">  
        <table align="center" width="600" style="color:#5e6670;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.25em;background-color:white;padding:0;text-align:left;padding-bottom:20px">
        <tbody> 
        <tr>
        <td>  
        
        <p style="line-height: 1.5em;"> 
        <b>Contact Name: </b>${fname} ${lname}<br/> 
        <b>Contact Email: </b>${email}<br/>
        <b>Message: </b>${message}
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

        try{

            const params: SendMailParams = {
                user_id: req.body.user_id,
                mailer: "Nodemailer",
                from_email: process.env.NEXT_PUBLIC_MAILER as string,
                to_email: comp_info.data.default_email,
                subject: `New Contact Us Message From ${fname}`,
                body: msg_body,
                message_type: "Contact Us",
                user_firstname: fname,
                user_lastname: lname,
                user_email: email,
            } 
            
            const send_mail = await mail_service.SendMail(params);
            if(send_mail.success){ // && req.body.user_id
                const send_email_ar = await mail_service.SendAutoResponder(params);
                //const send_sms_ar = await sms_service.SendAutoResponder(params);
            }
            resp.status(200).json(send_mail);
        
        }catch(e){
            resp.status(500).json({"message":"Failed to send email: "+e })
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request"})
    
    }

}