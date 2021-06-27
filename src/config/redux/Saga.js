import { all } from 'redux-saga/effects';
import { watcherDatabase } from '../../modules/database/DBSaga';

const watcherList =  [
  ...watcherDatabase
]

export default function* allSaga(){
  yield all(watcherList)
}