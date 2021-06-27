import {CATEGORY, DB, QUERY} from './DBConfig'

export const dbFetch = value => ({type: DB.FETCH, send: value})
export const dbSuccess = value => ({type: DB.SUCCESS, database: value})
export const dbFailed = value => ({type: DB.FAILED, err: value})
export const dbClose = () => ({type: DB.CLOSE})

export const queryFetch = value => ({type: QUERY.FETCH, send: value})
export const querySuccess = value => ({type: QUERY.SUCCESS, res: value})
export const queryFailed = value => ({type: QUERY.FAILED, err: value})

export const categoryFetch = value => ({type: CATEGORY.SUCCESS, list: value})