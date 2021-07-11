import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  Alert
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import _style from '../../../styles';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {apiRequestAxios, dateToFormat, stringToCurrency} from '../../../util';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import {dateTimeToFormat} from '../../../util';

function OtherDatabaseReport() {
  const user = useSelector(state => state.user);  
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
  const [filterVisible, setFilterVisible] = useState(false);

  const [dateFilter, setDateFilter] = useState(new Date());
  const [dateFilterPrev, setDateFilterPrev] = useState(dateFilter);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilter, setIsDateFilter] = useState(false);
  const [counterFilter, setCounterFilter] = useState(0);
  const [refreshCartList, setRefreshCartList] = useState(false);
  const [sumGrandTotal, setSumGrandTotal] = useState(0);
  const [sumTotalDiscount, setSumTotalDiscount] = useState(0);
  const [storeId, setStoreId] = useState('');
  const [storeIdChange, setStoreIdChange] = useState('');

  const filterItem = ['Hari ini', 'Kemarin', '1 Minggu Terakhir'];
  const filterStatus = ['Semua', 'Simpan', 'Hapus', 'Bayar', 'Void'];

  const headerTable = [
    {
      key: 'trxHeader_id',
      value: 'Trx No',
    },
    {
      key: 'trxHeader_createdDate',
      value: 'Trx Date',
    },
    {
      key: 'trxHeader_grandTotal',
      value: 'Grand Total',
    },
    {
      key: 'trxHeader_discount',
      value: 'Discount',
    },
    {
      key: 'trxHeader_totalItem',
      value: 'Items',
    },
    {
      key: 'trxHeader_status',
      value: 'Status',
    },
    {
      key: 'trxHeader_refVoidId',
      value: 'Ref',
    },
    {
      key: 'trxHeader_storeId',
      value: 'Store ID',
    },
    {
      key: 'trxHeader_storeName',
      value: 'Store Name',
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

  //api call only run once
  useEffect(async () => {
    // await apiGetHistoryList();
    await runApiGetByDate();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // const unsubscribe = apiGetHistoryList();
      const unsubscribe = runApiGetByDate();
      setFilterItemFocus(0);
      setFilterStatusFocus(0);
      setFilterStatusFocusPrev(0);
      return () => unsubscribe;
    }, []),
  );

  useEffect(async () => {
    if (history.id != undefined) {
      setCartList(history.items);
    }
  }, [history.id, refreshCartList]);

  useEffect(async () => {
    await runApiGetByDate();
    setFilterItemModalFocus(filterItemFocus);
  }, [filterItemFocus, filterStatusFocusPrev, dateFilterPrev, storeId]);

  function runApiGetByDate() {
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

    let obj = {};
    obj.date = currentDateTimeFormatted;
    obj.status =
      filterStatusFocus != 0
        ? `%${filterStatus[filterStatusFocus].toUpperCase()}%`
        : '%%';
    obj.storeId = storeId;
    if (filterItem[filterItemFocus] == '1 Minggu Terakhir') {
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      obj.date = undefined;
      obj.startDate = currentDateTimeFormatted;
      obj.endDate = dateToFormat(tomorrow);
      apiGetByDateBetween(obj);
    } else {
      apiGetByDate(obj);
    }

    if (filterStatusFocus != 0) setCounterFilter(1);
    if (filterItemFocus != 0) setCounterFilter(1);
    if (filterItemFocus == 0 && filterStatusFocus == 0) setCounterFilter(0);
    if (filterItemFocus != 0 && filterStatusFocus != 0) setCounterFilter(2);
  }

  async function apiGetByDate(param) {
    await apiRequestAxios(
      user.store.api_url + `/transactionHeader/report`,
      'get',
      {
        params: {
          date: param.date,
          status: param.status,
          storeId: param.storeId,
        },
      },
    ).then(async res => {
      let sumGrandTotal = 0;
      let sumTotalDiscount = 0;
      let result = res.data.result;

      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          sumGrandTotal +=
            result[i].trxHeader_status == 'BAYAR'
              ? parseInt(result[i].trxHeader_grandTotal)
              : 0;
          sumTotalDiscount +=
            result[i].trxHeader_status == 'BAYAR'
              ? parseInt(result[i].trxHeader_discount)
              : 0;
        }
        await setHistory(result[0]);
        await setSumGrandTotal(sumGrandTotal);
        await setSumTotalDiscount(sumTotalDiscount);
        await setHistoryList(result);
      } else {
        await setHistory({});
        await setHistoryList([]);
        await setCartList([]);
      }
    })
    .catch(err =>{
      console.error(err.message)
    });
  }

  async function apiGetByDateBetween(param) {
    await apiRequestAxios(
      user.store.api_url + `/transactionHeader/report`,
      'get',
      {
        params: {
          startDate: param.startDate,
          endDate: param.endDate,
          status: param.status,
          storeId: param.storeId,
        },
      },
    ).then(async res => {
      let sumGrandTotal = 0;
      let sumTotalDiscount = 0;
      let result = res.data.result;

      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          sumGrandTotal +=
            result[i].trxHeader_status == 'BAYAR'
              ? parseInt(result[i].trxHeader_grandTotal)
              : 0;
          sumTotalDiscount +=
            result[i].trxHeader_status == 'BAYAR'
              ? parseInt(result[i].trxHeader_discount)
              : 0;
        }
        await setHistory(result[0]);
        await setSumGrandTotal(sumGrandTotal);
        await setSumTotalDiscount(sumTotalDiscount);
        await setHistoryList(result);
      } else {
        await setHistory({});
        await setHistoryList([]);
        await setCartList([]);
      }
    })
    .catch(err =>{
      console.error(err.message)
    });
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
                {v.key == 'trxHeader_discount' ||
                v.key == 'trxHeader_grandTotal' ||
                v.key == 'trxHeader_totalItem'
                  ? stringToCurrency(item[v.key])
                  : v.key == 'trxHeader_createdDate'
                  ? dateTimeToFormat(new Date(item[v.key]))
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
                  <Text
                    style={[_style.rowTableText, _style.listItemHeaderText]}>
                    {item.trxDetail_itemName}
                  </Text>
                </View>
              ) : null}
              {v.key == 'price' ? (
                <View style={_style.flexEnd}>
                  <Text style={_style.rowTableText}>
                    {stringToCurrency(item.trxDetail_price)}
                  </Text>
                  <Text style={_style.rowTableText}>
                    {history.ref_void_id != null
                      ? `-${stringToCurrency(item.trxDetail_quantity)}`
                      : stringToCurrency(item.trxDetail_quantity)}
                  </Text>
                </View>
              ) : null}
              {v.key == 'total' ? (
                <View style={_style.flexEnd}>
                  <Text style={_style.rowTableText}>
                    {stringToCurrency(item.trxDetail_discount)}
                  </Text>
                  <Text style={_style.rowTableText}>
                    {history.ref_void_id != null
                      ? `-${stringToCurrency(item.trxDetail_total)}`
                      : stringToCurrency(item.trxDetail_total)}
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
    await setStoreId(storeIdChange);
    await setFilterItemFocus(filterItemModalFocus);
    await setFilterStatusFocusPrev(filterStatusFocus);
    await setFilterVisible(!filterVisible);
    await setDateFilterPrev(dateFilter);

    if (
      filterItemModalFocus != 0 &&
      filterStatusFocus != 0 &&
      storeIdChange.length != 0
    ) {
      setCounterFilter(3);
    } else if (
      filterItemModalFocus == 0 &&
      filterStatusFocus == 0 &&
      storeIdChange.length == 0
    ) {
      setCounterFilter(0);
    } else {
      let tmp = 0;
      if (filterItemModalFocus != 0) tmp++;
      if (filterStatusFocus != 0) tmp++;
      if (storeIdChange.length > 0) tmp++;
      setCounterFilter(tmp);
    }
  }

  function cancelFilter() {
    setIsDateFilter(false);
    setFilterItemModalFocus(filterItemFocus);
    setFilterStatusFocus(filterStatusFocusPrev);
    setFilterVisible(!filterVisible);
  }

  return (
    <Container>
      <Header backBtn={true} name="Database Report" />
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
        style={_style.margin0}
        isVisible={filterVisible}
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
                  setFilterStatusFocus(0);
                }}>
                <Text style={[_style.modalHeader, {color: '#68BBE3'}]}>
                  Reset
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView>
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
              <Text style={_style.filterHeader}>Store ID</Text>
              <TextInput
                style={_style.fieldText}
                onChangeText={text => setStoreIdChange(text)}
                placeholder="Store ID..."
                defaultValue={storeId}
              />
            </View>
          </ScrollView>
          <View>
            {(filterItemModalFocus != filterItemFocus ||
              filterStatusFocus != filterStatusFocusPrev ||
              storeIdChange != storeId ||
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
        <View style={[_style.flexRowCenter]}>
          <View style={_style.flexEnd}>
            <Text style={_style.listItemHeaderText}>
              Grand Total : {stringToCurrency(sumGrandTotal)}
            </Text>
          </View>
          <View style={_style.flexEnd}>
            <Text style={_style.listItemHeaderText}>
              Total Discount : {stringToCurrency(sumTotalDiscount)}
            </Text>
          </View>
        </View>
      </View>
      <View style={_style.flexRow}>
        <View style={[_style.flex2, _style.tableSeparator]}>
          <FlatList
            ListHeaderComponent={historyHeaderRender}
            showsVerticalScrollIndicator={false}
            renderItem={dataRender}
            data={historyList}
            extraData={historyList}
            keyExtractor={(item, index) => index}
            stickyHeaderIndices={[0]}
          />
          <View style={[_style.tableSeparatorTop, _style.py5, _style.px10]}>
            <Text>Total row : {historyList.length}</Text>
          </View>
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
                  <Text>{stringToCurrency(history.trxHeader_discount)}</Text>
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
                    {stringToCurrency(history.trxHeader_grandTotal)}
                  </Text>
                </View>
              </View>
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

export default OtherDatabaseReport;
