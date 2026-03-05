// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from './slices/CheckoutSlice';

export const store = configureStore({
    reducer: {
        checkout: checkoutReducer
    }
});

// typed helper types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;