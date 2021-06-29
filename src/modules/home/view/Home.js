import React, { useEffect } from 'react'
import _style from '../../../styles'
import Container from '../../../components/Container'
import Button from '../../../components/Button'
import {
  RefreshControl,
  FlatList,
  View,
  Text,
  TouchableOpacity,
} from 'react-native'

import { useDispatch, useSelector } from 'react-redux'
import {dbClose, dbFetch, queryFetch} from '../../database/DBAction'
import {QUERY_CATEGORY, QUERY_ITEM} from '../../../config/StaticQuery'

function Home(){

  const dispatch = useDispatch();
  const db = useSelector(state => state.database);
  const query = useSelector(state => state.query);

  function openDb(){
    dispatch(dbFetch())
  }  

  function closeDb(){
    dispatch(dbClose())
  }

  function createCategory(){
    dispatch(queryFetch({
      sql: QUERY_CATEGORY.CREATE_TABLE
    }))
  }

  function readCategory(){
    dispatch(queryFetch({
      sql: QUERY_CATEGORY.SELECT
    }))
  }
  
  function insertCategory(){
    dispatch(queryFetch({
      sql: QUERY_CATEGORY.INSERT,
      param: ["Teh_cat2", "Teh Kategori", "2021-06-22 12:00:00"]
    }))    

    dispatch(queryFetch({
      sql: QUERY_CATEGORY.INSERT,
      param: ["Sirup_cat2", "Sirup Kategori", "2021-06-22 12:00:00"]
    }))    

    dispatch(queryFetch({
      sql: QUERY_CATEGORY.INSERT,
      param: ["Teh_cat3", "Teh Kategori", "2021-06-22 12:00:00"]
    }))    

    dispatch(queryFetch({
      sql: QUERY_CATEGORY.INSERT,
      param: ["Sirup_cat3", "Sirup Kategori", "2021-06-22 12:00:00"]
    }))    
  }

  function insertItem(){
    dispatch(queryFetch({
      sql: QUERY_ITEM.INSERT,
      param: ["Kopi_1", "Teh_cat2", "Kopi Tubruk0", "10000", "3000", "2021-06-22 12:00:00"]    
    })) 
    dispatch(queryFetch({
      sql: QUERY_ITEM.INSERT,
      param: ["Kopi_2", "Teh_cat2", "Kopi Tubruk1", "10000", "3000", "2021-06-22 12:00:00"]    
    })) 
    dispatch(queryFetch({
      sql: QUERY_ITEM.INSERT,
      param: ["Kopi_3", "Teh_cat2", "Kopi Tubruk2", "10000", "3000", "2021-06-22 12:00:00"]    
    })) 
    dispatch(queryFetch({
      sql: QUERY_ITEM.INSERT,
      param: ["Kopi_4", "Teh_cat2", "Kopi Tubruk3", "10000", "3000", "2021-06-22 12:00:00"]    
    }))    
  }

  function readItemByCode(){
    dispatch(queryFetch({
      sql: QUERY_ITEM.SELECT,
      // param: ["Kopi_1"]
    }))
  }

  function deleteCategory(){
    dispatch(queryFetch({
      sql: QUERY_CATEGORY.DELETE
    }))
  }

  function deleteItems(){
    dispatch(queryFetch({
      sql: QUERY_ITEM.DELETE
    }))
  }

  return (
    <Container>      
      <View style={_style.mt10}>
        {/* <Text>Category</Text> */}
        <TouchableOpacity onPress={openDb}>
          <Text>New DB</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={closeDb}>
          <Text>Close DB</Text>
        </TouchableOpacity>        
        <TouchableOpacity onPress={readCategory}>
          <Text>Read Category</Text>
        </TouchableOpacity>     
        <TouchableOpacity onPress={insertCategory}>
          <Text>Insert Category</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={insertItem}>
          <Text>Insert Item</Text>
        </TouchableOpacity>     
        <TouchableOpacity onPress={readItemByCode}>
          <Text>Read item by code</Text>
        </TouchableOpacity>  
        <TouchableOpacity onPress={deleteCategory}>
          <Text>Delete Category</Text>
        </TouchableOpacity>     
        <TouchableOpacity onPress={deleteItems}>
          <Text>Delete Items</Text>
        </TouchableOpacity>     
        {/* <Button onPress={deleteCategory} btnText="Delete" />         */}
      </View>
    </Container>
  );
}

export default Home;