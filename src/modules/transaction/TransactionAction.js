import {TRANSACTION} from './TransactionConfig'

export const setHistoryCartList = value => ({type: TRANSACTION.HISTORY_CARTLIST, res: value})
export const setHistoryCartListHeader = value => ({type: TRANSACTION.HISTORY_CARTLIST_HEADER, res: value})