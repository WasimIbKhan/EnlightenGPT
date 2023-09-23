import {GET_CHATS, ADD_CHAT, SWITCH_CHAT} from '../actions/chat'
import Chat from '../../models/Chat'
const initialState = {
    chats: [],
    index: 0
  };

const docReducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_CHATS:
        let chats = action.chats || [];
        chats.unshift(new Chat("000000000", "Chat With your Docs", [], new Date()));
        return {
          ...state,
          chats: chats
        };

      case ADD_CHAT:
        const chat = new Chat(
            action.chat_id,
            action.chatTitle,
            action.docs,
            action.createdAt
        )
        return {
          ...state,
            chats: state.chats.concat(chat)
        };
      case SWITCH_CHAT:
        return {
          ...state,
          index: action.index
        }
      default:
        return state;
    }
  };
  
export default docReducer;