import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Alert,
  TextInput,
  BackHandler,
  ScrollView,
  TouchableOpacity,
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
import _font from '../../../styles/Typrograhpy';
import _style from '../../../styles/';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
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
import {
  dateTimeToFormat,
  stringToCurrency,
  currencyToInteger,
  printInvoice,
} from '../../../util';
import Modal from 'react-native-modal';
import {TextInputMask} from 'react-native-masked-text';
import {setLoading} from '../../master/MasterAction';
import {
  apiDeleteTrxDetailByTrxHeaderId,
  apiGetCategoryList,
  apiInsertTrxHeader,
  apiUpdateTrxHeader,
  apiUpdateTrxHeaderStatus,
} from '../../../config/Api';

const discountScheme = Yup.object().shape({
  discount: Yup.string()
    .matches(/^[0-9]+$/, 'Only number')
    .transform(value => value.replace(/[^\d]/g, '')),
});

const formList = [
  {
    key: 'discount',
    value: 'Discount',
  },
];

function Transaction() {
  const master = useSelector(state => state.master);
  const user = useSelector(state => state.user);
  const query = useSelector(state => state.query);
  const transaction = useSelector(state => state.transaction);
  const db = useSelector(state => state.database);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [categoryList, setCategoryList] = useState([]);
  const [category, setCategory] = useState({code: '', name: '', items: []});
  const [dataTableFocusCategory, setDataTableFocusCategory] = useState(0);
  const [itemsList, setItemsList] = useState([]);
  const [items, setItems] = useState({});
  const [dataTableFocusItems, setDataTableFocusItems] = useState();
  const [cartUpdateIndex, setCartUpdateIndex] = useState(false);
  const [cartList, setCartList] = useState([]);
  const [grandTotalDiscount, setGrandTotalDiscount] = useState(0);
  const [grandTotalPrice, setGrandTotalPrice] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [itemsListBackup, setItemListBackup] = useState([]);
  const [cartListIndex, setCartListIndex] = useState(null);
  const [discountModal, setDiscountModal] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [percentageValue, setPercentageValue] = useState('');

  const formik = useFormik({
    initialValues: {
      discount: '',
    },
    validationSchema: discountScheme,
    onSubmit: async values => {
      let discount = currencyToInteger(values.discount);
      if (discount == 0) addDiscount(0);
      else addDiscount(discount);
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

  useEffect(async () => {
    // let param = [];
    // param.push(category.code);
    // apiGetItemsList(param);
    // console.log(category)
    if (
      category != null &&
      category.items != null &&
      category.items.length > 0
    ) {
      setItems(category.items[0]);
      setItemsList(category.items);
      setItemListBackup(category.items);
    } else {
      setItems(null);
      setItemsList([]);
      setItemListBackup([]);
    }
  }, [category]);

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
      setDiscountValue(transaction.historyCartListHeader.discount);
      formik.setFieldValue(
        'discount',
        transaction.historyCartListHeader.discount.toString(),
      );
    }
  }, [transaction.historyCartList, transaction.historyCartListHeader]);

  useFocusEffect(
    useCallback(() => {
      apiGetCategoryList(dispatch);
      const unsubscribe = getCategoryItemFromStoreMaster();
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

  useEffect(() => {
    if (master.res != null) getCategoryItemFromStoreMaster();
  }, [master.res]);

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
    }
  }, [query]);

  function getCategoryItemFromStoreMaster() {
    let res = master.res;

    if (res != null && res.length > 0) {
      setCategory(res[0]);
      setDataTableFocusCategory(0);
      setCategoryList(res);
    }
  }

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
    let tmpTotalPrice = 0;
    let tmp = data != null ? data : cartList;
    for (let i = 0; i < tmp.length; i++) {
      tmpTotalDiscount +=
        (tmp[i].discountNew != undefined
          ? tmp[i].discountNew
          : tmp[i].discount) * tmp[i].qty;
      tmpTotalPrice +=
        tmp[i].qty *
        (tmp[i].priceNew != undefined ? tmp[i].priceNew : tmp[i].price);
      tmp[i].total =
        tmp[i].qty *
        ((tmp[i].priceNew != undefined ? tmp[i].priceNew : tmp[i].price) -
          (tmp[i].discountNew != undefined
            ? tmp[i].discountNew
            : tmp[i].discount));
      tmpGrandTotal += tmp[i].total;
    }

    setGrandTotalPrice(tmpTotalPrice);
    setGrandTotalDiscount(tmpTotalDiscount);
    setGrandTotal(tmpGrandTotal - discountValue);
    if (discount != null) {
      setGrandTotal(tmpGrandTotal - discount);
    }
  }

  function dataRenderCategory({item, index}) {
    return (
      <TouchableHighlight
        key={index}
        style={[
          _style.rowTable,
          dataTableFocusCategory == index ? {backgroundColor: '#eee'} : null,
        ]}
        onPress={() => {
          setCategory(item);
          setDataTableFocusCategory(index);
        }}
        underlayColor="#eee">
        <>
          {headerTableCategory.map((v, i) => (
            <View key={i} style={_style.flex1}>
              <Text style={_style.rowTableText}>{item[v.key]}</Text>
            </View>
          ))}
        </>
      </TouchableHighlight>
    );
  }

  function categoryHeaderRender() {
    return (
      <View style={_style.headerTable}>
        {headerTableCategory.map((item, index) => (
          <View key={index} style={_style.flex1}>
            <Text style={_style.headerTableText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  function dataRenderItems({item, index}) {
    return (
      <TouchableHighlight
        key={index}
        style={_style.rowTable}
        onPress={() => {
          // setItems(item);
          setDataTableFocusItems(index);
          addToCart(item);
        }}
        underlayColor="#eee">
        <>
          {headerTableItems.map((v, i) => (
            <View key={i} style={_style.flexRowCenter}>
              <View style={_style.flex1}>
                <Text style={[_style.rowTableText, _font.listItemHeaderText]}>
                  {item[v.key]}
                </Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={_style.rowTableText}>
                  {stringToCurrency(item.price)}
                </Text>
                <Text style={_style.rowTableText}>
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
      <View style={_style.headerTable}>
        {headerTableItems.map((item, index) => (
          <View key={index} style={_style.flex1}>
            <Text style={_style.headerTableText}>{item.value}</Text>
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
        style={[_style.rowTable]}
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
            <View key={i} style={_style.flexRowCenter}>
              {v.key == 'name' ? (
                <View style={_style.flex1}>
                  <Text style={[_style.rowTableText, _font.listItemHeaderText]}>
                    {item.name}
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
                    {stringToCurrency(item.qty)}
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

  function clearCartList() {
    setCartList([]);
    setDiscountValue(0);
    setGrandTotal(0);
    formik.resetForm();
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
    let tmpCartList = cartList;

    if (transaction.historyCartListHeader != null) {
      let paramHeader = [];
      paramHeader.push(currentDateTimeFormatted);
      paramHeader.push(discountValue);
      paramHeader.push(grandTotal);
      paramHeader.push(status);
      paramHeader.push(
        transaction.historyCartListHeader.flag == 'Y' ? 'E' : 'N',
      );
      paramHeader.push(transaction.historyCartListHeader.id);

      await apiUpdateTrxHeader(dispatch, paramHeader);
      await apiDeleteTrxDetailByTrxHeaderId(dispatch, [
        transaction.historyCartListHeader.id,
      ]);

      let listSql = [];
      for (let i = 0; i < tmpCartList.length; i++) {
        let x = tmpCartList[i];
        let sql = `INSERT INTO trx_detail (trx_header_id, item_code, item_name, price, discount, quantity, total, created_date, store_id, store_name, flag) VALUES (${
          transaction.historyCartListHeader.id
        }, '${x.code}', '${x.name}', ${
          x.priceNew != undefined ? x.priceNew : x.price
        }, ${x.discountNew != undefined ? x.discountNew : x.discount}, ${
          x.qty
        }, ${x.total}, '${currentDateTimeFormatted}', '${user.store.id}', '${
          user.store.name
        }', 'N')`;
        await listSql.push(sql);
      }

      dispatch(
        queryFetch({
          sql: 'INSERT_BATCH',
          param: listSql,
        }),
      );

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
      paramHeader.push(user.store.id);
      paramHeader.push(user.store.name);
      paramHeader.push('N');
      await apiInsertTrxHeader(paramHeader);

      let lastId = await apiGetLastIdTrxHeader();
      lastId = lastId.rows.item(0).id;

      let listSql = [];

      for (let i = 0; i < tmpCartList.length; i++) {
        let sql = `INSERT INTO trx_detail (trx_header_id, item_code, item_name, price, discount, quantity, total, created_date, store_id, store_name, flag) VALUES (${lastId}, '${
          tmpCartList[i].code
        }', '${tmpCartList[i].name}', ${
          tmpCartList[i].priceNew != undefined
            ? tmpCartList[i].priceNew
            : tmpCartList[i].price
        }, ${
          tmpCartList[i].discountNew != undefined
            ? tmpCartList[i].discountNew
            : tmpCartList[i].discount
        }, ${tmpCartList[i].qty}, ${
          tmpCartList[i].total
        }, '${currentDateTimeFormatted}', '${user.store.id}', '${
          user.store.name
        }', 'N')`;
        await listSql.push(sql);
      }
      dispatch(
        queryFetch({
          sql: 'INSERT_BATCH',
          param: listSql,
        }),
      );
    }

    if (status == 'BAYAR') {
      await print(currentDateTimeFormatted);
    }

    clearCartList();
  }

  async function print(date) {
    dispatch(setLoading(true));
    let data = {
      storeName: user.store.name,
      date,
      discount: discountValue,
      grandTotal: grandTotal,
      discountItem: grandTotalDiscount,
      priceItem: grandTotalPrice,
    };
    try {
      await printInvoice(data, cartList);
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      Alert.alert('Error', 'Printer not connected');
    }
  }

  function apiGetLastIdTrxHeader() {
    return runSqlQuery(db.database, QUERY_TRX_HEADER.GET_LAST_ID);
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
            param.push('E');
            param.push(transaction.historyCartListHeader.id);
            await apiUpdateTrxHeaderStatus(dispatch, param);
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

  function addDiscount(values) {
    setGrandTotal(
      parseInt(grandTotal) + parseInt(discountValue) - parseInt(values),
    );
    setDiscountModal(false);
    setDiscountValue(values);
  }

  function cancelDiscount() {
    setDiscountModal(false);
    // formik.resetForm()
  }

  function calculatePercentage(text) {
    if (text.length > 0) {
      let v = parseInt(text);
      let discount = (v / 100) * (grandTotal + discountValue);
      formik.setFieldValue('discount', discount.toString());
    } else {
      formik.setFieldValue('discount', '');
    }

    setPercentageValue(text);
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
        <Header drawerBtn syncBtn name="Transaction" />
      )}
      <View style={_s.menuBarContainer}>
        <View style={_style.flex1}>
          <TextInput
            style={_style.searchField}
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
      <View style={_style.flexRow}>
        <View style={[_style.flex1, _style.tableSeparator]}>
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
        <View style={[_style.flex2, _style.tableSeparator]}>
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
        <View style={_style.flex2}>
          <FlatList
            ListHeaderComponent={cartListHeaderRender}
            showsVerticalScrollIndicator={false}
            renderItem={dataRenderCartList}
            data={cartList}
            extraData={cartUpdateIndex}
            keyExtractor={(item, index) => index}
            stickyHeaderIndices={[0]}
          />
          <View style={_s.totalHeaderBorder}>
            <View style={_style.flex1}>
              <Text style={_style.totalHeaderText}>Discount</Text>
            </View>
            <TouchableOpacity
              onPress={() => setDiscountModal(true)}
              disabled={cartList.length == 0 ? true : false}>
              <Text style={_style.totalHeaderText}>
                {discountValue == 0
                  ? 'Add Discount'
                  : stringToCurrency(discountValue)}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={_style.totalHeaderContainer}>
            <View style={_style.flex1}>
              <Text style={[_style.totalHeaderText, {fontSize: 20}]}>
                Total
              </Text>
            </View>
            <View>
              <Text style={[_style.totalHeaderText, {fontSize: 20}]}>
                {stringToCurrency(grandTotal)}
              </Text>
            </View>
          </View>
          {cartList.length > 0 && (
            <View style={_style.rowDirection}>
              <View style={[_style.flex1, _style.tableSeparator]}>
                <Button
                  btnText="Bayar & Print"
                  onPress={() => showAlertBayarAndSimpan('BAYAR')}
                />
              </View>
              <View style={_style.flex1}>
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
        style={_style.margin0}
        onBackdropPress={cancelDiscount}
        onBackButtonPress={cancelDiscount}>
        <View style={[_style.flex1, _style.bgWhite]}>
          <View style={[_style.rowDirectionCenter, _style.px15, _style.pt15]}>
            <TouchableOpacity onPress={cancelDiscount}>
              <AntDesignIcon
                name="close"
                size={25}
                color="black"
                style={_style.mr5}
              />
            </TouchableOpacity>
            <View style={_style.flex1}>
              <Text style={_style.modalHeader}>Add Discount</Text>
            </View>
          </View>
          <View style={[_style.flex1, _style.mt15]}>
            <ScrollView>
              {formList.map((item, index) => (
                <View style={_style.fieldContainer} key={index}>
                  <Text style={_style.fieldHeaderText}>{item.value}</Text>
                  <View style={_style.mx10}>
                    <TextInputMask
                      style={_style.fieldText}
                      key={index}
                      type={'money'}
                      options={{
                        precision: 0,
                        separator: '.',
                        delimiter: ',',
                        unit: '',
                        suffixUnit: '',
                      }}
                      onChangeText={e => {
                        formik.setFieldValue(item.key, e);
                        setPercentageValue('');
                      }}
                      onBlur={formik.handleBlur(item.key)}
                      value={formik.values[item.key]}
                    />
                    {formik.errors[item.key] && formik.touched[item.key] ? (
                      <ErrorText text={formik.errors[item.key]} />
                    ) : null}
                  </View>
                </View>
              ))}
              <View style={_style.fieldContainer}>
                <Text style={_style.fieldHeaderText}>Percentage</Text>
                <View style={_style.mx10}>
                  <TextInput
                    keyboardType="number-pad"
                    style={_style.fieldText}
                    value={percentageValue}
                    onChangeText={text => calculatePercentage(text)}
                  />
                </View>
              </View>
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
  totalHeaderBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderTopColor: '#eee',
    borderTopWidth: 3,
    paddingTop: 10,
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
  hapusSemuaText: {
    color: '#5395B5',
    ..._style.listItemHeaderText,
  },
});

export default Transaction;
