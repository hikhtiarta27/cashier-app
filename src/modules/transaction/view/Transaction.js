import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Alert,
  TextInput,
  Dimensions,
  BackHandler,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {queryFetch} from '../../database/DBAction';
import {
  QUERY_CATEGORY,
  QUERY_ITEM,
  QUERY_TRX_HEADER,
  QUERY_TRX_DETAIL,
} from '../../../config/StaticQuery';
import Container from '../../../components/Container';
import Header from '../../../components/Header';
import _style from '../../../styles/Typrograhpy';
import {
  useFocusEffect,
  useNavigation,
  useNavigationState,
  useRoute,
} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Button from '../../../components/Button';
import ErrorText from '../../../components/ErrorText';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {runSqlQuery} from '../../database/DBSaga';
import {
  setHistoryCartList,
  setHistoryCartListHeader,
} from '../TransactionAction';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {dateTimeToFormat, stringToCurrency} from '../../../util';
import Modal from 'react-native-modal';

const discountScheme = Yup.object().shape({
  discount: Yup.string()
    .matches(/^[0-9]+$/, 'Only number')    
});

const formList = [
  {
    key: 'discount',
    value: 'Discount',
  },
];

function Transaction() {
  const query = useSelector(state => state.query);
  const transaction = useSelector(state => state.transaction);
  const db = useSelector(state => state.database);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const navigationStateHistory = useNavigationState(state => state.history);
  const route = useRoute();
  const [lastIdInvoice, setLastIdInvoice] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [category, setCategory] = useState({code: '', name: ''});
  const [dataTableFocusCategory, setDataTableFocusCategory] = useState(0);
  const [itemsList, setItemsList] = useState([]);
  const [items, setItems] = useState({});
  const [dataTableFocusItems, setDataTableFocusItems] = useState();
  const [cartUpdateIndex, setCartUpdateIndex] = useState(false);
  const [cartList, setCartList] = useState([]);
  const [cartListBck, setCartListBck] = useState([]);
  const [grandTotalDiscount, setGrandTotalDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [itemsListBackup, setItemListBackup] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartListIndex, setCartListIndex] = useState(null);
  const [discountModal, setDiscountModal] = useState(false);
  const [discountValue, setDiscountValue] = useState(0)

  const formik = useFormik({
    initialValues: {
      discount: "",
    },
    validationSchema: discountScheme,
    onSubmit: async values => {      
      if (values.discount == "") addDiscount(0)
      else addDiscount(values.discount)      
    },
  });

  const headerTableCategory = [
    {
      key: 'name',
      value: 'Category',
    },
  ];

  const headerTableItems = [
    {
      key: 'name',
      value: 'Product',
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
    await apiGetCategoryList();
    // for query all item
    // await apiGetItemsListAll();
  }, []);

  useEffect(async () => {
    let param = [];
    param.push(category.code);
    await apiGetItemsList(param);
  }, [category.code]);

  useEffect(async () => {    
    if (transaction.historyCartList != null) {      
      let tmp = transaction.historyCartList;
      let newArray = [];

      for (let i = 0; i < tmp.length; i++) {
        let obj = {
          id_trx_detail: tmp[i].id,
          code: tmp[i].item_code,
          name: tmp[i].item_name,
          price: parseInt(tmp[i].price),
          qty: parseInt(tmp[i].quantity),
          discount: parseInt(tmp[i].discount),
          total: parseInt(tmp[i].total),
        };
        await newArray.push(obj);
      }
      setCartList(newArray);
      calculate(newArray, transaction.historyCartListHeader.discount);
      setCartUpdateIndex(!cartUpdateIndex);
    }  
    
    if (transaction.historyCartListHeader != null) {  
      setDiscountValue(transaction.historyCartListHeader.discount)            
      formik.setFieldValue("discount", transaction.historyCartListHeader.discount.toString())
    }

  }, [transaction.historyCartList, transaction.historyCartListHeader]);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = apiGetCategoryList();      
      const onBackPress = e => {
        if (transaction.historyCartListHeader != null) {
          dispatch(setHistoryCartList(null));
          dispatch(setHistoryCartListHeader(null));
          clearCartList();
        } else {
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        unsubscribe;
      };
    }, [transaction.historyCartListHeader]),
  );

  //get updated data
  useEffect(async () => {
    if (!query.fetchQuery) {
      if (query.send.sql == QUERY_CATEGORY.SELECT) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            resultList.push(rows.item(i));
          }
          if (category.code == '') {
            //for bug after switching to transaction and master item
            setCategory(resultList[0]);
            setCategoryList(resultList);
          }
        } else {
          setCategory({
            code: '',
            name: '',
          });
          setCategoryList([]);
        }
      }

      if (query.send.sql == QUERY_ITEM.SELECT_BY_CATEGORY_CODE) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            resultList.push(rows.item(i));
          }
          setItems(resultList[0]);
          setItemsList(resultList);
          setItemListBackup(resultList);
        } else {
          setItems(null);
          setItemsList([]);
          setItemListBackup([]);
        }
      }

      if (query.send.sql == QUERY_ITEM.SELECT) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            resultList.push(rows.item(i));
          }
          setItemListBackup(resultList);
        } else {
          setItemListBackup([]);
        }
      }
    }
  }, [query]);

  function addToCart(item) {
    let tmp = cartList;
    let obj = item;
    let exist = false;

    for (let i = 0; i < tmp.length; i++) {
      if (tmp[i].code == obj.code) {
        if (tmp[i].priceNew == undefined && tmp[i].discountNew == undefined) {
          exist = true;
          tmp[i].qty++;
        } else if (
          tmp[i].priceNew == obj.price &&
          tmp[i].discountNew == obj.discount
        ) {
          exist = true;
          tmp[i].qty++;
        }
      }
    }
    if (!exist) {
      let newObj = {
        ...item,
        qty: 1,
        total: item.price - item.discount,
      };      
      tmp.push(newObj);
    }

    calculate();

    setCartList(tmp);
    let tmp1 = cartUpdateIndex;
    setCartUpdateIndex(!tmp1);
  }

  function calculate(data = null, discount = null) {
    let tmpTotalDiscount = 0;
    let tmpGrandTotal = 0;
    let tmp = data != null ? data : cartList;
    for (let i = 0; i < tmp.length; i++) {
      tmpTotalDiscount +=
        (tmp[i].discountNew != undefined
          ? tmp[i].discountNew
          : tmp[i].discount) * tmp[i].qty;
      tmp[i].total =
        tmp[i].qty *
        ((tmp[i].priceNew != undefined ? tmp[i].priceNew : tmp[i].price) -
          (tmp[i].discountNew != undefined
            ? tmp[i].discountNew
            : tmp[i].discount));
      tmpGrandTotal += tmp[i].total;
    }    

    // setGrandTotalDiscount(tmpTotalDiscount);        
    setGrandTotal(tmpGrandTotal - discountValue);
    if(discount != null){
      setGrandTotal(tmpGrandTotal - discount);
    }    
  }

  function apiGetCategoryList() {
    dispatch(
      queryFetch({
        sql: QUERY_CATEGORY.SELECT,
      }),
    );
  }

  function apiGetItemsList(param) {
    dispatch(
      queryFetch({
        sql: QUERY_ITEM.SELECT_BY_CATEGORY_CODE,
        param,
      }),
    );
  }

  function dataRenderCategory({item, index}) {
    return (
      <TouchableHighlight
        key={index}
        style={[
          _s.listContainer,
          dataTableFocusCategory == index ? {backgroundColor: '#eee'} : null,
        ]}
        onPress={() => {
          setCategory(item);
          setDataTableFocusCategory(index);
        }}
        underlayColor="#eee">
        <>
          {headerTableCategory.map((v, i) => (
            <View key={i} style={{flex: 1}}>
              <Text style={_s.listText}>{item[v.key]}</Text>
            </View>
          ))}
        </>
      </TouchableHighlight>
    );
  }

  function categoryHeaderRender() {
    return (
      <View style={_s.headerContainer}>
        {headerTableCategory.map((item, index) => (
          <View key={index} style={{flex: 1}}>
            <Text style={_s.headerText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  function dataRenderItems({item, index}) {
    return (
      <TouchableHighlight
        key={index}
        style={[_s.listContainer]}
        onPress={() => {
          // setItems(item);
          setDataTableFocusItems(index);
          addToCart(item);
        }}
        underlayColor="#eee">
        <>
          {headerTableItems.map((v, i) => (
            <View
              key={i}
              style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
              <View style={{flex: 1}}>
                <Text style={[_s.listText, _style.listItemHeaderText]}>
                  {item[v.key]}
                </Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={_s.listText}>{stringToCurrency(item.price)}</Text>
                <Text style={_s.listText}>
                  {stringToCurrency(item.discount)}
                </Text>
              </View>
            </View>
          ))}
        </>
      </TouchableHighlight>
    );
  }

  function itemsHeaderRender() {
    return (
      <View style={_s.headerContainer}>
        {headerTableItems.map((item, index) => (
          <View key={index} style={{flex: 1}}>
            <Text style={_s.headerText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  function callbackInvoiceEdit(item) {
    setCartUpdateIndex(!cartUpdateIndex);
    let tmp = cartList;
    tmp = tmp.filter(item => parseInt(item.qty) != 0);
    setCartList(tmp);
    calculate();
  }

  function dataRenderCartList({item, index}) {
    return (
      <TouchableHighlight
        key={index}
        style={[_s.listContainer]}
        onPress={() => {
          setCartListIndex(index);
          navigation.navigate('InvoiceEdit', {
            onCallback: callbackInvoiceEdit,
            item: item,
          });
        }}
        underlayColor="#eee">
        <>
          {headerTableCartList.map((v, i) => (
            <View
              key={i}
              style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
              {v.key == 'name' ? (
                <View style={{flex: 1}}>
                  <Text style={[_s.listText, _style.listItemHeaderText]}>
                    {item.name}
                  </Text>
                </View>
              ) : null}
              {v.key == 'price' ? (
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                  <Text style={_s.listText}>
                    {item.priceNew != undefined
                      ? stringToCurrency(item.priceNew)
                      : stringToCurrency(item.price)}
                  </Text>
                  <Text style={_s.listText}>{stringToCurrency(item.qty)}</Text>
                </View>
              ) : null}
              {v.key == 'total' ? (
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                  <Text style={_s.listText}>
                    {item.discountNew != undefined
                      ? stringToCurrency(item.discountNew)
                      : stringToCurrency(item.discount)}
                  </Text>
                  <Text style={_s.listText}>
                    {stringToCurrency(item.total)}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </>
      </TouchableHighlight>
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

  function clearCartList() {
    setCartList([]);    
    setDiscountValue(0);
    setGrandTotal(0);
    formik.resetForm()
  }

  function searchText(text) {    
    let newArray = [];
    for (let i = 0; i < itemsListBackup.length; i++) {
      let tmp = itemsListBackup[i].name.toLowerCase();
      text = text.toLowerCase();
      if (tmp.indexOf(text) != -1) {
        newArray.push(itemsListBackup[i]);
      }
    }
    setItemsList(newArray);
  }

  function apiUpdateToTrxHeader(param) {
    {
      dispatch(
        queryFetch({
          sql: QUERY_TRX_HEADER.UPDATE,
          param,
        }),
      );
    }
  }

  function apiUpdateToTrxDetail(param) {
    {
      dispatch(
        queryFetch({
          sql: QUERY_TRX_DETAIL.UPDATE,
          param,
        }),
      );
    }
  }

  function apiDeleteToTrxDetailBy(param) {
    {
      dispatch(
        queryFetch({
          sql: QUERY_TRX_DETAIL.DELETE_BY_TRX_HEADER_ID,
          param,
        }),
      );
    }
  }

  function showAlertBayarAndSimpan(status) {
    Alert.alert(
      'Confirmation',
      `Apakah kamu ingin ${
        status == 'BAYAR' ? 'membayar' : 'menyimpan'
      } pesanan ini?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            transactionInsert(status);
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
      },
    );
  }

  async function transactionInsert(status) {
    let today = new Date();
    let currentDateTimeFormatted = dateTimeToFormat(today);

    if (transaction.historyCartListHeader != null) {

      let paramHeader = [];
      paramHeader.push(currentDateTimeFormatted);
      paramHeader.push(discountValue);
      paramHeader.push(grandTotal);
      paramHeader.push(status);
      paramHeader.push(transaction.historyCartListHeader.id);

      await apiUpdateToTrxHeader(paramHeader);
      await apiDeleteToTrxDetailBy([transaction.historyCartListHeader.id]);

      for (let i = 0; i < cartList.length; i++) {
        let paramDetail = [];
        let x = cartList[i]
        paramDetail.push(transaction.historyCartListHeader.id);
        paramDetail.push(x.code);
        paramDetail.push(x.name);
        paramDetail.push(
          x.priceNew != undefined
            ? x.priceNew
            : x.price,
        );
        paramDetail.push(
          x.discountNew != undefined
            ? x.discountNew
            : x.discount,
        );
        paramDetail.push(x.qty);
        paramDetail.push(x.total);
        paramDetail.push(currentDateTimeFormatted);
        await apiInsertToTrxDetail(paramDetail);
      }      

      dispatch(setHistoryCartList(null));
      dispatch(setHistoryCartListHeader(null));
      navigation.goBack();
    } else {
      let paramHeader = [];
      paramHeader.push(currentDateTimeFormatted);
      paramHeader.push(discountValue);
      paramHeader.push(grandTotal);
      paramHeader.push(status);
      paramHeader.push(currentDateTimeFormatted);
      await apiInsertToTrxHeader(paramHeader);

      let lastId = await apiGetLastIdTrxHeader();
      lastId = lastId.rows.item(0).id;

      for (let i = 0; i < cartList.length; i++) {
        let paramDetail = [];
        paramDetail.push(lastId);
        paramDetail.push(cartList[i].code);
        paramDetail.push(cartList[i].name);
        paramDetail.push(
          cartList[i].priceNew != undefined
            ? cartList[i].priceNew
            : cartList[i].price,
        );
        paramDetail.push(
          cartList[i].discountNew != undefined
            ? cartList[i].discountNew
            : cartList[i].discount,
        );
        paramDetail.push(cartList[i].qty);
        paramDetail.push(cartList[i].total);
        paramDetail.push(currentDateTimeFormatted);        
        await apiInsertToTrxDetail(paramDetail);
      }
    }
    clearCartList();
  }

  function apiGetLastIdTrxHeader() {
    return runSqlQuery(db.database, QUERY_TRX_HEADER.GET_LAST_ID);
  }

  function apiInsertToTrxHeader(param) {
    dispatch(
      queryFetch({
        sql: QUERY_TRX_HEADER.INSERT,
        param,
      }),
    );
  }

  function apiInsertToTrxDetail(param) {
    dispatch(
      queryFetch({
        sql: QUERY_TRX_DETAIL.INSERT,
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
            param.push(transaction.historyCartListHeader.id);
            await apiUpdateStatus(param);
            Alert.alert('Information', 'Transaction successfully deleted!', [
              {
                text: 'Ok',
                style: 'default',
                onPress: () => {
                  navigation.navigate('TransactionHistory');
                  dispatch(setHistoryCartListHeader(null));
                  dispatch(setHistoryCartList(null));
                },
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

  function addDiscount(values) {
    setGrandTotal(parseInt(grandTotal) + parseInt(discountValue) - parseInt(values))
    setDiscountModal(false)
    setDiscountValue(values)    
  }

  function cancelDiscount() {
    setDiscountModal(false)    
    // formik.resetForm()
  }

  return (
    <Container>
      {transaction.historyCartListHeader != null ? (
        <Header
          name={`Transaction No #${transaction.historyCartListHeader.id}`}
          submitBtnComponent={
            <AntDesignIcon name="delete" size={20} color="#ff6961" />
          }
          submitBtn
          submitBtnFunc={hapusInvoice}
        />
      ) : (
        <Header drawerBtn name="Transaction" />
      )}
      <View style={_s.menuBarContainer}>
        <View style={{flex: 1}}>
          <TextInput
            style={_s.searchField}
            placeholder="Search..."
            onChangeText={text => searchText(text)}
          />
        </View>
        {cartList.length > 0 ? (
          <View>
            <TouchableOpacity onPress={clearCartList}>
              <Text style={_s.hapusSemuaText}>Hapus semua</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      <View style={_s.flexRow}>
        <View style={{flex: 1, borderRightColor: '#eee', borderRightWidth: 3}}>
          <FlatList
            ListHeaderComponent={categoryHeaderRender}
            showsVerticalScrollIndicator={false}
            renderItem={dataRenderCategory}
            data={categoryList}
            extraData={categoryList}
            keyExtractor={(item, index) => index}
            stickyHeaderIndices={[0]}
          />
        </View>
        <View style={{flex: 2, borderRightColor: '#eee', borderRightWidth: 3}}>
          <FlatList
            ListHeaderComponent={itemsHeaderRender}
            showsVerticalScrollIndicator={false}
            renderItem={dataRenderItems}
            data={itemsList}
            extraData={itemsList}
            keyExtractor={(item, index) => index}
            stickyHeaderIndices={[0]}
          />
        </View>
        <View style={{flex: 2}}>
          <FlatList
            ListHeaderComponent={cartListHeaderRender}
            showsVerticalScrollIndicator={false}
            renderItem={dataRenderCartList}
            data={cartList}
            extraData={cartUpdateIndex}
            keyExtractor={(item, index) => index}
            stickyHeaderIndices={[0]}
          />
          <View
            style={[
              _s.totalHeaderContainer,
              {borderTopColor: '#eee', borderTopWidth: 3, paddingTop: 10},
            ]}>
            <View style={{flex: 1}}>
              <Text style={_s.totalHeaderText}>Discount</Text>
            </View>
            <TouchableOpacity onPress={() => setDiscountModal(true)} disabled={cartList.length == 0 ? true : false}>
              <Text style={_s.totalHeaderText}>{discountValue == 0 ? "Add Discount" : stringToCurrency(discountValue)}</Text>
            </TouchableOpacity>
          </View>
          <View style={_s.totalHeaderContainer}>
            <View style={{flex: 1}}>
              <Text style={[_s.totalHeaderText, {fontSize: 20}]}>Total</Text>
            </View>
            <View>
              <Text style={[_s.totalHeaderText, {fontSize: 20}]}>
                {stringToCurrency(grandTotal)}
              </Text>
            </View>
          </View>
          {cartList.length > 0 && (
            <View style={{flexDirection: 'row'}}>
              <View
                style={{
                  flex: 1,
                  borderRightColor: '#eee',
                  borderRightWidth: 3,
                }}>
                <Button
                  btnText="Bayar & Print"
                  onPress={() => showAlertBayarAndSimpan('BAYAR')}
                />
              </View>
              <View style={{flex: 1}}>
                <Button
                  btnText="Simpan"
                  onPress={() => showAlertBayarAndSimpan('SIMPAN')}
                />
              </View>
            </View>
          )}
        </View>
      </View>

      <Modal
        isVisible={discountModal}
        style={{margin: 1}}
        onBackdropPress={cancelDiscount}
        onBackButtonPress={cancelDiscount}>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 15,
              paddingTop: 15,
            }}>
            <TouchableOpacity onPress={cancelDiscount}>
              <AntDesignIcon
                name="close"
                size={25}
                color="black"
                style={{marginRight: 5}}
              />
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <Text style={_s.modalHeader}>Add Discount</Text>
            </View>
          </View>
          <View style={{flex: 1, marginTop: 15,}}>
            <ScrollView>
              {formList.map((item, index) => (
                <View style={_s.fieldContainer} key={index}>
                  <Text style={_s.fieldHeaderText}>{item.value}</Text>
                  <View style={{marginHorizontal: 10}}>
                    <TextInput                      
                      style={_s.fieldText}
                      contextMenuHidden={true}
                      key={index}
                      onChangeText={formik.handleChange(item.key)}
                      onBlur={formik.handleBlur(item.key)}
                      value={formik.values[item.key]}
                      clearButtonMode="while-editing"
                      returnKeyType="done"                 
                      keyboardType="numeric"     
                      onSubmitEditing={formik.handleSubmit}
                    />
                    {formik.errors[item.key] && formik.touched[item.key] ? (
                      <ErrorText text={formik.errors[item.key]} />
                    ) : null}
                  </View>
                </View>
              ))}              
            </ScrollView>
          </View>
          <View>
            <Button btnText="Simpan" onPress={formik.handleSubmit} />
          </View>
        </View>
      </Modal>
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
  totalHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  totalHeaderText: {
    ..._style.listItemHeaderText,
  },
  menuBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  searchField: {
    marginVertical: 0,
    paddingVertical: 0,
  },
  hapusSemuaText: {
    color: '#5395B5',
    ..._style.listItemHeaderText,
  },
  filterContainer: {
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center',
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
  modalHeader: {
    ..._style.listItemHeaderText,
    fontSize: 20,
    marginLeft: 8,
  },
  fieldContainer: {
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  fieldHeaderText: {
    ..._style.bodyText,
    paddingHorizontal: 10,
    color: '#888',
  },
  fieldText: {
    ..._style.listItemHeaderText,
    paddingHorizontal: 0,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    fontSize: 16,
  },
});

export default Transaction;
