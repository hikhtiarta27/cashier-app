import {APP, STORE} from './MasterConfig'

export const setStore = value => ({type: STORE.SET_STORE, res: value})
export const setLoading = value => ({type: APP.SET_LOADING, res: value})