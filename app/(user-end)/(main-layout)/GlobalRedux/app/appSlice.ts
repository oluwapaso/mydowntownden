import { compStateProps } from "@/components/types";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const compState: compStateProps = { 
    address_1:"",
    address_2:"",
    company_name:"",
    default_email:"",
    facebook:"",
    instagram:"",
    phone_number:"",
    twitter:"", 
    youtube:"", 
    tiktok:"", 
    privacy_policy:"", 
    terms_of_service:"", 
    error:"",
    amenities: null,
    interior_features: null,
    exterior_features: null,
    apartment_rules: null,
    equipments: null,
    menu_opened: false,
    showPageLoader: false,
}

export const FetchCompInfo = createAsyncThunk("app/fetch_comp_info", async (_, {rejectWithValue}) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    return await fetch(`${apiBaseUrl}/api/admin/settings/get-company-info`, {
        method: "POST",
        headers:{
            'Content-Type': 'application/json',
        }
    }).then((resps): Promise<compStateProps> => {
        return resps.json()
    }).then(data => {
        //console.log("data:", data)
        return data
    }).catch( e => {
        return rejectWithValue(e.message)
    })
})

export const appSlice = createSlice({
    name:"app_slice",
    initialState: compState,
    reducers:{
        menu_toggled:(_state, action)=>{
            return {
                ...compState,
                menu_opened: action.payload
            }
        },
        showPageLoader: (state) => {
            state.showPageLoader = true
        },
        hidePageLoader: (state) => {
            state.showPageLoader = false
        }
    },
    extraReducers(builder) {
        builder.addCase(FetchCompInfo.rejected, (state)=>{
            state.error = "Unable to load company settings"
        })

        builder.addCase(FetchCompInfo.fulfilled, (state, action:PayloadAction<any>)=> {

            if(typeof action.payload && typeof action.payload == "object"){
                
                if(action.payload.success){

                    return {
                        ...action.payload.data,
                        error: ""
                    }

                }else{
                    return { ...compState, error: action.payload.message}
                }

            }else{
                return { ...compState, error: "Unknow error."}
            }

        })
    },
})

export const { menu_toggled, showPageLoader, hidePageLoader } = appSlice.actions;
export default appSlice.reducer