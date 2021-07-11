import { combineReducers } from 'redux';
import {databaseReducer, queryReducer} from '../../modules/database/DBReducer';
import { transactionReducer } from '../../modules/transaction/TransactionReducer';
import { masterReducer, userReducer} from '../../modules/master/MasterReducer'

export default combineReducers({
  database: databaseReducer,
  query: queryReducer,
  transaction: transactionReducer,
  user: userReducer,
  master: masterReducer
})