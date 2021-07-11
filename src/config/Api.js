import {queryFetch} from '../modules/database/DBAction';
import {
  QUERY_CATEGORY,
  QUERY_ITEM,
  QUERY_STORE,
  QUERY_TRX_DETAIL,
  QUERY_TRX_HEADER,
} from './StaticQuery';

//SQLITE
export const apiGetCategoryList = dispatch => {
  dispatch(
    queryFetch({
      sql: QUERY_CATEGORY.SELECT,
    }),
  );
};

export const getItemList = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_ITEM.SELECT_BY_CATEGORY_CODE,
      param,
    }),
  );
};

export const updateTrxDetail = (dispatch, param) => {
  dispatch(
    queryFetch({
      sql: QUERY_TRX_DETAIL.UPDATE,
      param,
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
}

export const apiUpdateTrxHeaderStatus = (dispatch, param) =>{
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.UPDATE_STATUS,
      param,
    }),
  );
}

export const apiInsertTrxHeader = (dispatch, param) =>{
  dispatch(
    queryFetch({
      sql: QUERY_TRX_HEADER.INSERT,
      param,
    }),
  );
}

export const apiDeleteTrxDetailByTrxHeaderId = (dispatch, param) =>{
  dispatch(
    queryFetch({
      sql: QUERY_TRX_DETAIL.DELETE_BY_TRX_HEADER_ID,
      param,
    }),
  );
}
//Public API
