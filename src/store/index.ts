import { configureStore } from '@reduxjs/toolkit';
import { currentUserSlice, guildsSlice, presenceSlice } from './gateway';
import { enableMapSet } from 'immer';

enableMapSet();
export const store = configureStore({
  reducer: {
    currentUser: currentUserSlice.reducer,
    guilds: guildsSlice.reducer,
    presence: presenceSlice.reducer,
  },
  middleware: (gdm) => gdm({ serializableCheck: false }),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
