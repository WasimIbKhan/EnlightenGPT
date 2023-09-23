import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { createStore, combineReducers, applyMiddleware, Action, Dispatch } from "redux";
import { Provider } from "react-redux";
import ReduxThunk, { ThunkAction, ThunkDispatch } from "redux-thunk";
import authReducer from '../store/reducers/auth';
import chatReducer from '../store/reducers/chat'
import { useEffect } from 'react';


const rootReducer = combineReducers({
  auth: authReducer,
  chats: chatReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export type AppDispatch = Dispatch<Action<string>> & ThunkDispatch<RootState, unknown, Action<string>>;

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <Provider store={store}>
      <main className={inter.variable}>
        <Component {...pageProps} />
      </main>
    </Provider>
  );
}

export default MyApp;
