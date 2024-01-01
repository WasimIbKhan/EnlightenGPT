export const GET_CHATS = 'GET_CHATS'
export const ADD_CHAT = 'ADD_CHAT'
export const SWITCH_CHAT = 'SWITCH_CHAT'
export const CREATE_EMPTY_CHAT = 'CREATE_EMPTY_CHAT'
import Chat from '@/models/Chat'
import { Storage } from 'aws-amplify';

export const getChats = () => async (dispatch, getState) => {
    const userId = getState().auth.userId;
    const response = await fetch(`/api/getChats?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    
    if (data.chats) {
        console.log('Received chats:', data.chats);
    } else {
        console.error('Error fetching chats:', data.error);
    }
    
    dispatch({
        type: GET_CHATS,
        chats: data.chats
    })
  };


  export const addChat = (chatTitle, files) => async (dispatch, getState) => {
    try {
      const userId = getState().auth.userId;
      const fileLocations = await uploadFilesToAmplifyStorage(files);
      console.log('File locations:', fileLocations);
      const response = await fetch('/api/addChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId, chatTitle: chatTitle, fileLocations: fileLocations }),
      });
      const data = await response.json();

      if (data.success) {
        console.log('File locations saved successfully!');
        console.log(data)
      } else {
        console.error('Error saving file locations:', data.chatId, fileLocations);
      }
      const date = data.createdAt
      const newChat = new Chat(
        data.chatId,
        chatTitle,
        fileLocations,
        date
      )
      dispatch({
          type: ADD_CHAT,
          chat_id: data.chatId,
          chatTitle: chatTitle,
          docs: fileLocations,
          createdAt: date
        })
        return newChat;
    } catch (error) {
      console.error('Error saving file locations:', error);
    }
    
  };
  
  const uploadFilesToAmplifyStorage = async (files) => {
    const fileLocations = [];
  
    if (!files || files.length === 0) {
      console.log('No files to upload.');
      return fileLocations;
    }
  
    try {
      for (let file of files) {
        const result = await Storage.put(file.name, file, {
          contentType: file.type,
        });
        console.log(`Uploaded file: ${result.key}`);
  
        
        fileLocations.push(result.key);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  
    return fileLocations;
  };
  
  export const uploadTempFilesToAmplifyStorage = async (files) => {
    const fileLocations = [];
  
    if (!files || files.length === 0) {
      console.log('No files to upload.');
      return fileLocations;
    }
  
    try {
      for (let file of files) {
        const result = await Storage.put(file.name, file, {
          contentType: file.type,
          //deletes files automatically after 5 minutes, delete lamba function and cloudwatch if remove
          //tagging: "Temporary=True",
        });
        console.log(`Uploaded file: ${result.key}`);
  
        
        fileLocations.push(result.key);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  
    return fileLocations;
  };

  export const switchChat = (index) => async (dispatch) => {
    dispatch({type: SWITCH_CHAT,
      index: index})
  }
  
  export const createEmptyChat  = () => async (dispatch) => {
    dispatch({
      type: CREATE_EMPTY_CHAT,
    })
  }