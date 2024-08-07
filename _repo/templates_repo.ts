import { GetSingleUserParams, SendMailParams } from "@/components/types";
import { MYSQLUserRepo } from "./user_repo";
import { MYSQLCompanyRepo } from "./company_repo";

export interface TemplateRepo { 
    ReplaceTemplateCode(temp_body: string, type: string, user_id: number): Promise<string>
}

export class MYSQLTemplateRepo implements TemplateRepo {
    
    public async ReplaceTemplateCode(temp_body: string, type: string, user_id: number, mail_params?: SendMailParams): Promise<string> {
        
        const comp_repo = new MYSQLCompanyRepo();
        const user_repo = new MYSQLUserRepo();
        const params: GetSingleUserParams = {
            search_by: "User ID",
            fields: "*",
            user_id: user_id as unknown as string,
        }

        const comp_info = await comp_repo.GetCompayInfo();
        const user_info = await user_repo.GetSingleUser({params});
        if(user_info && typeof user_info != "string"){

            user_id = user_info.user_id;
            temp_body = temp_body.replace(/{{firstname}}/ig, user_info.firstname || "");
            temp_body = temp_body.replace(/{{lastname}}/ig, user_info.lastname || "");
            temp_body = temp_body.replace(/{{email}}/ig, user_info.email || "");
            temp_body = temp_body.replace(/{{phone_1}}/ig, user_info.phone_1 || "");
        
        }else{
            temp_body = temp_body.replace(/{{firstname}}/ig, mail_params?.user_firstname || "");
            temp_body = temp_body.replace(/{{lastname}}/ig,  mail_params?.user_lastname || "");
            temp_body = temp_body.replace(/{{email}}/ig,  mail_params?.user_email || "");
            temp_body = temp_body.replace(/{{phone_1}}/ig, mail_params?.user_phone || "");
        }

        temp_body = temp_body.replace(/{{our_company_name}}/ig, comp_info.data.company_name);
        temp_body = temp_body.replace(/{{our_default_email}}/ig, comp_info.data.default_email);
        temp_body = temp_body.replace(/{{our_phone_number}}/ig, comp_info.data.phone_number);
        temp_body = temp_body.replace(/{{our_contact_us_email}}/ig, comp_info.data.contact_us_email);
        temp_body = temp_body.replace(/{{our_buying_email}}/ig, comp_info.data.buying_email);
        temp_body = temp_body.replace(/{{our_selling_email}}/ig, comp_info.data.selling_req_email);
        temp_body = temp_body.replace(/{{our_address_1}}/ig, comp_info.data.address_1);
        temp_body = temp_body.replace(/{{our_address_2}}/ig, comp_info.data.address_2);
        temp_body = temp_body.replace(/{{our_facebook}}/ig, comp_info.data.facebook);
        temp_body = temp_body.replace(/{{our_instagram}}/ig, comp_info.data.instagram);
        temp_body = temp_body.replace(/{{our_x\/twitter}}/ig, comp_info.data.twitter);
        temp_body = temp_body.replace(/{{our_youtube}}/ig, comp_info.data.youtube);
        temp_body = temp_body.replace(/{{primary_logo_link}}/ig, comp_info.data.instagram);
        temp_body = temp_body.replace(/{{secondary_logo_link}}/ig, comp_info.data.instagram);

        

        return temp_body;
    }

}