import {GET_CHATS, ADD_CHAT, SWITCH_CHAT, CREATE_EMPTY_CHAT} from '../actions/chat'
import Chat from '../../models/Chat'
const initialState = {
    chats: [],
    index: 0,
    emptyChat: true
  };

const docReducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_CHATS:
        let chats = action.chats || [];
        if(state.emptyChat) {
          chats.unshift(new Chat("000000000", "Chat With your Docs", [], new Date()));
        }
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
        console.log(chat)
        return {
          ...state,
          chats: [chat, ...state.chats],
          index: 0,
          emptyChat: false
        };
      case SWITCH_CHAT:
        return {
          ...state,
          index: action.index,
          emptyChat: false
        }
      case CREATE_EMPTY_CHAT:
        state.chats.unshift(new Chat("000000000", "Chat With your Docs", [], new Date()));
        return {
          ...state
        }
      default:
        return state;
    }
  };
  
export default docReducer;