import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types';

interface CheckoutState {
    items: Product[];
}

const initialState: CheckoutState = { items: [] };

const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    reducers: {
        setItems(state, action: PayloadAction<Product[]>) {
            state.items = action.payload;
        },
        clearItems(state) {
            state.items = [];
        }
    }
});

export const { setItems, clearItems } = checkoutSlice.actions;
export default checkoutSlice.reducer;