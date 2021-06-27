import {DB, QUERY, CATEGORY} from './DBConfig';

const initialState = {
  fetchDb: false,
  send: null,
  res: null,
  err: null,
  action: '',
  database: null,
};

export const databaseReducer = (state = initialState, action) => {
  switch (action.type) {
    case DB.FETCH: {
      return {
        ...state,
        fetchDb: true,
        send: action.send,
        action: action.type,
        err: null,
      };
    }
    case DB.SUCCESS: {
      return {
        ...state,
        fetchDb: false,
        database: action.database,
        action: action.type,
        err: null,
      };
    }
    case DB.FAILED: {
      return {
        ...state,
        fetchDb: false,
        action: action.type,
        err: action.err,
      };
    }
    case DB.CLOSE: {
      return {
        ...state,
        fetchDb: false,
        action: action.type,
        database: null,
        res: null,
      };
    }
    default: {
      return state;
    }
  }
};

const initialStateQuery = {
  fetchQuery: false,
  send: null,
  res: null,
  err: null,
  action: '',
  sql: null,
};

export const queryReducer = (state = initialStateQuery, action) => {
  switch (action.type) {
    case QUERY.FETCH: {
      return {
        ...state,
        fetchQuery: true,
        send: action.send,
        action: action.type,
        err: null,
      };
    }
    case QUERY.SUCCESS: {
      return {
        ...state,
        fetchQuery: false,
        res: action.res,
        action: action.type,
        err: null,
      };
    }
    case QUERY.FAILED: {
      return {
        ...state,
        fetchQuery: false,
        action: action.type,
        err: action.err,
      };
    }
    default: {
      return state;
    }
  }
};