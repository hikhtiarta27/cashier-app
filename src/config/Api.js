import {dbFetch, queryFetch} from '../modules/database/DBAction';
import {
  QUERY_CATEGORY,
  QUERY_ITEM,
  QUERY_STORE,
  QUERY_TRX_DETAIL,
  QUERY_TRX_HEADER,
} from './StaticQuery';

//SQLITE

//DB INIT
/**
 * Initialize SQLITE Database
 * @param {function} dispatch 
 */
export const apiDatabaseInit = dispatch => {
  dispatch(dbFetch());
};

//CATEGORY
/**
 * API for create category table
 * @function
 * @param {function} dispatch 
 */
export const apiCreateCategory = dispatch => {
  dispatch(
    queryFetch({
      sql: QUERY_CATEGORY.CREATE_TABLE,
    }),
  );
};

/**
 * API for get all category records
 * @function
 * @param {function} dispatch 
 */
export const apiGetCategoryList = dispatch => {
  dispatch(
    queryFetch({
      sql: QUERY_CATEGORY.SELECT,
    }),
  );
};

/**
 * API for delete all category records
 * @function
 * @param {function} dispatch 
 */
export const apiDeleteCategory = dispatch =>{
  dispatch(queryFetch({
    sql: QUERY_CATEGORY.DELETE
  }))
}

/**
 * API for update category record based on category ID
 * @function
 * @param {function} dispatch
 * @param {object} param 
 */
export const apiUpdateCategoryById = (dispatch, param) =>{
  dispatch(queryFetch({
    sql: QUERY_CATEGORY.UPDATE,
    param
  }))
}

//ITEM
/**
 * API for get all item records
 * @function
 * @param {function} dispatch 
 */
export const apiGetItemList = (dispatch) => {
  dispatch(
    queryFetch({
      sql: QUERY_ITEM.SELECT     
    }),
  );
};

/**
 * API for get all item records based on Category Record
 * @function
 * @param {function} dispatch
 * @param {object} param 
 */
export const apiGetItemListByCategoryCode = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_ITEM.SELECT_BY_CATEGORY_CODE,
      param,
    }),
  );
};

/**
 * API for create item table
 * @function
 * @param {function} dispatch
 */
export const apiCreateItem = dispatch => {
  dispatch(
    queryFetch({
      sql: QUERY_ITEM.CREATE_TABLE,
    }),
  );
};

/**
 * API for delete all item records
 * @function
 * @param {function} dispatch
 */
export const apiDeleteItem = dispatch =>{
  dispatch(queryFetch({
    sql: QUERY_ITEM.DELETE
  }))
}

/**
 * API for update item based on item ID
 * @function
 * @param {function} dispatch 
 * @param {object} param
 */
export const apiUpdateItem = (dispatch, param) =>{
  dispatch(
    queryFetch({
      sql: QUERY_ITEM.UPDATE,
      param,
    }),
  );
}

//TRX DETAIL
export const apiCreateTrxDetail = dispatch => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_DETAIL.CREATE_TABLE,
    }),
  );
};

export const apiGetTrxDetailByTrxHeaderId = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_DETAIL.SELECT_BY_TRX_HEADER_ID,
      param,
    }),
  );
};

export const apiUpdateTrxDetail = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_DETAIL.UPDATE,
      param,
    }),
  );
};

export const apiDeleteTrxDetailByTrxHeaderId = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_DETAIL.DELETE_BY_TRX_HEADER_ID,
      param,
    }),
  );
};

export const apiUpdateTrxDetailFlagToY = dispatch => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_DETAIL.UPDATE_FLAG_Y_ALL,
    }),
  );
};

//TRX HEADER
export const apiCreateTrxHeader = dispatch => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.CREATE_TABLE,
    }),
  );
};

export const apiUpdateTrxHeader = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.UPDATE,
      param,
    }),
  );
};

export const apiUpdateTrxHeaderStatus = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.UPDATE_STATUS,
      param,
    }),
  );
};

export const apiInsertTrxHeader = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.INSERT,
      param,
    }),
  );
};

export const apiInsertTrxHeaderVoid = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.INSERT_VOID,
      param,
    }),
  );
};

export const apiGetTrxHeaderByDate = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.SELECT_BY_DATE,
      param,
    }),
  );
};

export const apiGetTrxHeaderByDateBetween = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.SELECT_BY_DATE_BETWEEN,
      param,
    }),
  );
};

export const apiUpdateTrxHeaderFlagToY = dispatch => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.UPDATE_FLAG_Y_ALL,
    }),
  );
};

export const apiBatchSql = (dispatch, sql) => {
  dispatch(
    queryFetch({
      sql: 'INSERT_BATCH',
      param: sql,
    }),
  );
};

//STORE
export const apiCreateStore = dispatch => {
  dispatch(
    queryFetch({
      sql: QUERY_STORE.CREATE_TABLE,
    }),
  );
};

export const apiGetStore = dispatch =>{
  dispatch(queryFetch({
    sql: QUERY_STORE.SELECT
  }))
}

export const apiInsertStore = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_STORE.INSERT,
      param,
    }),
  );
};

export const apiDeleteStore = dispatch =>{
  dispatch(
    queryFetch({
      sql: QUERY_STORE.DELETE,
    }),
  );
}

//Public API
