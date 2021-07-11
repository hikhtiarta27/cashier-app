import {APP, MASTER, STORE} from './MasterConfig'

export const setStore = value => ({type: STORE.SET_STORE, res: value})
export const setLoading = value => ({type: APP.SET_LOADING, res: value})
export const setCategoryItemFetch = () => ({type: MASTER.SET_CATEGORY_ITEM_FETCH})
export const setCategoryItemSuccess = value => ({type: MASTER.SET_CATEGORY_ITEM_SUCCESS, res: value})
export const setCategoryItemFailed = value => ({type: MASTER.SET_CATEGORY_ITEM_FAILED, err: value})