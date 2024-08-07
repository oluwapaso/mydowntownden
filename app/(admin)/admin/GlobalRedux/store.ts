import { combineReducers, configureStore, createReducer } from "@reduxjs/toolkit";
import {persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import AdminReducer from "./admin/adminSlice"
import SettingsReducer from "./settings/settingsSice"

//Create browser local storage configuration
const persistConfig = {
    key:"root",
    storage: storage
}

//Combine all reducer to add and persist to local storage
const rootReducers = combineReducers({
    admin: AdminReducer,
    settings: SettingsReducer,
})

//Add the reducers to the browser configuration to persist it
const persistedStorage = persistReducer(persistConfig, rootReducers)

//create a store that uses the persisted data
export const store = configureStore({
    reducer: persistedStorage,
    middleware:(getDefaultMiddleware) => getDefaultMiddleware({serializableCheck:false})
})

//Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

//This starts the persistence process. It save and rehydrate state
export const persistor = persistStore(store)