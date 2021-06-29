import {OTHER} from './OtherConfig'

const initialState = {
  password: 'WIJAYA_JOHAN'
}

export const userReducer = (state = initialState, action) =>{
  switch(action.type){
    case OTHER.SET_PASSWORD : {
      return {
        ...state,
        password: action.res
      }
    }
    default: {
      return state
    }
  }
}