import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { APIResponseProps, UpdateAPIParams, UpdateCompanyParams, UpdatePrivacyAndTermsParams, UpdatePropDataParams } from "@/components/types";

 
export class CompanyService {
    
    comp_repo = new MYSQLCompanyRepo();

    public async UpdateCompanyInfo(params: UpdateCompanyParams):Promise<APIResponseProps>{

        const company_id = params.company_id;
        const company_name = params.company_name;
        const default_email = params.default_email;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!company_name || !default_email){
            default_resp.message = "Company name and default email are required"
            return default_resp as APIResponseProps
        }

        if(company_id != 1){
            default_resp.message = "Invalid account info provided."
            return default_resp as APIResponseProps
        }

        const resp = await this.comp_repo.UpdateCompayInfo(params)
        return resp;

    }

    public async UpdateApiInfo(params: UpdateAPIParams):Promise<APIResponseProps>{

        const resp = await this.comp_repo.UpdateApiInfo(params);
        return resp;

    }

    public async UpdatePropertyData(params: UpdatePropDataParams):Promise<APIResponseProps>{

        const resp = await this.comp_repo.UpdatePropertyData(params);
        return resp;
    }


    public async UpdatePrivacyAndTerms(params: UpdatePrivacyAndTermsParams):Promise<APIResponseProps>{

        const update_type = params.update_type
        const value = params.value

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!value){
            default_resp.message = "Content can not be empty."
            return default_resp as APIResponseProps
        }

        if(update_type != "Privacy" && update_type != "Terms" && update_type != "Disclaimer" && update_type != "About Us"){
            default_resp.message = "Invalid update type provided."
            return default_resp as APIResponseProps
        }

        const resp = await this.comp_repo.UpdatePrivacyAndTerms(params)
        return resp;

    }

}