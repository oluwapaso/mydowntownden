import { combineReducers, configureStore } from "@reduxjs/toolkit";
import appReducer from "./app/appSlice";
import storage from "redux-persist/lib/storage"; 
import { persistReducer, persistStore } from "redux-persist";
import citySlice from "./cities/citySlice";

const rootReducers = combineReducers({
    app: appReducer,
    cities: citySlice
})

const persistedStorage = persistReducer({key:"main_root", storage:storage}, rootReducers)

export const store = configureStore({
    reducer: persistedStorage,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck:false})
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store)