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
import {writeFile, readFile} from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';
import XLSX from 'xlsx';
import {queryFetch} from '../../database/DBAction';
import {QUERY_ITEM} from '../../../config/StaticQuery';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import _style from '../../../styles/Typrograhpy';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import {stringToCurrency} from '../../../util';

function MasterItem() {
  const query = useSelector(state => state.query);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [itemsList, setItemsList] = useState([]);
  const [items, setItems] = useState({});
  const [dataTableFocus, setDataTableFocus] = useState(0);

  const headerTable = [
    {
      key: 'code',
      value: 'Code',
    },
    {
      key: 'category_code',
      value: 'Category',
    },
    {
      key: 'name',
      value: 'Name',
    },
    {
      key: 'price',
      value: 'Price',
    },
    {
      key: 'discount',
      value: 'Discount',
    },
    {
      key: 'created_date',
      value: 'Created Date',
    },
  ];

  function apiGetItemsList() {
    dispatch(
      queryFetch({
        sql: QUERY_ITEM.SELECT,
      }),
    );
  }

  function apiDeleteItemsList() {
    dispatch(
      queryFetch({
        sql: QUERY_ITEM.DELETE,
      }),
    );
  }

  function apiInsertItemsList(param) {
    dispatch(
      queryFetch({
        sql: QUERY_ITEM.INSERT,
        param: param,
      }),
    );
  }

  //api call only run once
  useEffect(() => {
    apiGetItemsList();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = apiGetItemsList();
      return () => unsubscribe;
    }, []),
  );

  //get updated data
  useEffect(() => {
    if (!query.fetchQuery) {
      if (query.send.sql == QUERY_ITEM.SELECT) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            resultList.push(rows.item(i));
          }
          setItems(resultList[0]);
          setItemsList(resultList);
          setDataTableFocus(0);
        } else {
          setItems(null);
          setItemsList([]);
        }
      }
    }
  }, [query]);

  async function importData() {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.xls, DocumentPicker.types.xlsx],
      });

      readFile(res.uri, 'ascii').then(res => {
        const workbook = XLSX.read(res, {type: 'binary'});
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        let dataParse = XLSX.utils.sheet_to_json(ws, {header: 1});

        Alert.alert(
          'Confirmation',
          'Are you sure to import all the data?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: async () => {
                await apiDeleteItemsList();
                for (let i = 1; i < dataParse.length; i++) {
                  await apiInsertItemsList(dataParse[i]);
                }
                await apiGetItemsList();
                Alert.alert(
                  'Information',
                  'Master Item successfully imported!',
                  [
                    {
                      text: 'Ok',
                      style: 'default',
                    },
                  ],
                );
              },
              style: 'default',
            },
          ],
          {
            cancelable: false,
          },
        );
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
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
          setItems(item);
          setDataTableFocus(index);
        }}
        underlayColor="#eee">
        <>
          {headerTable.map((v, i) => (
            <View key={i} style={{flex: 1}}>
              <Text style={_s.listText}>
                {v.key == 'discount' || v.key == 'price'
                  ? stringToCurrency(item[v.key])
                  : item[v.key]}
              </Text>
            </View>
          ))}
        </>
      </TouchableHighlight>
    );
  }

  function itemsHeaderRender() {
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

  return (
    <Container>
      <Header drawerBtn={true} name="Master Items" />
      <View style={_s.flexRow}>
        <View style={{flex: 2, borderRightColor: '#eee', borderRightWidth: 3}}>
          <FlatList
            ListHeaderComponent={itemsHeaderRender}
            showsVerticalScrollIndicator={false}
            renderItem={dataRender}
            data={itemsList}
            extraData={itemsList}
            keyExtractor={item => item.code}
            stickyHeaderIndices={[0]}
          />
          <Button btnText="Import" onPress={importData} />
        </View>
        <View style={{flex: 1}}>
          {items != null ? (
            <>
              <View style={{flex: 1}}>
                <View style={_s.itemsDetailContainer}>
                  <Text style={_s.itemsDetailText}>Items Detail</Text>
                </View>
                {headerTable.map((item, index) => (
                  <View key={index} style={_s.itemsDetailChildContainer}>
                    <View style={{flex: 1}}>
                      <Text
                        style={[
                          _s.itemsDetailChildText,
                          _style.listItemHeaderText,
                        ]}>
                        {item.value}
                      </Text>
                    </View>
                    <View>
                      <Text style={_s.itemsDetailChildText}>
                        {item.key == 'discount' || item.key == 'price'
                          ? stringToCurrency(items[item.key])
                          : items[item.key]}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View>
                <Button
                  btnText="edit"
                  onPress={() => navigation.navigate('MasterItemEdit', items)}
                />
              </View>
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
    paddingRight: 10,
  },
  itemsDetailContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#41729F',
  },
  itemsDetailText: {
    color: 'white',
    ..._style.listItemHeaderText,
  },
  itemsDetailChildContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  itemsDetailChildText: {
    ..._style.bodyText,
  },
});

export default MasterItem;
