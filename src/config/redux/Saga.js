import { all } from 'redux-saga/effects';
import { watcherDatabase } from '../../modules/database/DBSaga';
import { watcherMaster } from '../../modules/master/MasterSaga';


const watcherList =  [
  ...watcherDatabase,
  ...watcherMaster
]

export default function* allSaga(){
  yield all(watcherList)
}