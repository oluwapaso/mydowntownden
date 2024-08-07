export type AppSettings = {
    menu_opened: boolean
}

export type AdminLoginParams = {
    username: string
    password: string
}

export type AdminStateProps = {
    admin_id: number | null
    session_id?: string
    token?: string
    email?: string
    status?: string
    isLogged: boolean
    isLogginIn: boolean
    showPageLoader: boolean
    super_admin: "Yes" | "No"
    error?: string
}

export type AdminInfo = {
    admin_id: number
    firstname: string
    lastname: string
    username: string
    email: string
    phone: string
    status: "Active" | "Inactive" | "Reset Password"
    super_admin: "Yes" | "No"
    token?: string
    total_records?: number
}

export type APIResponseProps = {
  message: string
  data?: any
  success?: boolean
}

export type TemplateLists = {
    template_id: number
    template_type: string
    template_name: string
    email_subject: string
    email_body: string
    sms_body: string
    total_records: number
}

export type TemplateDetails = Omit<TemplateLists, "total_records">

export type LoadTemplatesParams = {
    paginated: boolean
    search_type: string
    page: number
    limit: number
    template_type?: string
}


export type AutoResponderLists = {
    auto_responder_id: number
    name: string
    type: string
    ar_type: string
    email_subject: string
    email_body: string
    sms_body: string
    send_ar: string
    descriptions: string
    total_records: number
}

export type AutoResponderDetails = Omit<AutoResponderLists, "total_records">

export type LoadSingleAutoResponderParams = {
    search_by: string
    search_value: string | number
    template_type?: string
}

export type UpdateAutoResponderParams = { 
    auto_responder_id: number
    type: string
    send_ar: string
    name: string
    email_subject: string
    email_body: string
    sms_body: string
}

export type BlogCommentsListsParams = {
    comment_id: number
    post_id: number
    comment_body: string
    comment_parent: string
    name: string
    email: string
    reply_by: string
    date_added: string
}

export type LoadPostCommentsParams = {
    post_id: number
    paginated: boolean
    page: number
    limit: number
}

export type CommonBlogPostInfoParams = {
    post_title: string
    slug: string
    excerpt: string
    post_body: string
    views: number
    comments: number
    date_added: string
    header_image: any
    show_on_menus: any
    categories: string
}

export type BlogPostInfoParams = {
    draft_id: number
    post_id: number
    info: CommonBlogPostInfoParams
    published: string
    total_records: number
}

export type BlogDraftsInfoParams = {
    post_id: number
    post_draft_id: number
    info: CommonBlogPostInfoParams
    published: string
    header_image: string
    published_header_image: string
}

export type User = {
    user_id: number
    email: string
    secondary_email: string
    firstname: string
    lastname: string
    phone_1: string
    phone_2: string
    work_phone: string
    fax: string
    street_address: string
    city: string
    state: string
    zip: string
    country: string
    price_range: string
    spouse_name: string
    profession: string
    birthday: string
    source: string
    date_added: string
    facebook: string
    linkedin: string
    twitter: string
    tictoc: string
    whatsapp: string
    background: string
    sub_to_updates: string
    sub_to_mailing_lists: string
    status: string
    lead_stage: string
    last_seen: string
    token?: string
    total_records?: number
}

export type CheckedItems = {
    [key: number]: boolean;
};

export type ProperyRequests = {
    request_id: number
    user_id: number
    firstname: string
    lastname: string
    request_type: string
    request_info: string
    status: string
    date_added: string
    total_records?: number
}

export type LoadUserRequestsParams = {
    user_id: number
}

export type UpdateCompanyParams = {
    address_1: string
    address_2: string
    company_id: number
    company_name: string
    default_email: string
    facebook: string
    instagram: string
    phone_number: string
    twitter: string 
    youtube: string 
    tiktok: string
}

export type UpdateAPIParams = {
    google_auth_client_id: string
    google_auth_client_secret: string
    facebook_auth_app_id: string
    facebook_auth_app_secret:number
    google_map_key: string
    sendgrid_key: string
    sendgrid_mailer: string
}

export type UpdatePropDataParams = {
    interior_features: string
    exterior_features: string
    amenities: string
    equipments: string
    apartment_rules: string
}

export type CkEditorProps = {
    data: string
    onDataChange: (data: string) => void
    height?: string
    setEditor?: React.Dispatch<any>
}

export type GetAgentsParams = {
    page: number
    limit: number
}

export type AddAdminParams = { 
    firstname: string
    lastname: string
    email: string
    phone: string
    role: string
    error: string
}

export type UpdateAdminParams = AddAdminParams & {admin_id: string}

export type GetResetTokenParams = {
    search_by: string
    email?: string
    token?: string
}

export type AddTokenParams = {
    email: string
    date: string
    token: string
}

export type SendMailParams = {
    user_id: number
    mailer: string
    from_email: string
    to_email: string
    subject: string
    body: string
    message_type: string,
    batch_id?: number,
    user_firstname?: string,
    user_lastname?: string,
    user_email?: string,
    user_phone?: string,
}

export type SentMailParams = Omit<SendMailParams, "mailer">

export type QueueError = {
    queue_id: number
    error_message: string
}

export type UserLoginParams = {
    email: string
    password: string
}

export type UserAuthParams = {
    email: string
    name: string
}

export type GetSingleUserParams = {
    search_by: string
    fields: string
    email?: string
    user_id?: string
}

export type LoadUsersParams = {
    paginated: boolean
    search_type: string
    page: number
    limit: number
    keyword?: string
    lead_stage?: string
}

export type UpUserPasswordParams = {
    account_email: string
    user_id: number
    password: string
}

export type GetSingleAdminParams = {
    search_by: string
    fields: string
    email?: string
    admin_id?: string
}

export type UpAdminPasswordParams = {
    account_email: string
    admin_id: number
    password: string
}

export type LoadRequestsParams = {
    paginated: boolean
    request_type: string
    page: number
    limit: number
}

export type AcknowledgeRequestParams = {
    request_id: number
}

export type AcknowledgeMultiRequestParams = {
    request_ids: string[]
}

export type USA_State = {
    name: string;
    code: string;
}

export type OptionsType = {
    name: string;
    code: string;
}

export type InputExtraField = {
    pet_disabled: boolean;
    parking_disabled: boolean;
}

export type UnitDataType = {
    unit_id: number,
    unit_number: string,
    beds: number,
    baths: number,
    listprice: string,
    size_sqft: string,
    beds_list: any[],
    interior_features?: string[],
    equipments?: string[],
    utilities_per_month?: string,
    service_fee?: string,
    cleaning_and_stocking_fee?: string,
    insurance_fee?: string,
    utilities_includes?: string,
    unit_description: string,
    status: "Vacant" | "Occupied",
}

export type AddPropertyType = {
    property_type: "Single Unit Type" | "Multi Unit Type",
    property_name: string,
    address: string,
    state: string,
    zip_code: string,
    city: string,
    neighborhood: string,
    country: string,
    latitude: string,
    longitude: string,
    year: string,
    mls_number: string,
    prop_exterior_features: string[],
    prop_amenities: string[],
    unit_description: string,
    neighborhood_overview: string,
    pets_allowed: "Yes" | "No",
    max_num_of_pets: string,
    one_time_pets_fee: string,
    each_pets_fee_per_month: string,
    weight_limit_and_restrictions: string,
    prohibited_animals_and_breeds: string,
    parking_available: "Yes" | "No" | "Third Party",
    parking_fee_required: "Yes" | "No" | "Call For Information",
    parking_fee: string,
    max_num_of_vehicle: string,
    parking_descriptions: string,
    move_in_time: string,
    move_out_time: string,
    apartment_rules: string[],
    unit_data: UnitDataType[],
}


export type AddPropertyParams = {
    property_type: string; // "Single Unit Type"
    unit_number: string; // "1"
    total_units: number,
    property_name: string; // "Fine Home"
    address: string; // "8150 Ponce De Leon Rd"
    state: string; // "FL"
    zip_code: string; // "33101"
    city: string; // "Miami"
    neighborhood: string; // "East Boston"
    country: string; // "United States"
    latitude: number; // 25.6963593
    longitude: number; // -80.2733863
    year: string; // "2000"
    unit_mls_number: string;
    mls_number: string; // "9444"
    beds: string; // "2"
    baths: string; // "2.5"
    listprice: string; // "$2,500"
    size_sqft: string; // "47,873"
    utilities_per_month: string; // "$120"
    service_fee: string; // "$250"
    cleaning_and_stocking_fee: string; // "$350"
    insurance_fee: string; // "$65"
    beds_list: string; // ["King Bed", "Queen Bed"]
    pets_allowed: string; // "Yes"
    max_num_of_pets: string; // "1"
    each_pets_fee_per_month: string; // "$80"
    one_time_pets_fee: string; // "$250"
    weight_limit_and_restrictions: string; // ""
    prohibited_animals_and_breeds: string; // "Pitbull"
    prop_exterior_features: string; // ["Fense", "Pool"]
    prop_amenities: string; // ["Pool", "Patio"]
    interior_features: string; // ["Basement", "AC"]
    equipments: string; // ["Washing Machine", "Dryer"]
    unit_description: string; // "Nice"
    neighborhood_overview: string; // "Cool"
    parking_available: string; // "Yes"
    parking_fee_required: string; // "Yes"
    parking_fee: string; // "$120"
    max_num_of_vehicle: string; // "2"
    parking_descriptions: string; // "Ground level"
    move_in_time: string; // "8:00 PM"
    move_out_time: string; // "11:00 AM"
    apartment_rules: string; // ["No loud music", "No smoking", "No parties or events allowed"]
    utilities_includes: string; // "TV, internet"
    status: "Vacant" | "Occupied"; 
    images: string; // "TV, internet"
};

export interface CustomFile {
    filepath: string;
    newFilename: string;
}

export type PropertyLists = Omit<AddPropertyParams, ""> & {
    property_id: number,
    unit_number: string,
    status: string,
    units_occupied: number,
    date_added: string,
    total_records?: number
}

export type PropertyDetails = Omit<PropertyLists, "total_records">

export type UpdatePropertyParams = Omit<AddPropertyParams, ""> & {
    property_id: number,
    original_mls_number: string,
}

export type CloneUnitParams = UpdatePropertyParams


export type compStateProps ={
    address_1: string
    address_2: string
    company_name: string
    default_email: string
    facebook: string
    instagram: string
    phone_number: string
    twitter: string 
    youtube: string 
    tiktok: string
    error: string
    menu_opened: boolean
    showPageLoader: boolean,
    amenities: any,
    interior_features: any,
    exterior_features: any,
    equipments: any,
    apartment_rules: any,
    privacy_policy: any,
    terms_of_service: any,
}

export type NavProps = {
    page: string,
    bg_image?:string
    crumb?: JSX.Element
    max_width?: number
    big_crum?: boolean
}

export type PriceType = {
    value: number
    text :string
}

export type BedsBathsType = {
    value: number
    text :string
}

export type FilterValueTypes = {
    min_price: number,
    max_price: number,
    min_beds: number,
    max_beds: number,
    min_baths: number,
    max_baths: number,
}

export type UpdatePrivacyAndTermsParams = {
    update_type: string
    value: string
}

export type AddReservation = {
    property_id: number,
    mls_number: string,
    first_name: string,
    last_name: string,
    email: string,
    phone_1: string,
    phone_2: string,
    move_in: string,
    move_out: string,
}

export type Reservation = {
    reservation_id: number
    property_id: number
    mls_number: string
    move_in: string
    move_out: string
    firstname: string
    lastname: string
    email: string
    phone_1: string
    phone_2: string
    date_added: string
    total_records: number
}