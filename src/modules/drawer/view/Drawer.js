import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import {createStackNavigator} from '@react-navigation/stack';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import Transaction from '../../transaction/view/Transaction';
import Splash from '../../splash/view/Splash';
import Setting from '../../setting/view/Setting';
import MasterCategory from '../../master/view/MasterCategory'
import MasterCategoryEdit from '../../master/view/MasterCategoryEdit'
import MasterItem from '../../master/view/MasterItem'
import Home from '../../home/view/Home';
import {createDrawerNavigator} from '@react-navigation/drawer';
import TransactionHistory from '../../transaction/view/TransactionHistory';
import MasterItemEdit from '../../master/view/MasterItemEdit';
import InvoiceEdit from '../../transaction/view/InvoiceEdit';
import { useDispatch, useSelector } from 'react-redux'
import {dbClose, dbFetch, queryFetch} from '../../database/DBAction'
import {QUERY_CATEGORY, QUERY_STORE, QUERY_ITEM, QUERY_TRX_HEADER, QUERY_TRX_DETAIL} from '../../../config/StaticQuery'
import {
  Animated
} from 'react-native'

import Other from '../../other/view/Other';
import OtherHistory from '../../other/view/OtherHistory';
import OtherDatabaseReport from '../../other/view/OtherDatabaseReport';

import MasterStore from '../../master/view/MasterStore';
import { runSqlQuery } from '../../database/DBSaga';
import MasterStoreEdit from '../../master/view/MasterStoreEdit';
import { setStore } from '../../master/MasterAction';



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MasterCategoryStack(){
  return(
    <Stack.Navigator headerMode={false} initialRouteName="MasterCategory">
      <Stack.Screen component={MasterCategory} name="MasterCategory" />
      <Stack.Screen component={MasterCategoryEdit} name="MasterCategoryEdit" />
    </Stack.Navigator>
  );
}

function MasterItemStack(){
  return(
    <Stack.Navigator headerMode={false} initialRouteName="MasterItem">
      <Stack.Screen component={MasterItem} name="MasterItem" />
      <Stack.Screen component={MasterItemEdit} name="MasterItemEdit" />
    </Stack.Navigator>
  );
}

function MasterStoreStack(){
  return(
    <Stack.Navigator headerMode={false} initialRouteName="MasterStore">
      <Stack.Screen component={MasterStore} name="MasterStore" />
      <Stack.Screen component={MasterStoreEdit} name="MasterStoreEdit" />
    </Stack.Navigator>
  );
}

function TransactionStack(){
  return(
    <Stack.Navigator headerMode={false} initialRouteName="Transaction">
      <Stack.Screen component={Transaction} name="Transaction" />      
      <Stack.Screen component={InvoiceEdit} name="InvoiceEdit" />
    </Stack.Navigator>
  );
}

function OtherStack(){
  return(
    <Stack.Navigator headerMode={false} initialRouteName="Other">
      <Stack.Screen component={Other} name="Other" />
      <Stack.Screen component={OtherHistory} name="OtherHistory" />      
      <Stack.Screen component={OtherDatabaseReport} name="OtherDatabaseReport" />      

    </Stack.Navigator>
  );
}

function DrawerTab() {
  return (
    <Drawer.Navigator initialRouteName="Transaction" >
      <Drawer.Screen component={TransactionStack} name="Transaction" options={{
        headerShown: false,
        drawerLabel: "Transaction",
        
      }}/>
      <Drawer.Screen component={TransactionHistory} name="TransactionHistory" options={{
        headerShown: false,
        drawerLabel: "History"
      }}/>
      <Drawer.Screen component={MasterCategoryStack} name="MasterCategory" options={{
        headerShown: false,
        drawerLabel: "Master Category"
      }}/>
      <Drawer.Screen component={MasterItemStack} name="MasterItem" options={{
        headerShown: false,
        drawerLabel: "Master Item"
      }}/>
      <Drawer.Screen component={MasterStoreStack} name="MasterStore" options={{
        headerShown: false,
        drawerLabel: "Master Store"
      }}/>      
      <Drawer.Screen component={Setting} name="Setting" options={{
        headerShown: false,
        drawerLabel: "Printer Settings"
      }}/>      
      <Drawer.Screen component={OtherStack} name="Other" options={{
        headerShown: false,
        drawerLabel: "Other"
      }}/>
    </Drawer.Navigator>
  );
}

function SwithRouter() {
  
  const db = useSelector(state => state.database)
  const query = useSelector(state => state.query)
  const [fade, setFade] = useState(new Animated.Value(0))
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)

  useEffect(async()=>{    
    await dispatch(dbFetch())    
    await dispatch(queryFetch({
      sql: QUERY_CATEGORY.CREATE_TABLE
    }))
    await dispatch(queryFetch({
      sql: QUERY_ITEM.CREATE_TABLE
    }))    
    await dispatch(queryFetch({
      sql: QUERY_TRX_HEADER.CREATE_TABLE
    }))
    await dispatch(queryFetch({
      sql: QUERY_TRX_DETAIL.CREATE_TABLE
    }))
    await dispatch(queryFetch({
      sql: QUERY_STORE.CREATE_TABLE
    }))
    
    Animated.timing(fade, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: true
    }).start(()=>{      
        setLoading(!loading)
    });     
  }, [])  

  useEffect(async()=>{
    if(!query.fetchQuery && !db.fetchDb){            
      if(query.send != null && query.send.sql == QUERY_STORE.CREATE_TABLE){                        
        let data = await checkIfAlreadyOneRowInStore()        
        if(data.rows.length == 0){          
          dispatch(queryFetch({
            sql: QUERY_STORE.INSERT,
            param: ["DEFAULT_ID", "DEFAULT_NAME", "ADMIN", "https://posapp30.herokuapp.com/api"]
          }))                    
          dispatch(setStore({"id": "DEFAULT_ID", "name": "DEFAULT_NAME", "password": "ADMIN", "api_url": "https://posapp30.herokuapp.com/api"}))
        }else{
          dispatch(setStore(data.rows.item(0)))
        }
      }                           
    }
  }, [query, db.fetchDb])

  function checkIfAlreadyOneRowInStore(){    
    return runSqlQuery(db.database, QUERY_STORE.SELECT)
  }

  return (
    <Stack.Navigator headerMode={false} initialRouteName="App">      
      {!loading ? <Stack.Screen component={DrawerTab} name="App" /> : <Stack.Screen component={Splash} name="Loading" /> }
    </Stack.Navigator>
  );
}

export default SwithRouter;
