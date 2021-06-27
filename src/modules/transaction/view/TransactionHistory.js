import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {queryFetch} from '../../database/DBAction';
import {QUERY_TRX_DETAIL, QUERY_TRX_HEADER} from '../../../config/StaticQuery';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import _style from '../../../styles/Typrograhpy';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  setHistoryCartList,
  setHistoryCartListHeader,
} from '../TransactionAction';
import {dateToFormat, stringToCurrency} from '../../../util';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {runSqlQuery} from '../../database/DBSaga';
import Modal from 'react-native-modal'
import DateTimePicker from '@react-native-community/datetimepicker';
import {dateTimeToFormat} from '../../../util'


function TransactionHistory() {
  const db = useSelector(state => state.database);
  const query = useSelector(state => state.query);
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [historyList, setHistoryList] = useState([]);
  const [history, setHistory] = useState({});
  const [cartList, setCartList] = useState([]);
  const [dataTableFocus, setDataTableFocus] = useState(0);
  const [filterItemFocus, setFilterItemFocus] = useState(1);
  const [filterItemModalFocus, setFilterItemModalFocus] = useState(filterItemFocus);
  const [filterStatusFocus, setFilterStatusFocus] = useState(0);
  const [filterStatusFocusPrev, setFilterStatusFocusPrev] = useState(filterStatusFocus);
  const [filterVisible, setFilterVisible] = useState(false)

  const [dateFilter, setDateFilter] = useState(new Date()); 
  const [dateFilterPrev, setDateFilterPrev] = useState(dateFilter);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilter, setIsDateFilter] = useState(false)
  const [counterFilter,setCounterFilter] = useState(0)
  const [refreshCartList, setRefreshCartList] = useState(false)

  const filterItem = ['Semua', 'Hari ini', 'Kemarin', '1 Minggu Terakhir'];
  const filterStatus = ['Semua', 'Simpan', 'Hapus', "Void"];

  const headerTable = [
    {
      key: 'id',
      value: 'Trx No',
    },
    {
      key: 'date',
      value: 'Trx Date',
    },
    {
      key: 'grand_total',
      value: 'Grand Total',
    },
    {
      key: 'discount',
      value: 'Discount',
    },
    {
      key: 'total_item',
      value: 'Items',
    },
    {
      key: 'status',
      value: 'Status',
    },
    {
      key: 'ref_void_id',
      value: 'Ref',
    },
  ];

  const headerTableCartList = [
    {
      key: 'name',
      value: 'Name',
    },
    {
      key: 'price',
      value: 'Price/Qty',
    },
    {
      key: 'total',
      value: 'Disc/Total',
    },
  ];

  function apiGetHistoryList(param) {
    dispatch(
      queryFetch({
        sql: QUERY_TRX_HEADER.SELECT,
        param,
      }),
    );
  }

  //api call only run once
  useEffect(async () => {
    // await apiGetHistoryList();
    await runApiGetByDate();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // const unsubscribe = apiGetHistoryList();
      const unsubscribe = runApiGetByDate();      
      setFilterItemFocus(1)
      setFilterStatusFocus(0)
      setFilterStatusFocusPrev(0)
      return () => unsubscribe;
    }, []),
  );

  useEffect(async () => {    
    if (history.id != undefined) {
      let param = [];
      param.push(history.ref_void_id != null ? history.ref_void_id : history.id);    
      await apiGetTrxDetail(param);
    }
  }, [history.id, refreshCartList]);

  useEffect(async () => {    
    await runApiGetByDate();
    setFilterItemModalFocus(filterItemFocus)
  }, [filterItemFocus, filterStatusFocusPrev, dateFilterPrev]);

  function runApiGetByDate() {
    let today = new Date();

    if (filterItem[filterItemFocus] == 'Kemarin') {
      today.setDate(today.getDate() - 1);      
    }

    if (filterItem[filterItemFocus] == '1 Minggu Terakhir') {
      today.setDate(today.getDate() - 7);      
    }

    let currentDateTimeFormatted = dateToFormat(isDateFilter ? dateFilterPrev : today)

    let param = [];
    param.push(currentDateTimeFormatted); 
    param.push(filterStatusFocus != 0 ? `%${filterStatus[filterStatusFocus].toUpperCase()}%` : '%%')
    if (filterItem[filterItemFocus] != 'Semua') {
      if (filterItem[filterItemFocus] == '1 Minggu Terakhir') {
        let param = []
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        param.push(currentDateTimeFormatted); 
        param.push(dateToFormat(tomorrow))
        param.push(filterStatusFocus != 0 ? `%${filterStatus[filterStatusFocus].toUpperCase()}%` : '%%')        
        apiGetByDateBetween(param);
      }else{
        apiGetByDate(param);
      }      
      setCounterFilter(1) 
      if(filterStatusFocus == 0) setCounterFilter(1)
      else setCounterFilter(2)
    }else {
      let param = []
      param.push(filterStatusFocus != 0 ? `%${filterStatus[filterStatusFocus].toUpperCase()}%` : '%%')      
      apiGetHistoryList(param);         
      if(filterStatusFocus == 0) setCounterFilter(counterFilter - 1)
      else setCounterFilter(1)
    }    
  }

  function apiGetTotalItemByRefVoidId(param) {
    return runSqlQuery(db.database, QUERY_TRX_DETAIL.SELECT_TOTAL_ITEMS_BY_TRX_HEADER_ID, param);
  }

  //get updated data
  useEffect(async() => {
    if(!query.fetchQuery){
      if (query.send.sql == QUERY_TRX_HEADER.SELECT) {
      let rows = query.res.rows;
      if (rows.length > 0) {
        let resultList = [];
        for (let i = 0; i < rows.length; i++) {
          if(rows.item(i).ref_void_id != null){
            let param = []
            param.push(rows.item(i).ref_void_id)
            let totalItem = await apiGetTotalItemByRefVoidId(param)
            rows.item(i).total_item = totalItem.rows.item(0).total_item;
          }
          resultList.push(rows.item(i));
        }
        setHistory(resultList[0]);
        setHistoryList(resultList);
        setDataTableFocus(0);
      } else {
        setCartList([]);
        setHistory({});
        setHistoryList([]);
      }
    }

    if (query.send.sql == QUERY_TRX_HEADER.SELECT_BY_DATE || query.send.sql == QUERY_TRX_HEADER.SELECT_BY_DATE_BETWEEN) {
      let rows = query.res.rows;
      if (rows.length > 0) {
        let resultList = [];
        for (let i = 0; i < rows.length; i++) {
          if(rows.item(i).ref_void_id != null){
            let param = []
            param.push(rows.item(i).ref_void_id)
            let totalItem = await apiGetTotalItemByRefVoidId(param)
            rows.item(i).total_item = totalItem.rows.item(0).total_item;
          }
          resultList.push(rows.item(i));          
        }        
        setHistory(resultList[0]);
        setRefreshCartList(!refreshCartList)
        setHistoryList(resultList);
        setDataTableFocus(0);        
      } else {
        setCartList([]);
        setHistory({});
        setHistoryList([]);
      }
    }

    if (query.send.sql == QUERY_TRX_DETAIL.SELECT_BY_TRX_HEADER_ID) {
      let rows = query.res.rows;
      if (rows.length > 0) {
        let resultList = [];
        for (let i = 0; i < rows.length; i++) {
          resultList.push(rows.item(i));
        }
        setCartList(resultList);
      } else {
        setCartList([]);
      }
    }
    }
  }, [query.fetchQuery]);

  function apiGetTrxDetail(param) {
    dispatch(
      queryFetch({
        sql: QUERY_TRX_DETAIL.SELECT_BY_TRX_HEADER_ID,
        param,
      }),
    );
  }

  function hapusInvoice() {
    Alert.alert(
      'Confirmation',
      'Are you sure to delete this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            let param = [];
            param.push('HAPUS');
            param.push(history.id);
            await apiUpdateStatus(param);
            await runApiGetByDate();
            Alert.alert('Information', 'Transaction successfully deleted!', [
              {
                text: 'Ok',
                style: 'default',
              },
            ]);
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
      },
    );
  }

  function apiUpdateStatus(param) {
    dispatch(
      queryFetch({
        sql: QUERY_TRX_HEADER.UPDATE_STATUS,
        param,
      }),
    );
  }

  function apiInsertToTrxHeaderVoid(param) {
    dispatch(
      queryFetch({
        sql: QUERY_TRX_HEADER.INSERT_VOID,
        param,
      }),
    );
  }

  function voidInvoice() {
    Alert.alert(
      'Confirmation',
      'Are you sure to void this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            let param = [];
            param.push('VOID');
            param.push(history.id);
            await apiUpdateStatus(param);

            let today = new Date();            
            let currentDateTimeFormatted = dateTimeToFormat(today)

            let discount =
              parseInt(history.discount) - parseInt(history.discount) * 2;
            let grandTotal =
              parseInt(history.grand_total) - parseInt(history.grand_total) * 2;

            let paramHeader = [];
            paramHeader.push(currentDateTimeFormatted);
            paramHeader.push(discount);
            paramHeader.push(grandTotal);
            paramHeader.push('VOID');
            paramHeader.push(history.id);
            paramHeader.push(currentDateTimeFormatted);
            await apiInsertToTrxHeaderVoid(paramHeader);
            await runApiGetByDate()
            Alert.alert('Information', 'Transaction successfully voided!', [
              {
                text: 'Ok',
                style: 'default',
              },
            ]);
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
      },
    );
  }

  function apiGetByDate(param) {
    dispatch(
      queryFetch({
        sql: QUERY_TRX_HEADER.SELECT_BY_DATE,
        param,
      }),
    );
  }

  function apiGetByDateBetween(param) {
    dispatch(
      queryFetch({
        sql: QUERY_TRX_HEADER.SELECT_BY_DATE_BETWEEN,
        param,
      }),
    );
  }

  function dataRender({item, index}) {
    return (
      <TouchableHighlight
        key={index}
        style={[
          _s.listContainer,
          dataTableFocus == index ? {backgroundColor: '#eee'} : null,
        ]}
        onPress={() => {
          setHistory(item);
          setDataTableFocus(index);
        }}
        underlayColor="#eee">
        <>
          {headerTable.map((v, i) => (            
            <View key={i} style={{flex: 1}}>                            
              <Text style={_s.listText}>
                {v.key == 'discount' ||
                v.key == 'grand_total' ||
                v.key == 'total_item'
                  ? stringToCurrency(item[v.key])
                  : item[v.key]}
              </Text>
            </View>
          ))}
        </>
      </TouchableHighlight>
    );
  }

  function historyHeaderRender() {
    return (
      <View style={_s.headerContainer}>
        {headerTable.map((item, index) => (
          <View key={index} style={{flex: 1}}>
            <Text style={_s.headerText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  function dataRenderCartList({item, index}) {
    return (
      <View key={index} style={[_s.listContainer]}>
        <>
          {headerTableCartList.map((v, i) => (
            <View
              key={i}
              style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
              {v.key == 'name' ? (
                <View style={{flex: 1}}>
                  <Text style={_s.listText}>{item.item_name}</Text>
                </View>
              ) : null}
              {v.key == 'price' ? (
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                  <Text style={_s.listText}>
                    {item.priceNew != undefined
                      ? stringToCurrency(item.priceNew)
                      : stringToCurrency(item.price)}
                  </Text>
                  <Text style={_s.listText}>
                    {stringToCurrency(item.quantity)}
                  </Text>
                </View>
              ) : null}
              {v.key == 'total' ? (
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                  <Text style={_s.listText}>
                    {item.discountNew != undefined
                      ? stringToCurrency(item.discountNew)
                      : history.ref_void_id != null
                      ? `-${stringToCurrency(item.discount)}`
                      : stringToCurrency(item.discount)}
                  </Text>
                  <Text style={_s.listText}>
                    {history.ref_void_id != null
                      ? `-${stringToCurrency(item.total)}`
                      : stringToCurrency(item.total)}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </>
      </View>
    );
  }

  function cartListHeaderRender() {
    return (
      <View style={_s.headerContainer}>
        {headerTableCartList.map((item, index) => (
          <View
            key={index}
            style={[
              {flex: 1},
              item.key != 'name' ? {alignItems: 'flex-end'} : null,
            ]}>
            <Text style={_s.headerText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  function handleDatePicker(event, selectedDate){    
    if(event.type == 'set'){
      setIsDateFilter(true)
      setFilterItemModalFocus(99)
      setDateFilter(event.nativeEvent.timestamp)
    }
    setShowDatePicker(false)     
  }

  async function handleFilter(){
    await setFilterItemFocus(filterItemModalFocus)    
    await setFilterStatusFocusPrev(filterStatusFocus)
    await setFilterVisible(!filterVisible)
    await setDateFilterPrev(dateFilter)

    if(filterItemModalFocus != 0 && filterStatusFocus != 0){
      setCounterFilter(2)
    }else if(filterItemModalFocus == 0 && filterStatusFocus == 0){    
      setCounterFilter(0)
    }else if(filterItemModalFocus != 0 || filterStatusFocus != 0){      
      setCounterFilter(1)
    }
    
  }

  function cancelFilter(){
    setIsDateFilter(false)
    setFilterItemModalFocus(filterItemFocus)
    setFilterStatusFocus(filterStatusFocusPrev)
    setFilterVisible(!filterVisible)
  }

  return (
    <Container>
      <Header drawerBtn={true} name="Transaction History" />
      {showDatePicker && (
        <DateTimePicker                
          value={dateFilter}
          mode={'date'}
          is24Hour={true}
          display="default"
          onChange={handleDatePicker}
        />
      )}
      <Modal isVisible={filterVisible} style={{margin: 1,}}
        onBackdropPress={cancelFilter}
        onBackButtonPress={cancelFilter}
      >
        <View style={{flex:1, backgroundColor: "white"}}>
          <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 15, }}>
            <TouchableOpacity onPress={cancelFilter}>
              <AntDesignIcon
                name="close"
                size={25}
                color="black"
                style={{marginRight: 5}}
              />
            </TouchableOpacity>
            <View style={{flex: 1,}}>
              <Text style={_s.modalHeader}>Filter</Text>
            </View>
            {(isDateFilter || filterStatusFocus || filterItemFocus != 0) && <TouchableOpacity onPress={()=>{
              setIsDateFilter(false)
              setFilterItemModalFocus(0)
              // setFilterStatusFocusPrev(filterStatusFocus)
              setFilterStatusFocus(0)              
            }}>
              <Text style={[_s.modalHeader, {color: "#68BBE3"}]}>Reset</Text>
            </TouchableOpacity> }
          </View>
          <View style={{flex: 1, paddingHorizontal: 15}}>            
            <Text style={_s.filterHeader}>Periode</Text>
            <View style={{flexDirection: 'row', marginTop: 10,}}>
              {filterItem.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    _s.filterBtn,
                    filterItemModalFocus == index
                      ? {borderColor: '#274472', borderWidth: 1,}
                      : null,
                  ]}
                  activeOpacity={1}
                  onPress={() => {
                    setFilterItemModalFocus(index)
                    setIsDateFilter(false)
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={_s.filterText}> {item} </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={()=>setShowDatePicker(true)} style={isDateFilter ? _s.pilihTanggalContainerFocus : _s.pilihTanggalContainer}>
                <Text>{isDateFilter ? dateToFormat(dateFilter) : 'Pilih Tanggal'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={_s.filterHeader}>Status</Text>
            <View style={{flexDirection: 'row', marginTop: 10,}}>
              {filterStatus.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    _s.filterBtn,
                    filterStatusFocus == index
                      ? {borderColor: '#274472', borderWidth: 1,}
                      : null,
                  ]}
                  activeOpacity={1}
                  onPress={() => setFilterStatusFocus(index)}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={_s.filterText}>{item}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>            
          </View>
          <View>
            {(filterItemModalFocus != filterItemFocus || filterStatusFocus != filterStatusFocusPrev || dateFilter != dateFilterPrev) && <Button btnText="Simpan" onPress={()=>handleFilter()} />}
          </View>
        </View>
      </Modal>

      <View style={_s.filterContainer}>
        <TouchableOpacity style={_s.filterBtn} activeOpacity={1} onPress={()=>setFilterVisible(!filterVisible)}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>            
            {counterFilter != 0 ? <View style={_s.counterFilterContainer}>
              <Text>{counterFilter}</Text>
            </View> : <AntDesignIcon
              name="filter"
              size={20}
              color="black"
              style={{marginRight: 5}}
            />}
            <Text style={_s.filterText}>Filter </Text>            
          </View>
        </TouchableOpacity>
        {filterItem.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              _s.filterBtn,
              filterItemFocus == index
                ? {borderColor: '#274472', borderWidth: 1,}
                : null,
            ]}
            activeOpacity={1}
            onPress={() => setFilterItemFocus(index)}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={[
                  _s.filterText,
                  filterItemFocus == index
                    ? {color: 'black'}
                    : {color: 'black'},
                ]}>
                {item}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={_s.flexRow}>
        <View style={{flex: 2, borderRightColor: '#eee', borderRightWidth: 3}}>
          <FlatList
            ListHeaderComponent={historyHeaderRender}
            showsVerticalScrollIndicator={false}
            renderItem={dataRender}
            data={historyList}
            extraData={historyList}
            keyExtractor={(item, index) => index}
            stickyHeaderIndices={[0]}
          />
        </View>
        <View style={{flex: 1}}>
          {history != null ? (
            <>
              <View style={{flex: 1}}>
                <FlatList
                  ListHeaderComponent={cartListHeaderRender}
                  showsVerticalScrollIndicator={false}
                  renderItem={dataRenderCartList}
                  data={cartList}
                  keyExtractor={(item, index) => index}
                  stickyHeaderIndices={[0]}
                />
              </View>
              <View
                style={[
                  _s.totalHeaderContainer,
                  {borderTopColor: '#eee', borderTopWidth: 3, paddingTop: 10},
                ]}>
                <View style={{flex: 1}}>
                  <Text style={_s.totalHeaderText}>Discount</Text>
                </View>
                <View>
                  <Text>{stringToCurrency(history.discount)}</Text>
                </View>
              </View>
              <View style={_s.totalHeaderContainer}>
                <View style={{flex: 1}}>
                  <Text style={[_s.totalHeaderText, {fontSize: 20}]}>
                    Total
                  </Text>
                </View>
                <View>
                  <Text style={[_s.totalHeaderText, {fontSize: 20}]}>
                    {stringToCurrency(history.grand_total)}
                  </Text>
                </View>
              </View>
              {history.status == 'SIMPAN' ? (
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      flex: 1,
                      borderRightWidth: 3,
                      borderRightColor: '#eee',
                    }}>
                    <Button btnText="Hapus" onPress={hapusInvoice} />
                  </View>
                  <View style={{flex: 1}}>
                    <Button
                      btnText="Edit"
                      onPress={() => {
                        dispatch(setHistoryCartList(cartList));
                        dispatch(setHistoryCartListHeader(history));
                        navigation.navigate('Transaction');
                      }}
                    />
                  </View>
                </View>
              ) : history.status == 'BAYAR' ? (
                <View>
                  <Button btnText="VOID" onPress={voidInvoice} />
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </View>
    </Container>
  );
}

const _s = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: 'row',
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#274472',
  },
  headerText: {
    ..._style.listItemHeaderText,
    color: 'white',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  listText: {
    ..._style.bodyText,
  },
  historyDetailContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#41729F',
  },
  historyDetailText: {
    color: 'white',
    ..._style.listItemHeaderText,
  },
  historyDetailChildContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  historyDetailChildText: {
    ..._style.bodyText,
  },
  totalHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  totalHeaderText: {
    ..._style.listItemHeaderText,
  },
  filterContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginRight: 8,
  },
  filterText: {
    ..._style.bodyText,
    textTransform: 'capitalize',
  },
  filterHeader: {
    ..._style.listItemHeaderText,
    textTransform: 'capitalize',
    marginTop: 25,
  },
  pilihTanggalContainer:{
    // marginTop: 10,    
    paddingVertical: 8,
    paddingHorizontal: 10, 
    borderRadius: 8, 
    borderWidth: 1,
    borderColor: "#eee",
    alignSelf: "flex-start",
  },
  pilihTanggalContainerFocus:{
    // marginTop: 10,    
    borderWidth: 1,
    borderColor: "#41729F",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8, 
  },
  modalHeader: {
    ..._style.listItemHeaderText,fontSize: 20, marginLeft: 8,
  },
  counterFilterContainer: {    
    borderColor: "#41729F",
    borderWidth: 1,
    paddingHorizontal: 5,
    marginRight: 7,
    borderRadius: 15,
  }
});

export default TransactionHistory;
