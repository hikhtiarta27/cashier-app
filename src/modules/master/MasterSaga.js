import {
  call,
  put,
  takeLatest,
  putResolve,
  takeEvery,
  take,
  select,
} from 'redux-saga/effects';

import {MASTER} from './MasterConfig';
import {setCategoryItemFailed, setCategoryItemSuccess} from './MasterAction';
import {runSqlQuery} from '../database/DBSaga';
import {QUERY_CATEGORY, QUERY_ITEM} from '../../config/StaticQuery';

function getCategoryItem(database){    
  return new Promise(async(resolve, reject) => {
    const resultCategory = await runSqlQuery(database, QUERY_CATEGORY.SELECT)
      let newArray = [];      
      for (let i = 0; i < resultCategory.rows.length; i++) {
        let x = resultCategory.rows.item(i);
        const resultItem = await runSqlQuery(database, QUERY_ITEM.SELECT_BY_CATEGORY_CODE, [x.code])
        let newArrayItems = [];
        for (let j = 0; j < resultItem.rows.length; j++) {
          newArrayItems.push(resultItem.rows.item(j));
        }
        x['items'] = newArrayItems;
        newArray.push(x);
      }      
      resolve(newArray)
  })    
}

function* workerGetCategoryItem() {
  try {
    const {database} = yield select(state => state.database);    
    const result = yield call(getCategoryItem, database)     
    yield put(setCategoryItemSuccess(result));
  } catch (error) {
    console.log(error);
    yield put(setCategoryItemFailed(error));
  }
}

export const watcherMaster = [
  takeLatest(MASTER.SET_CATEGORY_ITEM_FETCH, workerGetCategoryItem),
];
