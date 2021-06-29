import { combineReducers } from 'redux';
import {databaseReducer, queryReducer} from '../../modules/database/DBReducer';
import { transactionReducer } from '../../modules/transaction/TransactionReducer';
import { userReducer} from '../../modules/other/OtherReducer'

export default combineReducers({
  database: databaseReducer,
  query: queryReducer,
  transaction: transactionReducer,
  user: userReducer
})