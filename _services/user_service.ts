import { Helpers } from "@/_lib/helpers";
import { MYSQLUserRepo } from "@/_repo/user_repo";
import { APIResponseProps, AddTokenParams, GetSingleUserParams, SendMailParams, User } from "@/components/types";
import moment from "moment";
import { NextApiRequest } from "next";
import bcrypt from 'bcryptjs';
import { MailService } from "./mail_service";
import { MYSQLCompanyRepo } from "@/_repo/company_repo";

const helpers = new Helpers();
export class UserService {
    
    user_repo = new MYSQLUserRepo();
    mail_service = new MailService();
    com_repo = new MYSQLCompanyRepo();

    public async ResetPassword(req: NextApiRequest):Promise<APIResponseProps>{

        const account_email = req.body.account_email;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!helpers.validateEmail(account_email)){
            default_resp.message = "Provide a valid account email."
            return default_resp as APIResponseProps
        }

        const params: GetSingleUserParams = {
            search_by: "Email",
            fields:"user_id, status",
            email: account_email
        } 

        let user_id: any
        let token: string | null = null
        let status: string | undefined

        const user_info = await this.user_repo.GetSingleUser({params}) 
        if(user_info && typeof user_info != "string"){

            user_id = user_info.user_id;
            status = user_info?.status;

        }else if (typeof user_info === "string"){
            return {"message": user_info, "success": false}
        }else{
            return {"message": "Invalid account info provided.", "success": false}
        }

        const com_repo = new MYSQLCompanyRepo();
        const api_info_prms = com_repo.GetApiInfo();
        const api_info = await api_info_prms;

        if(status=="Active" || status=="Inactive" || status=="Reset Password"){

            const resetToken = this.user_repo.GetResetToken({
                params:{
                    email:account_email,
                    search_by:"Email"
                }
            });

            await resetToken.then((reset_token: string | null) => {
                if(reset_token){
                   token = reset_token 
                }else{

                    token = helpers.GenarateRandomString(50);
                    const date = moment().format('YYYY-MM-DD HH:mm:ss');
                    /** Add new token via repo */
                    const tok_params: AddTokenParams = {
                        email: account_email,
                        date,
                        token 
                    }
                    const is_added = this.user_repo.AddNewToken({params:tok_params})
                    
                    if(!is_added){
                        return {"message": "Unable to add new token.", "success": false}
                    }
                    /** Add new token via repo */

                }
            });
        
        }else{
            return {"message": "Account is not active. Please contact support.", "success": false}
        }

        const msg_body = `<div style="font-family:Helvetica Light,Helvetica,Arial,sans-serif;margin:0;padding:0; width:100%" bgcolor="#eeeeee"> 
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
        <tbody><tr>
        <td bgcolor="#eeeeee" align="center" style="padding:25px" >

        <table bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;max-width:600px" >
        <tbody><tr>
        <td>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
        <tbody>
        <tr>
        <td>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
        <tbody>

        <tr>
        <td align="center" style="color:#000000;font-family:Arial,Helvetica,sans-serif;font-size:21px;font-weight:bold;padding:0px;padding-top: 40px;" >
        You requested for a password reset
        </td>
        </tr>
        <tr>
        <td align="center" style="color:#000000;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:normal;line-height:22px;padding:30px 5% 0px" >
        Follow the link below to reset your password
        </td>
        </tr>
                
        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="20"></td>
        </tr>
        
        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="20"></td>
        </tr>

        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="1" style="padding:0px 30px">
        <table cellpadding="0" cellspacing="0" width="30%" style="border-collapse:collapse">
        <tbody><tr>
        <td style="border-top-color:#eeeeee;border-top-style:solid;border-top-width:1px;padding:0px 30px"></td>
        <td>
        </td>
        </tr>
        </tbody></table>
        </td>
        </tr>

        
        </tbody></table>
        </td>
        </tr>
        
        <tr>
        <td>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">

        <tbody>  
        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="20"></td>
        </tr>

        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="1" style="padding:0px 30px">
        <table cellpadding="0" cellspacing="0" width="300" height="46" style="border-collapse:collapse">

        <tbody><tr>
        <td bgcolor="#2ccae7" height="46" align="center" style="border-radius:2px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?email=${account_email}&token=${token}" 
        style="color:#ffffff;display:inline-block;font-family:\'Helvetica Neue\',arial;font-size:17px;font-weight:bold;line-height:46px;min-width:280px;max-width:280px;text-align:center;text-decoration:none">
        Reset Your Password</a></td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        

        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="40"></td>
        </tr>

        </tbody></table>
        </td>
        </tr>
        
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr> 
        
        </tbody>
        </table>
        </div>`;

        console.log("msg_body", msg_body)
        try{
         
            const params: SendMailParams = {
                user_id: 0,
                mailer: "Nodemailer",
                from_email: process.env.NEXT_PUBLIC_MAILER as string,
                to_email: req.body.account_email,
                subject: "Reset your account password",
                body: msg_body,
                message_type: req.body.message_type
            } 
            
            const send_mail = await this.mail_service.SendMail(params);
            if(send_mail.message == "Email sent!"){
                return {"message": "Reset Link Sent", "success": true, data: send_mail}
            }else{
                return {"message": send_mail.message, "success": true, data: send_mail}
            }

        
        }catch(e){
            return {"message":"Failed to send email: "+e, "success": true}
        }

    }

    public async RegiterAccount(req: NextApiRequest):Promise<APIResponseProps>{

        const email = req.body.email;
        const password = req.body.password;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!helpers.validateEmail(email)){
            default_resp.message = "Provide a valid email address."
            return default_resp as APIResponseProps
        }

        const params: GetSingleUserParams = {
            search_by: "Email",
            fields: "user_id, status",
            email: email
        } 

        const user_info = await this.user_repo.GetSingleUser({params}) 
        if(user_info && typeof user_info != "string"){
            return {"message": "Email is associated with another account, please try another one.", "success": false}
        }else if (typeof user_info === "string"){
            return {"message": user_info, "success": false}
        }else{
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const [isReg, user_id] = await this.user_repo.Registerccount(email, hashedPassword);

            if(isReg){

                //this.AddToSalesForce(email, "", "");
                default_resp.success = true;
                default_resp.message = "Account Created";

                const api_info_prms = this.com_repo.GetApiInfo();
                const api_info = await api_info_prms;

                const params: SendMailParams = {
                    user_id: user_id,
                    mailer: "Nodemailer",
                    from_email: process.env.NEXT_PUBLIC_MAILER as string,
                    to_email: email,
                    subject: "",
                    body: "",
                    message_type: "New Account"
                } 
                const send_email_ar = await this.mail_service.SendAutoResponder(params);

            }else{
                default_resp.message = "Unable to create new account."
            }

            return default_resp;

        }


    }

    public async AddNewUser(req: NextApiRequest):Promise<APIResponseProps>{

        const first_name = req.body.firstname;
        const last_name = req.body.lastname;
        const email = req.body.email;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!email){
            default_resp.message = "Provide a valid email address."
            return default_resp as APIResponseProps
        }

        if(!first_name || !last_name){
            default_resp.message = "Provide a valid firstname and lastname."
            return default_resp as APIResponseProps
        }

        const params: GetSingleUserParams = {
            search_by: "Email",
            fields: "user_id",
            email: email,
        } 

        const user_info = await this.user_repo.GetSingleUser({params});
        if(user_info && typeof user_info != "string"){
            return {"message": "Email is associated with another account, please try another one.", "success": false}
        }else if (typeof user_info === "string"){
            return {"message": user_info, "success": false}
        }else{
            
            const isAdded = await this.user_repo.AddNewAccount(req);

            if(isAdded){

                default_resp.success = true;
                default_resp.message = "New account successfully created";

            }else{
                default_resp.message = "Unable to add new account."
            }

            return default_resp;

        }


    }

    public async UpdateUserInfo(req: NextApiRequest):Promise<APIResponseProps>{

        const email = req.body.email;
        const user_id = req.body.user_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!helpers.validateEmail(email)){
            default_resp.message = "Provide a valid email address."
            return default_resp as APIResponseProps
        }

        const params: GetSingleUserParams = {
            search_by: "Email ALT",
            fields: "user_id",
            email: email,
            user_id: user_id
        } 

        const user_info = await this.user_repo.GetSingleUser({params});
        if(user_info && typeof user_info != "string"){
            return {"message": "Email is associated with another account, please try another one.", "success": false}
        }else if (typeof user_info === "string"){
            return {"message": user_info, "success": false}
        }else{
            
            const isReg = await this.user_repo.UpdateAccountDetails(req);

            if(isReg){

                const params_2: GetSingleUserParams = {
                    search_by: "Email",
                    fields: "*",
                    email: email
                } 

                const updated_user_info = await this.user_repo.GetSingleUser({params: params_2}) as any;
                delete updated_user_info?.password;
                updated_user_info.sub_to_mailing_lists = updated_user_info?.sub_to_mailing_lists as boolean;
                updated_user_info.sub_to_updates = updated_user_info?.sub_to_updates as boolean;

                default_resp.success = true;
                default_resp.message = "Account details successfully updated";
                default_resp.data = updated_user_info as User;

            }else{
                default_resp.message = "Unable to update account details."
            }

            return default_resp;

        }


    }

    public async UpdateLeadInfo(req: NextApiRequest):Promise<APIResponseProps>{

        const email = req.body.email;
        const user_id = req.body.user_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!email){
            default_resp.message = "Provide a valid email address."
            return default_resp as APIResponseProps
        }

        const params: GetSingleUserParams = {
            search_by: "Email ALT",
            fields: "user_id",
            email: email,
            user_id: user_id
        } 

        const user_info = await this.user_repo.GetSingleUser({params});
        if(user_info && typeof user_info != "string"){
            return {"message": "Email is associated with another account, please try another one.", "success": false}
        }else if (typeof user_info === "string"){
            return {"message": user_info, "success": false}
        }else{
            
            const isReg = await this.user_repo.UpdateLeadDetails(req);

            if(isReg){

                const params_2: GetSingleUserParams = {
                    search_by: "Email",
                    fields: "*",
                    email: email
                } 

                const updated_user_info = await this.user_repo.GetSingleUser({params: params_2}) as any;
                delete updated_user_info?.password;
                updated_user_info.sub_to_mailing_lists = updated_user_info?.sub_to_mailing_lists as boolean;
                updated_user_info.sub_to_updates = updated_user_info?.sub_to_updates as boolean;

                default_resp.success = true;
                default_resp.message = "Account details successfully updated";
                default_resp.data = updated_user_info as User;

            }else{
                default_resp.message = "Unable to update account details."
            }

            return default_resp;

        }


    }

    public async DeleteAccount(req: NextApiRequest):Promise<APIResponseProps>{

        const user_id = req.body.user_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!user_id){
            default_resp.message = "Invalid account info provided."
            return default_resp as APIResponseProps
        }

        const params: GetSingleUserParams = {
            search_by: "User ID",
            fields: "user_id",
            user_id: user_id
        } 

        const user_info = await this.user_repo.GetSingleUser({params});
        if(user_info && typeof user_info != "string"){

            const isDel = await this.user_repo.DeleteAccount(req);

            if(isDel){

                default_resp.success = true;
                default_resp.message = "Account successfully deleted";

            }else{
                default_resp.message = "Unable to delete account. Try again later"
            }

            return default_resp;

        }else if (typeof user_info === "string"){
            return {"message": user_info, "success": false}
        }else{
            return {"message": "Invalid account info provided.", "success": false}
        }


    }

    public async AddInquiryRequest(req: NextApiRequest):Promise<APIResponseProps>{

        const user_id = req.body.user_id;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        const phone_number = req.body.phone_number;
        const type = req.body.type;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!user_id || !first_name || !last_name || !phone_number || !email || !type){
            default_resp.message = "Fatal error";
            return default_resp as APIResponseProps
        }

        const isUpdated = await this.user_repo.AddInquiryRequest(req);
        if(isUpdated){
            default_resp.success = true;
            default_resp.message = "Request sucessfully added";
        }else{
            default_resp.message = "Unable to add request.";
        }

        return default_resp;

    }

}