/* eslint-disable */
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TouchableHighlight,
  Alert,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {QUERY_TRX_DETAIL, QUERY_TRX_HEADER} from '../../../config/StaticQuery';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import _font from '../../../styles/Typrograhpy';
import _style from '../../../styles/';
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
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import {dateTimeToFormat, printInvoice, apiRequestAxios} from '../../../util';
import {setLoading} from '../../master/MasterAction';
import {
  apiGetTrxDetailByTrxHeaderId,
  apiGetTrxHeaderByDate,
  apiGetTrxHeaderByDateBetween,
  apiInsertTrxHeaderVoid,
  apiUpdateTrxDetailFlagToY,
  apiUpdateTrxHeaderFlagToY,
  apiUpdateTrxHeaderStatus,
} from '../../../config/Api';

function TransactionHistory() {
  const user = useSelector(state => state.user);
  const db = useSelector(state => state.database);
  const query = useSelector(state => state.query);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [historyList, setHistoryList] = useState([]);
  const [history, setHistory] = useState({});
  const [cartList, setCartList] = useState([]);
  const [dataTableFocus, setDataTableFocus] = useState(0);
  const [filterItemFocus, setFilterItemFocus] = useState(0);
  const [filterItemModalFocus, setFilterItemModalFocus] =
    useState(filterItemFocus);
  const [filterStatusFocus, setFilterStatusFocus] = useState(0);
  const [filterStatusFocusPrev, setFilterStatusFocusPrev] =
    useState(filterStatusFocus);
  const [filterOjolFocus, setFilterOjolFocus] = useState(0);
  const [filterOjolFocusPrev, setFilterOjolFocusPrev] =
    useState(filterOjolFocus);
  const [filterVisible, setFilterVisible] = useState(false);

  const [dateFilter, setDateFilter] = useState(new Date());
  const [dateFilterPrev, setDateFilterPrev] = useState(dateFilter);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilter, setIsDateFilter] = useState(false);
  const [counterFilter, setCounterFilter] = useState(0);
  const [refreshCartList, setRefreshCartList] = useState(false);

  const [trxHeaderList, setTrxHeaderList] = useState([]);
  const [trxDetailList, setTrxDetailList] = useState([]);

  const filterItem = ['Hari ini', 'Kemarin', '1 Minggu Terakhir'];
  const filterStatus = ['Semua', 'Simpan', 'Hapus', 'Bayar', 'Void'];
  const filterOjol = ['Semua', 'Ya', 'Tidak'];

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
    {
      key: 'ojol',
      value: 'Ojol',
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

  //--------------------UPLOAD

  useEffect(async () => {
    if (trxHeaderList.length != 0) {
      apiRequestAxios(user.store.api_url + '/transactionHeader/batch', 'POST', {
        data: trxHeaderList,
      })
        .then(res => {
          apiUpdateTrxHeaderFlagToY(dispatch);
        })
        .catch(err => {});
    }
  }, [trxHeaderList]);

  useEffect(async () => {
    if (trxDetailList.length != 0) {
      apiRequestAxios(user.store.api_url + '/transactionDetail/batch', 'POST', {
        data: trxDetailList,
      })
        .then(res => {
          apiUpdateTrxDetailFlagToY(dispatch);
        })
        .catch(err => {});
    }
  }, [trxDetailList]);

  function syncFunc() {
    // await dispatch(setLoading(true));
    getTrxHeaderList();
    getTrxDetailList();
  }

  async function getTrxHeaderList() {
    let result = await runSqlQuery(
      db.database,
      QUERY_TRX_HEADER.SELECT_ALL_FLAG_NOT_Y,
    );
    let rows = result.rows;
    if (rows.length > 0) {
      let resultList = [];
      for (let i = 0; i < rows.length; i++) {
        // if (rows.item(i).flag == 'Y') continue;
        resultList.push(rows.item(i));
      }
      setTrxHeaderList(resultList);
    }
  }

  async function getTrxDetailList() {
    let result = await runSqlQuery(
      db.database,
      QUERY_TRX_DETAIL.SELECT_ALL_FLAG_NOT_Y,
    );
    let rows = result.rows;
    if (rows.length > 0) {
      let resultList = [];
      for (let i = 0; i < rows.length; i++) {
        // if (rows.item(i).flag == 'Y') continue;
        resultList.push(rows.item(i));
      }
      console.log(resultList);
      setTrxDetailList(resultList);
    }
  }

  //--------------------UPLOAD

  //api call only run once
  useEffect(async () => {
    await runApiGetByDate();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setHistoryList([]);
      setHistory({});
      setCartList([]);
      const unsubscribe = syncFunc();
      const unsubscribe1 = runApiGetByDate();
      setFilterItemFocus(0);
      setFilterStatusFocus(0);
      setFilterStatusFocusPrev(0);
      setFilterOjolFocus(0);
      setFilterOjolFocusPrev(0);
      return () => {
        unsubscribe, unsubscribe1;
      };
    }, []),
  );

  useEffect(async () => {
    if (history.id != undefined) {
      let param = [];
      param.push(
        history.ref_void_id != null ? history.ref_void_id : history.id,
      );
      apiGetTrxDetailByTrxHeaderId(dispatch, param);
    }
  }, [history.id, refreshCartList]);

  useEffect(async () => {
    await runApiGetByDate();
    setFilterItemModalFocus(filterItemFocus);
  }, [
    filterItemFocus,
    filterStatusFocusPrev,
    dateFilterPrev,
    filterOjolFocusPrev,
  ]);

  async function runApiGetByDate() {
    let today = new Date();

    if (filterItem[filterItemFocus] == 'Kemarin') {
      today.setDate(today.getDate() - 1);
    }

    if (filterItem[filterItemFocus] == '1 Minggu Terakhir') {
      today.setDate(today.getDate() - 7);
    }

    let currentDateTimeFormatted = dateToFormat(
      isDateFilter ? dateFilterPrev : today,
    );

    let param = [];
    param.push(currentDateTimeFormatted);
    param.push(
      filterStatusFocus != 0
        ? `%${filterStatus[filterStatusFocus].toUpperCase()}%`
        : '%%',
    );
    param.push(
      filterOjolFocus != 0 ? `%${filterOjolFocus == 1 ? 1 : 0}%` : '%%',
    );
    if (filterItem[filterItemFocus] == '1 Minggu Terakhir') {
      let param = [];
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      param.push(currentDateTimeFormatted);
      param.push(dateToFormat(tomorrow));
      param.push(
        filterStatusFocus != 0
          ? `%${filterStatus[filterStatusFocus].toUpperCase()}%`
          : '%%',
      );
      param.push(
        filterOjolFocus != 0 ? `%${filterOjolFocus == 1 ? 1 : 0}%` : '%%',
      );
      await apiGetTrxHeaderByDateBetween(dispatch, param);
    } else {
      await apiGetTrxHeaderByDate(dispatch, param);
    }

    if (filterItemFocus == 0 && filterStatusFocus == 0 && filterOjolFocus == 0)
      setCounterFilter(0);
    if (
      filterItemFocus != 0 &&
      filterStatusFocus != 0 &&
      filterOjolFocus != 0
    ) {
      setCounterFilter(3);
    } else {
      let tmp = 0;
      if (filterStatusFocus != 0) {
        setCounterFilter(tmp + 1);
        tmp++;
      }
      if (filterItemFocus != 0) {
        setCounterFilter(tmp + 1);
        tmp++;
      }
      if (filterOjolFocus != 0) {
        setCounterFilter(tmp + 1);
        tmp++;
      }
    }
  }

  function apiGetTotalItemByRefVoidId(param) {
    return runSqlQuery(
      db.database,
      QUERY_TRX_DETAIL.SELECT_TOTAL_ITEMS_BY_TRX_HEADER_ID,
      param,
    );
  }

  //get updated data
  useEffect(async () => {
    if (!query.fetchQuery) {
      if (
        query.send.sql == QUERY_TRX_HEADER.SELECT_BY_DATE ||
        query.send.sql == QUERY_TRX_HEADER.SELECT_BY_DATE_BETWEEN
      ) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            if (rows.item(i).ref_void_id != null) {
              let param = [];
              param.push(rows.item(i).ref_void_id);
              let totalItem = await apiGetTotalItemByRefVoidId(param);
              rows.item(i).total_item = totalItem.rows.item(0).total_item;
            }
            resultList.push(rows.item(i));
          }
          console.log(resultList);
          setHistory(resultList[0]);
          setRefreshCartList(!refreshCartList);
          setHistoryList(resultList);
          setDataTableFocus(0);
        } else {
          setCartList([]);
          setHistory({});
          setHistoryList([]);
        }
        dispatch(setLoading(false));
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
      //-------UPLOAD
      // if (query.send.sql == QUERY_TRX_DETAIL.UPDATE_FLAG_Y_ALL) {
      //   await dispatch(setLoading(false));
      // }

      // if (query.send.sql == QUERY_TRX_HEADER.UPDATE_FLAG_Y_ALL) {
      //   await dispatch(setLoading(false));
      // }
      //-------UPLOAD
    }
  }, [query.fetchQuery]);

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
            param.push('E');
            param.push(history.id);
            await apiUpdateTrxHeaderStatus(dispatch, param);
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
            param.push('E');
            param.push(history.id);
            await apiUpdateTrxHeaderStatus(dispatch, param);

            let today = new Date();
            let currentDateTimeFormatted = dateTimeToFormat(today);

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
            paramHeader.push(user.store.id);
            paramHeader.push(user.store.name);
            paramHeader.push('N');
            paramHeader.push(history.ojol);
            await apiInsertTrxHeaderVoid(dispatch, paramHeader);
            await runApiGetByDate();
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

  function dataRender({item, index}) {
    return (
      <TouchableHighlight
        key={index}
        style={[
          _style.rowTable,
          dataTableFocus == index ? {backgroundColor: '#eee'} : null,
        ]}
        onPress={() => {
          setHistory(item);
          setDataTableFocus(index);
        }}
        underlayColor="#eee">
        <>
          {headerTable.map((v, i) => (
            <View key={i} style={_style.flex1}>
              <Text style={_style.rowTableText}>
                {v.key == 'discount' ||
                v.key == 'grand_total' ||
                v.key == 'total_item'
                  ? stringToCurrency(item[v.key])
                  : v.key == 'ojol'
                  ? item[v.key] == 1
                    ? 'Ya'
                    : 'Tidak'
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
      <View style={_style.headerTable}>
        {headerTable.map((item, index) => (
          <View key={index} style={_style.flex1}>
            <Text style={_style.headerTableText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  function dataRenderCartList({item, index}) {
    return (
      <View key={index} style={[_style.rowTable]}>
        <>
          {headerTableCartList.map((v, i) => (
            <View key={i} style={_style.flexRowCenter}>
              {v.key == 'name' ? (
                <View style={_style.flex1}>
                  <Text style={[_style.rowTableText, _font.listItemHeaderText]}>
                    {item.item_name}
                  </Text>
                </View>
              ) : null}
              {v.key == 'price' ? (
                <View style={_style.flexEnd}>
                  <Text style={_style.rowTableText}>
                    {item.priceNew != undefined
                      ? stringToCurrency(item.priceNew)
                      : stringToCurrency(item.price)}
                  </Text>
                  <Text style={_style.rowTableText}>
                    {history.ref_void_id != null
                      ? `-${stringToCurrency(item.quantity)}`
                      : stringToCurrency(item.quantity)}
                  </Text>
                </View>
              ) : null}
              {v.key == 'total' ? (
                <View style={_style.flexEnd}>
                  <Text style={_style.rowTableText}>
                    {item.discountNew != undefined
                      ? stringToCurrency(item.discountNew)
                      : stringToCurrency(item.discount)}
                  </Text>
                  <Text style={_style.rowTableText}>
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
      <View style={_style.headerTable}>
        {headerTableCartList.map((item, index) => (
          <View
            key={index}
            style={[
              _style.flex1,
              item.key != 'name' ? {alignItems: 'flex-end'} : null,
            ]}>
            <Text style={_style.headerTableText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  function handleDatePicker(event, selectedDate) {
    if (event.type == 'set') {
      setIsDateFilter(true);
      setFilterItemModalFocus(99);
      setDateFilter(event.nativeEvent.timestamp);
    }
    setShowDatePicker(false);
  }

  async function handleFilter() {
    await setFilterItemFocus(filterItemModalFocus);
    await setFilterStatusFocusPrev(filterStatusFocus);
    await setFilterOjolFocusPrev(filterOjolFocus);
    await setFilterVisible(!filterVisible);
    await setDateFilterPrev(dateFilter);

    if (
      filterItemModalFocus != 0 &&
      filterStatusFocus != 0 &&
      filterOjolFocus != 0
    ) {
      setCounterFilter(3);
    } else if (
      filterItemModalFocus == 0 &&
      filterStatusFocus == 0 &&
      filterOjolFocus == 0
    ) {
      setCounterFilter(0);
    }
  }

  function cancelFilter() {
    setIsDateFilter(false);
    setFilterItemModalFocus(filterItemFocus);
    setFilterStatusFocus(filterStatusFocusPrev);
    setFilterOjolFocus(filterOjolFocusPrev);
    setFilterVisible(!filterVisible);
  }

  function cartListCalculate() {
    let tmpTotalDiscount = 0;
    let tmpTotalPrice = 0;
    let tmp = cartList;

    for (let i = 0; i < tmp.length; i++) {
      tmpTotalDiscount += tmp[i].discount;
      tmpTotalPrice += tmp[i].price * tmp[i].quantity;
    }

    return {
      tmpTotalDiscount,
      tmpTotalPrice,
    };
  }

  async function rePrint() {
    dispatch(setLoading(true));

    let res = await cartListCalculate();

    let data = {
      storeName: history.store_name,
      date: history.date,
      discount: history.discount,
      grandTotal: history.grand_total,
      discountItem: res.tmpTotalDiscount,
      priceItem: res.tmpTotalPrice,
    };
    try {
      await printInvoice(data, cartList);
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      Alert.alert('Error', 'Printer not connected');
    }
  }

  function handleRefresh() {
    dispatch(setLoading(true));
    runApiGetByDate();
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
      <Modal
        isVisible={filterVisible}
        style={_style.margin0}
        onBackdropPress={cancelFilter}
        onBackButtonPress={cancelFilter}>
        <View style={[_style.flex1, _style.bgWhite]}>
          <View style={[_style.rowDirectionCenter, _style.px15, _style.pt15]}>
            <TouchableOpacity onPress={cancelFilter}>
              <AntDesignIcon
                name="close"
                size={25}
                color="black"
                style={_style.mr5}
              />
            </TouchableOpacity>
            <View style={_style.flex1}>
              <Text style={_style.modalHeader}>Filter</Text>
            </View>
            {(isDateFilter || filterStatusFocus || filterItemFocus != 0) && (
              <TouchableOpacity
                onPress={() => {
                  setIsDateFilter(false);
                  setFilterItemModalFocus(0);
                  // setFilterStatusFocusPrev(filterStatusFocus)
                  setFilterStatusFocus(0);
                  setFilterOjolFocus(0);
                }}>
                <Text style={[_style.modalHeader, {color: '#68BBE3'}]}>
                  Reset
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[_style.flex1, _style.px15]}>
            <Text style={_style.filterHeader}>Periode</Text>
            <View style={[_style.rowDirection, _style.mt10]}>
              {filterItem.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    _style.filterBtn,
                    filterItemModalFocus == index
                      ? {borderColor: '#274472', borderWidth: 1}
                      : null,
                  ]}
                  activeOpacity={1}
                  onPress={() => {
                    setFilterItemModalFocus(index);
                    setIsDateFilter(false);
                  }}>
                  <View style={_style.rowDirectionCenter}>
                    <Text style={_style.filterText}> {item} </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={
                  isDateFilter
                    ? _s.pilihTanggalContainerFocus
                    : _s.pilihTanggalContainer
                }>
                <Text>
                  {isDateFilter ? dateToFormat(dateFilter) : 'Pilih Tanggal'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={_style.filterHeader}>Status</Text>
            <View style={[_style.rowDirection, _style.mt10]}>
              {filterStatus.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    _style.filterBtn,
                    filterStatusFocus == index
                      ? {borderColor: '#274472', borderWidth: 1}
                      : null,
                  ]}
                  activeOpacity={1}
                  onPress={() => setFilterStatusFocus(index)}>
                  <View style={_style.rowDirectionCenter}>
                    <Text style={_style.filterText}>{item}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={_style.filterHeader}>Ojol</Text>
            <View style={[_style.rowDirection, _style.mt10]}>
              {filterOjol.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    _style.filterBtn,
                    filterOjolFocus == index
                      ? {borderColor: '#274472', borderWidth: 1}
                      : null,
                  ]}
                  activeOpacity={1}
                  onPress={() => setFilterOjolFocus(index)}>
                  <View style={_style.rowDirectionCenter}>
                    <Text style={_style.filterText}>{item}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View>
            {(filterItemModalFocus != filterItemFocus ||
              filterStatusFocus != filterStatusFocusPrev ||
              filterOjolFocus != filterOjolFocusPrev ||
              dateFilter != dateFilterPrev) && (
              <Button btnText="Simpan" onPress={() => handleFilter()} />
            )}
          </View>
        </View>
      </Modal>

      <View style={_style.filterContainer}>
        <TouchableOpacity
          style={_style.filterBtn}
          activeOpacity={1}
          onPress={() => setFilterVisible(!filterVisible)}>
          <View style={_style.rowDirectionCenter}>
            {counterFilter != 0 ? (
              <View style={_style.counterFilterContainer}>
                <Text>{counterFilter}</Text>
              </View>
            ) : (
              <AntDesignIcon
                name="filter"
                size={20}
                color="black"
                style={_style.mr5}
              />
            )}
            <Text style={_style.filterText}>Filter </Text>
          </View>
        </TouchableOpacity>
        {filterItem.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              _style.filterBtn,
              filterItemFocus == index
                ? {borderColor: '#274472', borderWidth: 1}
                : null,
            ]}
            activeOpacity={1}
            onPress={() => setFilterItemFocus(index)}>
            <View style={_style.rowDirectionCenter}>
              <Text
                style={[
                  _style.filterText,
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
      <View style={_style.flexRow}>
        <View style={[_style.flex2, _style.tableSeparator]}>
          {/* HISTORY LIST */}
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={user.loading}
                onRefresh={handleRefresh}
              />
            }
            removeClippedSubviews={true}
            ListHeaderComponent={historyHeaderRender}
            showsVerticalScrollIndicator={false}
            renderItem={dataRender}
            data={historyList}
            extraData={historyList}
            keyExtractor={(item, index) => index}
            stickyHeaderIndices={[0]}
          />
        </View>
        <View style={_style.flex1}>
          {history != null ? (
            <>
              <View style={_style.flex1}>
                <FlatList
                  ListHeaderComponent={cartListHeaderRender}
                  showsVerticalScrollIndicator={false}
                  renderItem={dataRenderCartList}
                  data={cartList}
                  extraData={cartList}
                  keyExtractor={(item, index) => index}
                  stickyHeaderIndices={[0]}
                />
              </View>
              <View
                style={[_style.totalHeaderContainer, _style.tableSeparatorTop]}>
                <View style={_style.flex1}>
                  <Text style={_style.totalHeaderText}>Discount</Text>
                </View>
                <View>
                  <Text>{stringToCurrency(history.discount)}</Text>
                </View>
              </View>
              <View style={_style.totalHeaderContainer}>
                <View style={_style.flex1}>
                  <Text style={[_style.totalHeaderText, {fontSize: 20}]}>
                    Total
                  </Text>
                </View>
                <View>
                  <Text style={[_style.totalHeaderText, {fontSize: 20}]}>
                    {stringToCurrency(history.grand_total)}
                  </Text>
                </View>
              </View>
              {history.status == 'SIMPAN' ? (
                <View style={_style.rowDirection}>
                  <View style={[_style.tableSeparator, _style.flex1]}>
                    <Button btnText="Hapus" onPress={hapusInvoice} />
                  </View>
                  <View style={_style.flex1}>
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
                <View style={_style.rowDirection}>
                  <View style={[_style.tableSeparator, _style.flex1]}>
                    <Button btnText="VOID" onPress={voidInvoice} />
                  </View>
                  <View style={_style.flex1}>
                    <Button btnText="RE-PRINT" onPress={rePrint} />
                  </View>
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
  pilihTanggalContainer: {
    // marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    alignSelf: 'flex-start',
  },
  pilihTanggalContainerFocus: {
    // marginTop: 10,
    borderWidth: 1,
    borderColor: '#41729F',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});

export default TransactionHistory;
