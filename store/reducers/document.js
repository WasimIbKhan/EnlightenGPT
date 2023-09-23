import {SET_DOCUMENTS, GET_DOCUMENTS} from '../actions/document'

const initialState = {
    docs: [],
  };

const docReducer = (state = initialState, action) => {
    switch (action.type) {
      case SET_DOCUMENTS:
        return {
            docs: action.docs,
        };
      case GET_DOCUMENTS:
        return {
            docs: action.docs,
        };
      default:
        return state;
    }
  };
  
export default docReducer;