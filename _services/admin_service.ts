import { admin_invite_email } from "@/_lib/data";
import { Helpers } from "@/_lib/helpers";
import { MYSQLAdminRepo } from "@/_repo/admin_repo";
import { MYSQLMailRepo } from "@/_repo/mail_repo";
import { APIResponseProps, AddAdminParams, AddTokenParams, AdminLoginParams, GetSingleAdminParams, SentMailParams, UpdateAdminParams } from "@/components/types";
import moment from "moment";
import { NextApiRequest } from "next";

const helpers = new Helpers();
export class AdminService {

    private adminRepo: MYSQLAdminRepo | null = null;
    private mailRepo: MYSQLMailRepo | null = null;
    constructor(adminRepo?:MYSQLAdminRepo, mailRepo?:MYSQLMailRepo){
        if(adminRepo){
            this.adminRepo = adminRepo;
        }

        if(mailRepo){
            this.mailRepo = mailRepo;
        }
    }

    public async Login(payload: AdminLoginParams): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/auths/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to login.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async AdminLogin(req: NextApiRequest): Promise<APIResponseProps> {

        const req_body = req.body
        const username = req_body.username
        const password = req_body.password

        const params: AdminLoginParams = {
            username: username, 
            password: password
        }

        if(!this.adminRepo) {
            return {success:false, message:"Dependency not initialized."} as APIResponseProps;
        }

        const login_resp = await this.adminRepo?.AdminLogin(params);
        return login_resp as APIResponseProps;

    }

    public async AddNewAdmin(params: AddAdminParams):Promise<APIResponseProps>{

        const firstname = params.firstname;
        const email = params.email;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!firstname || !email){
            default_resp.message = "Provide a valid name and email address."
            return default_resp as APIResponseProps
        }

        if(this.adminRepo){

            const check_params: GetSingleAdminParams = {
                search_by: "Email",
                fields: "admin_id, status",
                email: email
            } 

            const admin_info = await this.adminRepo.GetSingleAdmin({params: check_params});
            if(admin_info && typeof admin_info != "string"){
                return {"message": "Email is associated with another account, please try another one.", "success": false}
            }else if (typeof admin_info === "string"){
                return {"message": admin_info, "success": false}
            }
            
            //Else continue
            const resp = await this.adminRepo?.AddNewAdmin(params);
            if(resp.success){

                const token = helpers.GenarateRandomString(50);
                const date = moment().format('YYYY-MM-DD HH:mm:ss');
                /** Add new token via repo */
                const tok_params: AddTokenParams = {
                    email: email,
                    date,
                    token 
                }
                
                const is_added = await this.adminRepo.AddNewToken({params:tok_params});
                if(!is_added){
                    default_resp.message = "Unable to add tokens.";
                    return default_resp as APIResponseProps;
                }

                let email_body = admin_invite_email;
                const email_subject = "New account invitation from "+process.env.NEXT_PUBLIC_APP_NAME;
                email_body = email_body.replace("[Team Member's Name]", firstname);
                email_body = email_body.replace("[account_email]", email);
                email_body = email_body.replace("[token]", token);
                email_body = email_body.replace("[APP_NAME]", process.env.NEXT_PUBLIC_APP_NAME as string);
                email_body = email_body.replace("[BASE_URL]", process.env.NEXT_PUBLIC_BASE_URL as string);

                if(this.mailRepo){

                    const mail_params: SentMailParams = {
                        user_id: 0,
                        from_email: process.env.NEXT_PUBLIC_MAILER as string,
                        to_email: email, 
                        subject: email_subject,
                        body: email_body,
                        message_type: "Invitation",
                    }

                    const isQueued = await this.mailRepo.AddMailToQueue(mail_params);
                    if(!isQueued) {
                        default_resp.message = "Unable to send email new agent.";
                        return default_resp as APIResponseProps;
                    }

                    default_resp.message = "New agent successfully added";
                    default_resp.success = true;

                }
            }

            return default_resp;

        }else{
            return {"success":false, "message":"Fatal error"} as APIResponseProps;
        }

    }

    public async UpdateAdminInfo(params: UpdateAdminParams):Promise<APIResponseProps>{

        const firstname = params.firstname;
        const email = params.email;
        const admin_id = params.admin_id;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!firstname || !email){
            default_resp.message = "Provide a valid name and email address."
            return default_resp as APIResponseProps
        }

        if(!admin_id){
            default_resp.message = "Invalid agent info provided."
            return default_resp as APIResponseProps
        }

        if(this.adminRepo){

            const check_params: GetSingleAdminParams = {
                search_by: "Email ALT",
                fields: "admin_id, status",
                email: email,
                admin_id: admin_id,
            } 

            const admin_info = await this.adminRepo.GetSingleAdmin({params: check_params});
            if(admin_info && typeof admin_info != "string"){
                return {"message": "Email is associated with another account, please try another one.", "success": false}
            }else if (typeof admin_info === "string"){
                return {"message": admin_info, "success": false}
            }
            
            //Else continue
            const resp = await this.adminRepo.UpdateAdminInfo(params);
            default_resp.message = resp.message;
            if(resp.success){
                default_resp.success = true;
            }
        }

        return default_resp;

    }

    public async DeleteAdmin(admin_id: number):Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!admin_id){
            default_resp.message = "Invalid agent info provided."
            return default_resp as APIResponseProps
        }

        if(this.adminRepo){
            const resp = await this.adminRepo.DeleteAdmin(admin_id);
            default_resp.message = resp.message;
            if(resp.success){
                default_resp.success = true;
            }
        }

        return default_resp;

    }

}