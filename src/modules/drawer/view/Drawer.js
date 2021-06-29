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
import { useDispatch } from 'react-redux'
import {dbClose, dbFetch, queryFetch} from '../../database/DBAction'
import {QUERY_CATEGORY, QUERY_ITEM, QUERY_TRX_HEADER, QUERY_TRX_DETAIL} from '../../../config/StaticQuery'
import {
  Animated
} from 'react-native'

import Other from '../../other/view/Other';
import OtherHistory from '../../other/view/OtherHistory';
import ChangePassword from '../../other/view/ChangePassword';



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
      <Stack.Screen component={ChangePassword} name="ChangePassword" />
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
      <Drawer.Screen component={Setting} name="Setting" options={{
        headerShown: false,
        drawerLabel: "Setting"
      }}/>
      <Drawer.Screen component={OtherStack} name="Other" options={{
        headerShown: false,
        drawerLabel: "Other"
      }}/>
    </Drawer.Navigator>
  );
}

function SwithRouter() {
  
  const [fade, setFade] = useState(new Animated.Value(0))
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)

  useEffect(()=>{    
    dispatch(dbFetch())
    dispatch(queryFetch({
      sql: QUERY_CATEGORY.CREATE_TABLE
    }))
    dispatch(queryFetch({
      sql: QUERY_ITEM.CREATE_TABLE
    }))
    dispatch(queryFetch({
      sql: QUERY_TRX_HEADER.CREATE_TABLE
    }))
    dispatch(queryFetch({
      sql: QUERY_TRX_DETAIL.CREATE_TABLE
    }))

    Animated.timing(fade, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: true
    }).start(()=>{      
        setLoading(!loading)
    });     
  }, [])  

  return (
    <Stack.Navigator headerMode={false} initialRouteName="App">      
      {!loading ? <Stack.Screen component={DrawerTab} name="App" /> : <Stack.Screen component={Splash} name="Loading" /> }
    </Stack.Navigator>
  );
}

export default SwithRouter;
