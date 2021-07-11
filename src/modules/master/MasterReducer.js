import {STORE, APP, MASTER} from './MasterConfig';

const initialState = {
  store: null,
  loading: false,  
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case STORE.SET_STORE: {
      return {
        ...state,
        store: action.res,
      };
    }
    case APP.SET_LOADING: {
      return {
        ...state,
        loading: action.res,
      };
    }
    default: {
      return state;
    }
  }
};

const initialStateMaster = {
  fetch: false,
  send: null,
  res: null,
  err: null,
  action: '',
}

export const masterReducer = (state = initialStateMaster, action) => {
  switch (action.type) {
    case MASTER.SET_CATEGORY_ITEM_FETCH: {
      return {
        ...state,
        fetch: true,
        action: action.type,
        err: null,
      };
    }
    case MASTER.SET_CATEGORY_ITEM_SUCCESS: {
      return {
        ...state,
        fetch: false,
        res: action.res,
        action: action.type,
        err: null,
      };
    }
    case MASTER.SET_CATEGORY_ITEM_FAILED: {
      return {
        ...state,
        fetch: false,
        action: action.type,
        err: action.err,
      };
    }
    default: {
      return state;
    }
  }
};
