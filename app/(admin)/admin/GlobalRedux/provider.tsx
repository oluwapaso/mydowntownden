"use client"

import React from "react";
import { Provider } from "react-redux"
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            {/** PersistGate delays the rendering of your app's UI until your persisted state has been retrieved and saved to Redux. **/}
            <PersistGate persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    )
}