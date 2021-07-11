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
          // if(results.rows.length > 0){
          //   let newArray = []
          //   for (let i = 0; i < results.rows.length; i++) {
          //     newArray.push(results.rows.item(i))           
          //   }
          //   resolve(newArray)
          // }                  
          resolve(results)          
        },
        (tx, err) => console.log("error on : ", tx)
      );           
    });
  })  
}

function runSqlQueryBatch(db, sql) {
  return new Promise((resolve, reject) => {
    db.sqlBatch(
      sql,        
      (results) => {               
        console.log(results)   
        // resolve(results)            
      },
      (err) => console.log("error on : ", err)
    );
  })  
}

function* workerExecuteQuery(data) {
  try {    
    const {database} = yield select(state => state.database);    
    const {param, sql} = data.send
    let result = null
    if(sql == 'INSERT_BATCH'){
      result = yield call(runSqlQueryBatch, database, param)
    }else{
      result = yield call(runSqlQuery, database, sql, param)                      
    }
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
