
import { AdminLoginParams, AdminStateProps, APIResponseProps } from "@/components/types";
import { AdminService } from "@/_services/admin_service";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initial_state: AdminStateProps = {
    admin_id: null,
    isLogged: false,
    isLogginIn: false,
    showPageLoader: false,
    super_admin: "No",
}

type paramsType = {
    username: string, 
    password: string
}

export const Login = createAsyncThunk("admin/login", async ({username, password}: paramsType, { rejectWithValue }) => {

    const pay_load: AdminLoginParams = {
        username: username,
        password: password,
    }

    const adminService = new AdminService();
    const login = await adminService.Login(pay_load);
    return login;

})

const AdminSlice = createSlice({
    name: "admin_slice",
    initialState: initial_state,
    reducers:{
        emptyError: (state) => {
            state.error = ""
        },
        logout: () => {
            return { ...initial_state, isLogged: false, isLogginIn: false, error: "", showPageLoader: false}
        },
        showPageLoader: (state) => {
            state.showPageLoader = true
        },
        hidePageLoader: (state) => {
            state.showPageLoader = false
        }
    },
    extraReducers(builder){
        builder.addCase(Login.pending, () => { return { ...initial_state, isLogged: false, isLogginIn: true, error:""}})
        builder.addCase(Login.rejected, () => { return { ...initial_state, isLogged: false, isLogginIn: false, error: "Error login in."}})
        builder.addCase(Login.fulfilled, (state, action:PayloadAction<any>)=> {

            if(typeof action.payload && typeof action.payload == "object"){
                
                if(action.payload.success){

                    return {
                        ...action.payload.data,
                        isLogged: true,
                        isLogginIn: false,
                        error: ""
                    }

                }else{
                    return { ...initial_state, isLogged: false, isLogginIn: false, error: action.payload.message}
                }

            }else{
                return { ...initial_state, isLogged: false, isLogginIn: false, error: "Unknow error."}
            }

        })
    }

})

export const {emptyError, logout, showPageLoader, hidePageLoader}  = AdminSlice.actions
export default AdminSlice.reducer