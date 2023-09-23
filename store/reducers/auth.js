import { LOGIN, SIGNUP, LOGOUT } from '../actions/auth';
const initialState = {
  isAuthenticated: false,
  userId: null,
  token: null,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        isAuthenticated: action.auth, 
        token: action.token,
        userId: action.userId
      };
    case SIGNUP:
      return {
        isAuthenticated: action.auth, 
        token: action.token,
        userId: action.userId,
      };
    case LOGOUT:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

export default authReducer;
