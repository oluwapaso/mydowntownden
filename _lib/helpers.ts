import { RootState } from "@/app/(admin)/admin/GlobalRedux/store";
import { AdminInfo, APIResponseProps, AutoResponderDetails, AutoResponderLists, BlogCommentsListsParams, BlogPostInfoParams, ProperyRequests, Reservation, TemplateDetails, 
    TemplateLists, 
    User} from "@/components/types";
import { NextApiRequest } from "next";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export class Helpers {

    public validateEmail(email: string): boolean {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    public ucwords(str: string): string {
        return str.replace(/\b\w/g, function (char) {
            return char.toUpperCase();
        });
    }

    public GenarateRandomString(len: number = 25): string {
        const characters = 'ABCDEFGHIJKLMN209i2388jwdp8wrh989AS78GWEGAWy9008347bdioapod73623239372382309OPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < len; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }

        return result;
    }

    public VerifySession() {
        const user = useSelector((state: RootState) => state.admin)
        const rounter = useRouter()

        if (!user.isLogged) {
            rounter.push("/admin/login")
        }
    }

    public async FetchCompanyInfo(): Promise<APIResponseProps>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return await fetch(`${apiBaseUrl}/api/admin/settings/get-company-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((resp): Promise<APIResponseProps> => {
            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async FetchAPIInfo(): Promise<APIResponseProps>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return await fetch(`${apiBaseUrl}/api/admin/settings/get-api-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((resp): Promise<APIResponseProps> => {
            return resp.json();
        }).then(data => {
            return data
        })

    }

    public GetAgents = async (payload: {page: string | number | string[], limit: number}) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/admins/get-all-admins`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<AdminInfo[]> => {
            if (!resp.ok) {
                throw new Error("Unable to fetch admins.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async FetchAdminInfo(payload :{admin_id: string | number | string[]}):Promise<APIResponseProps>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/admins/get-admin-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({admin_id: payload.admin_id as string, search_by: "Admin ID"}),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load admin info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public flashRedirect(){
        window.history.replaceState("", "", '#/redirecting');
    }

    public GetParsedFieldString(field: string[] | undefined): string{
        if(field){
            return field[0];
        }
        return "";
    }

    public GetParsedFieldArray(field: string[] | undefined): []{
        if(field){
            return JSON.parse(field[0]);
        }
        return [];
    }

    public GetParsedFieldJSON(field: string[] | undefined): any{
        if(field && field[0] != ""){
            return JSON.parse(field[0]);
        }
        return {};
    }

    public async GetBlogPostInfo(slug: string): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/load-blog-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({slug: slug}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load blog info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async GetDraftBlogPostInfo(draft_id: number): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/load-draft-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({draft_id: draft_id}),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load draft info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

     public async AddBlogView(slug: string, logged_id: string): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/add-blog-view`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({slug: slug, logged_id: logged_id}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to add blog view.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }
    
    public LoadBlogPosts = async (payload: {
        paginated: boolean, 
        post_type: string, 
        page?: string | number | string[], 
        limit?: number, 
        category_id?: number, 
        keyword?: string
    }) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/load-blog-posts`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<BlogPostInfoParams[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load blog posts.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadBlogComments = async (payload: {paginated: boolean, post_id?: string | number | string[], page?: string | number | string[], limit?: number}) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/load-blog-comments`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<BlogCommentsListsParams[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load blog comments.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    } 

    public async GetCommunityDraftInfo(draft_id: number): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(communities)/load-draft-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({draft_id: draft_id}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load draft info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }


    public LoadUsers = async (payload: {
        paginated: boolean;
        search_type: string;
        keyword: string | number;
        page: number;
        limit: number;
    }) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/users/load-users`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<User[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load users.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadSingleUser(user_id: string): Promise<User> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/users/load-single-user`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user_id: user_id}),
        }).then((resp): Promise<User> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load user info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadTemplates = async (payload: {
        paginated: boolean;
        search_type: string;
        template_type: string;
        page?: number;
        limit?: number;
    }) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(templates)/load-templates`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<TemplateLists[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load templates.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadSingleTemplate(template_id: string): Promise<TemplateDetails> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(templates)/load-single-template`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({search_by: "Temp Id", search_value: template_id}),
        }).then((resp): Promise<TemplateDetails> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load template info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadAutoResponders = async () => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/auto-responders/load-auto-responders`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((resp): Promise<AutoResponderLists[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load auto responders.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadAutoResponder(auto_responder_id: string): Promise<AutoResponderDetails> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/auto-responders/load-single-auto-responder`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({search_by: "AR Id", search_value: auto_responder_id}),
        }).then((resp): Promise<AutoResponderDetails> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load auto responder info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadPropertyRequests = async (payload: {
        paginated: boolean;
        search_type: string,
        request_type: string;
        page: number;
        limit: number;
    }) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/property-requests/load-requests`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<ProperyRequests[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load requests.");
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async AcknowledgeRequest(request_id: number): Promise<boolean> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/property-requests/manage-requests`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({request_id, "type":"Single"}),
        }).then((resp): Promise<boolean> => {
            if (!resp.ok) {
                throw new Error("Unable to update requests.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async AcknowledgeMultiRequest(request_ids: string[]): Promise<APIResponseProps>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/property-requests/manage-requests`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({request_ids, "type":"Multiple"}),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to update requests.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public LoadProperties = async (payload: 
        {page?: string | number | string[], limit?: number, type: string, mls_number?: string, property_id?: number }
    ) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/properties/load-properties`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load properties.")
            }

            return resp.json();
        }).then(data => {
            return data
        }) 

    }

    public async LoadSingleProperty(payload: {property_id: number}) {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/properties/load-single-property`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load property.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async LoadCities() {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/properties/load-property-cities`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load cities.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadReservations = async (payload: any) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/reservations/load-reservations`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load reservations.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadSingleReservations(payload: {reservation_id: number}) {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/reservations/load-single-reservation`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load reservation.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

     public LoadMiniReservations = async (payload: any) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/admin/reservations/load-mini-reservations`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load mini reservations.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public rTrim(hay: string, niddle: string): string {
        if (hay.endsWith(niddle)) {
            return hay.slice(0, -1*niddle.length);
        }
        return hay;
    }

     public lTrim(hay: string, niddle: string): string {
        if (hay.startsWith(niddle)) {
            return hay.slice(1);
        }
        return hay;
    }

    public BuildSearchFilterNoJoin(req: NextApiRequest): [string, string] {

        const req_body = req.body;
        let qry_loc = "";
        let qry_beds = "";
        let qry_baths = "";
        let qry_price = "";
        let amenities_qry = "";
        let equipments_qry = "";
        let interior_qry = "";
        let exterior_qry = "";
        let availability_qry = "";
        let order_by = "";
        let min_price = this.formatDecimal(req_body.min_price.toString());
        let max_price = this.formatDecimal(req_body.max_price.toString());

        if(req_body.neighborhood && req_body.neighborhood !="" && req_body.neighborhood !="All Neighborhoods"){
            qry_loc = ` AND (neighborhood='${req_body.neighborhood}') `;
        }

        if((req_body.min_bed && req_body.min_bed !='0' && req_body.min_bed!='') || (req_body.max_bed && req_body.max_bed !='0' && req_body.max_bed!='')){

            if((req_body.min_bed!='0' && req_body.min_bed!='') && (req_body.max_bed=='0' || req_body.max_bed=='')){
                qry_beds = ` AND (beds >= ${req_body.min_bed}) `; // AND beds > 0
            }else if((req_body.min_bed=='0' || req_body.min_bed=='') && (req_body.max_bed!='0' && req_body.max_bed!='')){
                qry_beds = ` AND (beds <= ${req_body.max_bed}) `; // AND beds > 0
            }else if((req_body.min_bed!='0' && req_body.min_bed!='') && (req_body.max_bed!='0' && req_body.max_bed!='')){
                qry_beds = ` AND (beds >= ${req_body.min_bed} AND beds <= ${req_body.max_bed}) `; // AND beds > 0
            }  
        
        }

        if((req_body.min_bath && req_body.min_bath!='0' && req_body.min_bath!='') || (req_body.max_bath && req_body.max_bath!='0' && req_body.max_bath!='')){

            if((req_body.min_bath!='0' && req_body.min_bath!='') && (req_body.max_bath=='0' || req_body.max_bath=='')){
                qry_baths = ` AND (baths >= ${req_body.min_bath}) `; // AND baths > 0
            }else if((req_body.min_bath=='0' || req_body.min_bath=='') && (req_body.max_bath!='0' && req_body.max_bath!='')){
                qry_baths = ` AND (baths <= ${req_body.max_bath}) `; // AND baths > 0
            }else if((req_body.min_bath!='0' && req_body.min_bath!='') && (req_body.max_bath!='0' && req_body.max_bath!='')){
                qry_baths = ` AND (baths >= ${req_body.min_bath} AND baths <= ${req_body.max_bath}) `; // AND baths > 0   
            }  
        
        }

        if((min_price!='0' && min_price!='') || (max_price!='0' && max_price!='')){

            if((min_price!='0' && min_price!='') && (max_price=='0' || max_price=='')){
                qry_price = ` AND (listprice >= ${min_price}) `; // AND listprice > 0
            }else if((min_price=='0' || min_price=='') && (max_price!='0' && max_price!='')){
                qry_price = ` AND (listprice <= ${max_price}) `; // AND listprice > 0
            }else if((min_price!='0' && min_price!='') && (max_price!='0' && max_price!='')){
                qry_price = ` AND (listprice >= ${min_price} AND listprice <= ${max_price}) `; // AND listprice > 0   
            }  
        
        }else{
            qry_price = " AND listprice > 0";
        }

        if(Array.isArray(req_body.amenities) && req_body.amenities.length > 0){
            //amenities_qry = ` AND ( JSON_OVERLAPS(prop_amenities, '${JSON.stringify(req_body.amenities)}') ) `;
            const conditions = req_body.amenities.map((element: any) => `JSON_CONTAINS(prop_amenities, '["${element}"]')`);
            amenities_qry = ` AND (${conditions.join(' AND ')}) `;
        } 

        if(Array.isArray(req_body.equipments) && req_body.equipments.length > 0){
            //equipments_qry = ` AND ( JSON_OVERLAPS(equipments, '${JSON.stringify(req_body.equipments)}') ) `;
            const conditions = req_body.equipments.map((element: any) => `JSON_CONTAINS(equipments, '["${element}"]')`);
            equipments_qry = ` AND (${conditions.join(' AND ')}) `;
        } 

        if(Array.isArray(req_body.interior_features) && req_body.interior_features.length > 0){
            //interior_qry = ` AND ( JSON_OVERLAPS(interior_features, '${JSON.stringify(req_body.interior_features)}') ) `;
            const conditions = req_body.interior_features.map((element: any) => `JSON_CONTAINS(interior_features, '["${element}"]')`);
            interior_qry = ` AND (${conditions.join(' AND ')}) `;
        } 

        if(Array.isArray(req_body.exterior_features) && req_body.exterior_features.length > 0){
            //exterior_qry = ` AND ( JSON_OVERLAPS(prop_exterior_features, '${JSON.stringify(req_body.exterior_features)}') ) `;
            const conditions = req_body.exterior_features.map((element: any) => `JSON_CONTAINS(exterior_features, '["${element}"]')`);
            exterior_qry = ` AND (${conditions.join(' AND ')}) `;
        }   

        if(req_body.move_in && req_body.move_in!='' && req_body.move_out && req_body.move_out!=''){
            availability_qry = ` AND (available_on<='${req_body.move_in}')  `;
        }

        if(req_body.sort_by=="Sqft-ASC"){
            order_by = "size_sqft ASC";   
        }else if(req_body.sort_by=="Sqft-DESC"){
            order_by="size_sqft DESC";   
        }else if(req_body.sort_by=="Baths-ASC"){
            order_by="baths ASC";    
        }else if(req_body.sort_by=="Baths-DESC"){
            order_by="baths DESC";    
        }else if(req_body.sort_by=="Beds-ASC"){
            order_by="beds ASC";    
        }else if(req_body.sort_by=="Beds-DESC"){
            order_by="beds DESC";    
        }else if(req_body.sort_by=="Price-ASC"){
            order_by="listprice ASC";   
        }else if(req_body.sort_by=="Price-DESC"){
            order_by="listprice DESC";   
        }else if(req_body.sort_by=="Date-ASC"){
            order_by="available_on ASC";   
        }else if(req_body.sort_by=="Date-DESC"){
            order_by="available_on DESC";   
        }else{ /** not set **/
            order_by="available_on DESC";  
        }
        
        return [`${qry_loc} ${qry_beds} ${qry_baths} ${qry_price} ${amenities_qry} ${equipments_qry} ${interior_qry} 
            ${exterior_qry} ${availability_qry} `, order_by];
    }

    public BuildSearchFilterForJoins(req: NextApiRequest): [string, string] {

        const req_body = req.body;
        let qry_loc = "";
        let qry_beds = "";
        let qry_baths = "";
        let qry_price = "";
        let amenities_qry = "";
        let equipments_qry = "";
        let interior_qry = "";
        let exterior_qry = "";
        let availability_qry = "";
        let order_by = "";
        let min_price = this.formatDecimal(req_body.min_price.toString());
        let max_price = this.formatDecimal(req_body.max_price.toString());

        if(req_body.neighborhood && req_body.neighborhood !="" && req_body.neighborhood !="All Neighborhoods"){
            qry_loc = ` AND (p.neighborhood='${req_body.neighborhood}') `;
        }

        if((req_body.min_bed && req_body.min_bed !='0' && req_body.min_bed!='') || (req_body.max_bed && req_body.max_bed !='0' && req_body.max_bed!='')){

            if((req_body.min_bed!='0' && req_body.min_bed!='') && (req_body.max_bed=='0' || req_body.max_bed=='')){
                qry_beds = ` AND (p.beds >= ${req_body.min_bed}) `; // AND beds > 0
            }else if((req_body.min_bed=='0' || req_body.min_bed=='') && (req_body.max_bed!='0' && req_body.max_bed!='')){
                qry_beds = ` AND (p.beds <= ${req_body.max_bed}) `; // AND beds > 0
            }else if((req_body.min_bed!='0' && req_body.min_bed!='') && (req_body.max_bed!='0' && req_body.max_bed!='')){
                qry_beds = ` AND (p.beds >= ${req_body.min_bed} AND p.beds <= ${req_body.max_bed}) `; // AND beds > 0
            }  
        
        }

        if((req_body.min_bath && req_body.min_bath!='0' && req_body.min_bath!='') || (req_body.max_bath && req_body.max_bath!='0' && req_body.max_bath!='')){

            if((req_body.min_bath!='0' && req_body.min_bath!='') && (req_body.max_bath=='0' || req_body.max_bath=='')){
                qry_baths = ` AND (p.baths >= ${req_body.min_bath}) `; // AND baths > 0
            }else if((req_body.min_bath=='0' || req_body.min_bath=='') && (req_body.max_bath!='0' && req_body.max_bath!='')){
                qry_baths = ` AND (p.baths <= ${req_body.max_bath}) `; // AND baths > 0
            }else if((req_body.min_bath!='0' && req_body.min_bath!='') && (req_body.max_bath!='0' && req_body.max_bath!='')){
                qry_baths = ` AND (p.baths >= ${req_body.min_bath} AND p.baths <= ${req_body.max_bath}) `; // AND baths > 0   
            }  
        
        }

        if((min_price!='0' && min_price!='') || (max_price!='0' && max_price!='')){

            if((min_price!='0' && min_price!='') && (max_price=='0' || max_price=='')){
                qry_price = ` AND (p.listprice >= ${min_price}) `; // AND listprice > 0
            }else if((min_price=='0' || min_price=='') && (max_price!='0' && max_price!='')){
                qry_price = ` AND (p.listprice <= ${max_price}) `; // AND listprice > 0
            }else if((min_price!='0' && min_price!='') && (max_price!='0' && max_price!='')){
                qry_price = ` AND (p.listprice >= ${min_price} AND p.listprice <= ${max_price}) `; // AND listprice > 0   
            }  
        
        }else{
            qry_price = " AND p.listprice > 0";
        }

        if(Array.isArray(req_body.amenities) && req_body.amenities.length > 0){
            //amenities_qry = ` AND ( JSON_OVERLAPS(prop_amenities, '${JSON.stringify(req_body.amenities)}') ) `;
            const conditions = req_body.amenities.map((element: any) => `JSON_CONTAINS(p.prop_amenities, '["${element}"]')`);
            amenities_qry = ` AND (${conditions.join(' AND ')}) `;
        } 

        if(Array.isArray(req_body.equipments) && req_body.equipments.length > 0){
            //equipments_qry = ` AND ( JSON_OVERLAPS(equipments, '${JSON.stringify(req_body.equipments)}') ) `;
            const conditions = req_body.equipments.map((element: any) => `JSON_CONTAINS(p.equipments, '["${element}"]')`);
            equipments_qry = ` AND (${conditions.join(' AND ')}) `;
        } 

        if(Array.isArray(req_body.interior_features) && req_body.interior_features.length > 0){
            //interior_qry = ` AND ( JSON_OVERLAPS(interior_features, '${JSON.stringify(req_body.interior_features)}') ) `;
            const conditions = req_body.interior_features.map((element: any) => `JSON_CONTAINS(interior_features, '["${element}"]')`);
            interior_qry = ` AND (${conditions.join(' AND ')}) `;
        } 

        if(Array.isArray(req_body.exterior_features) && req_body.exterior_features.length > 0){
            //exterior_qry = ` AND ( JSON_OVERLAPS(prop_exterior_features, '${JSON.stringify(req_body.exterior_features)}') ) `;
            const conditions = req_body.exterior_features.map((element: any) => `JSON_CONTAINS(exterior_features, '["${element}"]')`);
            exterior_qry = ` AND (${conditions.join(' AND ')}) `;
        }   

        // if(req_body.move_in && req_body.move_in!='' && req_body.move_out && req_body.move_out!=''){
        //     availability_qry = ` AND (p.available_on<='${req_body.move_in}')  `;
        // }

        if(req_body.sort_by=="Sqft-ASC"){
            order_by = "p.size_sqft ASC";   
        }else if(req_body.sort_by=="Sqft-DESC"){
            order_by="p.size_sqft DESC";   
        }else if(req_body.sort_by=="Baths-ASC"){
            order_by="p.baths ASC";    
        }else if(req_body.sort_by=="Baths-DESC"){
            order_by="p.baths DESC";    
        }else if(req_body.sort_by=="Beds-ASC"){
            order_by="p.beds ASC";    
        }else if(req_body.sort_by=="Beds-DESC"){
            order_by="p.beds DESC";    
        }else if(req_body.sort_by=="Price-ASC"){
            order_by="p.listprice ASC";   
        }else if(req_body.sort_by=="Price-DESC"){
            order_by="p.listprice DESC";   
        }else if(req_body.sort_by=="Date-ASC"){
            order_by="p.available_on ASC";   
        }else if(req_body.sort_by=="Date-DESC"){
            order_by="p.available_on DESC";   
        }else{ /** not set **/
            order_by="p.available_on DESC";  
        }
        
        return [`${qry_loc} ${qry_beds} ${qry_baths} ${qry_price} ${amenities_qry} ${equipments_qry} ${interior_qry} 
            ${exterior_qry} ${availability_qry} `, order_by];
    }

    public formatPrice(price: number): string {
        if (price >= 1000000) {
            let val = (price / 1000000).toFixed(1);
            val = val.replace(".0","");
            return val+ 'M';
        } else if (price >= 1000) {
            let val = (price / 1000).toFixed(1);
            val = val.replace(".0","");
            return val+ 'K';
        } else {
            return price.toString();
        }
    }

    public formatCurrency(value: string) {
        if (!value) return '$0';

        // Remove any non-digit characters
        const cleanValue = value.replace(/[^0-9.]/g, '');
        // Convert the cleaned value to a number
        let formattedValue = "$0";
        if(cleanValue && cleanValue!= ""){
            const numberValue = parseFloat(cleanValue);
            // Format the number
            formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(numberValue);
        }else{
            formattedValue = "";
        }
        
        return formattedValue;
    }

    public formatNumber(value: string) {
        if (!value) return '0';
        // Remove any non-digit characters
        const cleanValue = value.replace(/\D/g, '');
        // Convert the cleaned value to a number
        let formattedValue = "0";
        if(cleanValue && cleanValue!= ""){
            const numberValue = parseFloat(cleanValue);
            // Format the number
            formattedValue = new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(numberValue);
        }else{
            formattedValue = "";
        }
        
        return formattedValue;
    }

    public formatDecimal(input: string) {
        if(input){
            input = input.replace(/[^0-9.]/g, '');
        }
        return input;
    }

    public stringToBoolean(value: string): boolean | undefined {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        return undefined;
    }

}
