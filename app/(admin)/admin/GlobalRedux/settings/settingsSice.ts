import { AppSettings } from "@/components/types";
import { createSlice } from "@reduxjs/toolkit";

const initial_app_settings: AppSettings = {
    menu_opened: true,
}

const AppSlice = createSlice({
    "name":"app_menu_satte",
    initialState: initial_app_settings,
    reducers: {
        menu_toggled: (state, action) => {
            return {
                ...state,
                menu_opened: action.payload
            }
        },
    },
})

export const {menu_toggled} = AppSlice.actions
export default AppSlice.reducer