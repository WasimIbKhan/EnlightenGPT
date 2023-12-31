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
        console.log("empty chat 3", state.emptyChat);
        let chats = action.chats || [];
        chats.unshift(new Chat("000000000", "Chat With your Docs", [], new Date()));

        // Sort chats by createdAt date, from latest to earliest
        chats.sort((a, b) => {
            // Parse dates if they are not already Date objects
            let dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            let dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);

            return dateB - dateA;  // Reverse the order by swapping dateA and dateB
        });

        return {
            ...state,
            chats: chats,
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
      case CREATE_EMPTY_CHAT:
        return {
          emptyChat: true
        }
      default:
        return state;
    }
  };
  
export default docReducer;