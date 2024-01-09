export const GET_TUTOR = "GET_TUTOR"
export const SET_TUTOR = "SET_TUTOR"

export const getChats = () => async (dispatch, getState) => {
    const userId = getState().auth.userId;
    const response = await fetch(`/api/getTutors?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    
    if (data.tutors) {
        console.log('Received chats:', data.tutors);
    } else {
        console.error('Error fetching chats:', data.error);
    }
    
    dispatch({
        type: GET_TUTOR,
        tutors: data.tutors
    })
  };