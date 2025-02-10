import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
});

// Optional: Export types for use throughout your application
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
