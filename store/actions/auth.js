import { Amplify, Auth } from 'aws-amplify';
import awsExports from '../../src/aws-exports';
Amplify.configure(awsExports);
import axios from 'axios';

export const LOGIN = 'LOGIN';
export const SIGNUP = 'SIGNUP';
export const LOGOUT = 'LOGOUT';



export const loginUser = (email, password) => async (dispatch) => {
  try {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem(
    'userData',
    JSON.stringify({
      auth: true,
      userId: data.userId,
      token: data.token,
    }),
  );
    try {
      let username = email
      const { user } = await Auth.signIn({
        username,
        password
      });
      } catch (error) {
          console.log('error signing up:', error);
      }
    
  dispatch({
    type: LOGIN,
    auth: true,
    userId: data.userId,
    token: data.token,
  });
  } catch (error) {
    console.log(error.response)
  }
  
};

export const signupUser = (email, password) => async (dispatch) => {
  const username = email
  const { user } = await Auth.signUp({username, password});
  const { data } = await axios.post('/api/auth/signup', { email, password });
  localStorage.setItem(
    'userData',
    JSON.stringify({
      auth: true,
      userId: data.userId,
      token: data.token,
    }),
  );
  dispatch({
    type: SIGNUP,
    auth: true,
    userId: data.userId,
    token: data.token,
  });
};

export const logout = () => (dispatch) => {
  localStorage.removeItem('userData');
  dispatch({ type: LOGOUT });
};
