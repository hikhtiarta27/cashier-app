import SQLite from 'react-native-sqlite-storage';
import {
  call,
  put,
  takeLatest,
  putResolve,
  takeEvery,
  take,
  select,
} from 'redux-saga/effects';

import {DB, QUERY} from './DBConfig';
import {dbFetch, dbSuccess, dbFailed, dbClose, queryFailed, querySuccess} from './DBAction';

function* workerDatabaseOpen() {
  try {
    const {database} = yield select(state => state.database);
    if (!database) {
      const db = yield call(SQLite.openDatabase, {
        name: 'db-cashier.db',        
      });      
      yield putResolve(dbSuccess(db));      
    }        
  } catch (error) {
    yield putResolve(dbFailed(error));
  }
}

function* workerDatabaseClose() {
  try {
    const {database} = yield select(state => state.database);
    if (database) {
      yield call(database.close);
      yield putResolve(dbClose());      
    }
  } catch (error) {
    yield putResolve(dbFailed(error));
  }
}

export function runSqlQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {          
      tx.executeSql(
        query,
        params,
        (tx, results) => {                  
          resolve(results)            
        },
        (tx, err) => console.log("error on : ", tx)
      );
    });
  })  
}

function* workerExecuteQuery(data) {
  try {    
    const {database} = yield select(state => state.database);    
    const {param, sql} = data.send
    const result = yield call(runSqlQuery, database, sql, param)                      
    yield put(querySuccess(result));
  } catch (error) {
    yield put(queryFailed(error));
  }
}

export const watcherDatabase = [
  takeLatest(DB.FETCH, workerDatabaseOpen),
  takeLatest(DB.CLOSE, workerDatabaseClose),
  takeLatest(QUERY.FETCH, workerExecuteQuery),
];
