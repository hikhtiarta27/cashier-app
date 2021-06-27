import { combineReducers } from 'redux';
import {databaseReducer, queryReducer} from '../../modules/database/DBReducer';
import { transactionReducer } from '../../modules/transaction/TransactionReducer';

export default combineReducers({
  database: databaseReducer,
  query: queryReducer,
  transaction: transactionReducer
})