export const GET_CHATS = 'GET_CHATS'
export const ADD_CHAT = 'ADD_CHAT'
export const SWITCH_CHAT = 'SWITCH_CHAT'

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
      } else {
        console.error('Error saving file locations:', data.message);
      }
      dispatch({
          type: ADD_CHAT,
          chat_id: data.chatId,
          chatTitle: chatTitle,
          docs: fileLocations,
          createdAt: data.createdAt
        })
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
  
  export const switchChat = (index) => async (dispatch) => {
    dispatch({type: SWITCH_CHAT,
      index: index})
  }
  