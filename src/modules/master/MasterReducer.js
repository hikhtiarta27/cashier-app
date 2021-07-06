import {STORE, APP} from './MasterConfig'

const initialState = {
  store: null,
  loading: false,
}

export const userReducer = (state = initialState, action) =>{
  switch(action.type){
    case STORE.SET_STORE:{
      return {
        ...state,
        store: action.res
      } 
    }
    case APP.SET_LOADING:{
      return {
        ...state,
        loading: action.res
      } 
    }
    default: {
      return state
    }
  }
}