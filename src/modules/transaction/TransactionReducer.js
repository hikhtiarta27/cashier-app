import {TRANSACTION} from './TransactionConfig'

const initialTransactionState = {
  historyCartList: null,
  historyCartListHeader: null,
}

export const transactionReducer = (state = initialTransactionState, action) => {
  switch(action.type){
    case TRANSACTION.HISTORY_CARTLIST : {
      return {
        ...state,
        historyCartList: action.res
      }
    }
    case TRANSACTION.HISTORY_CARTLIST_HEADER : {
      return {
        ...state,
        historyCartListHeader: action.res
      }
    }
    default: {
      return state
    }
  }
}