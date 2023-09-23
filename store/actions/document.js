export const SET_DOCUMENTS = 'SET_DOCUMENTS';
export const GET_DOCUMENTS = 'GET_DOCUMENTS';

import { Storage } from 'aws-amplify';

export const setDocuments = (chatTitle, files) => async (dispatch, getState) => {
  try {
    const userId = getState().auth.userId;
    const fileLocations = await uploadFilesToAmplifyStorage(files);
    const response = await fetch('/api/addDocuments', {
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
        type: SET_DOCUMENTS,
        docs: fileLocations
      })
  } catch (error) {
    console.error('Error saving file locations:', error);
  }
};

export const getDocuments = (userId) => async (dispatch) => {};

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

      // Get the file URL after uploading
      const fileURL = await Storage.get(result.key);
      fileLocations.push(fileURL);
    }
  } catch (error) {
    console.error('Error uploading files:', error);
  }

  return fileLocations;
};
