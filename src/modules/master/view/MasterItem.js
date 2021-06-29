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
  TextInput
} from 'react-native';
import {writeFile, readFile} from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';
import XLSX from 'xlsx';
import {queryFetch} from '../../database/DBAction';
import {QUERY_ITEM, QUERY_CATEGORY} from '../../../config/StaticQuery';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import _style from '../../../styles/Typrograhpy';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import {stringToCurrency} from '../../../util';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';

function MasterItem() {
  const query = useSelector(state => state.query);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [itemsList, setItemsList] = useState([]);
  const [items, setItems] = useState({});
  const [dataTableFocus, setDataTableFocus] = useState(0);
  const [counterFilter,setCounterFilter] = useState(0)

  const [filterVisible, setFilterVisible] = useState(false);
  const [filterCategoryModalFocus, setFilterCategoryModalFocus] = useState(0);
  const [categoryList, setCategoryList] = useState([]);
  const [categoryListBackup, setCategoryListBackup] = useState([]);
  const [itemsListBackup, setItemListBackup] = useState([]);
  const [filterCategoryText, setFilterCategoryText] = useState("")

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

  function apiGetCategoryList() {
    dispatch(
      queryFetch({
        sql: QUERY_CATEGORY.SELECT,
      }),
    );
  }


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

  function apiGetItemListByCategoryCode(param) {
    dispatch(
      queryFetch({
        sql: QUERY_ITEM.SELECT_BY_CATEGORY_CODE,
        param: param,
      }),
    );
  }

  //api call only run once
  useEffect(() => {
    apiGetItemsList();    
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     const unsubscribe = apiGetItemsList();      
  //     return () => unsubscribe;
  //   }, []),
  // );

  //get updated data
  useEffect(() => {
    if (!query.fetchQuery) {
      if (query.send.sql == QUERY_ITEM.SELECT || query.send.sql == QUERY_ITEM.SELECT_BY_CATEGORY_CODE) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            resultList.push(rows.item(i));
          }
          setItems(resultList[0]);
          setItemsList(resultList);
          setItemListBackup(resultList);
          setDataTableFocus(0);
          apiGetCategoryList();
        } else {
          setItems(null);
          setItemsList([]);
          setItemListBackup([]);
        }
      }

      if (query.send.sql == QUERY_CATEGORY.SELECT) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            resultList.push(rows.item(i));
          }                            
          setCategoryList(resultList);          
          setCategoryListBackup(resultList);          
        } else {          
          setCategoryList([]);
          setCategoryListBackup([]);

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

  async function handleFilter(){       
    if(filterCategoryText != "") setCounterFilter(1)
    else setCounterFilter(0)
    
    if(filterCategoryText != ""){
      let param = []
      param.push(filterCategoryText)
      apiGetItemListByCategoryCode(param)
    }else{
      apiGetItemsList()
    }

    setFilterVisible(!filterVisible)
  }

  function cancelFilter(){    
    setFilterVisible(!filterVisible)
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
    setItems(itemsList[dataTableFocus])
  }
  
  function searchTextCategory(text) {    
    let newArray = [];
    for (let i = 0; i < categoryListBackup.length; i++) {
      let tmp = categoryListBackup[i].code.toLowerCase();
      text = text.toLowerCase();
      if (tmp.indexOf(text) != -1) {        
        newArray.push(categoryListBackup[i]);
      }
    }      
    if(text.length == 0) setFilterCategoryText("")  
    setCategoryList(newArray);
  }

  return (
    <Container>
      <Modal
        isVisible={filterVisible}
        style={{margin: 1}}
        onBackdropPress={cancelFilter}
        onBackButtonPress={cancelFilter}>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 15,
              paddingTop: 15,
            }}>
            <TouchableOpacity onPress={cancelFilter}>
              <AntDesignIcon
                name="close"
                size={25}
                color="black"
                style={{marginRight: 5}}
              />
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <Text style={_s.modalHeader}>Filter</Text>
            </View>
            {/* {(isDateFilter || filterStatusFocus || filterItemFocus != 0) && <TouchableOpacity onPress={()=>{
              setIsDateFilter(false)
              setFilterCategoryModalFocus(0)
              // setFilterStatusFocusPrev(filterStatusFocus)
              setFilterStatusFocus(0)              
            }}>
              <Text style={[_s.modalHeader, {color: "#68BBE3"}]}>Reset</Text>
            </TouchableOpacity> } */}
          </View>
          <View style={{flex: 1, paddingHorizontal: 15}}>
            <Text style={_s.filterHeader}>Kategori</Text>
            <View style={{marginTop: 10}}>
              <TextInput
                style={[_s.searchField, {borderColor: "#eee", borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10}]}
                placeholder="Search by category code..."
                onChangeText={text => searchTextCategory(text)}
                defaultValue={filterCategoryText}
              />
            </View>
            <View style={{flexDirection: 'row', marginTop: 10}}>              
              {categoryList.length != 0 && categoryList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    _s.filterBtn,
                    filterCategoryText == item.code
                      ? {borderColor: '#274472', borderWidth: 1}
                      : null,
                  ]}
                  activeOpacity={1} onPress={()=>setFilterCategoryText(item.code)}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={_s.filterText}> {item.code} - {item.name} </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {/* <Text style={_s.filterHeader}>Status</Text>
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
            </View>             */}
          </View>
          <View>
            <Button btnText="Simpan" onPress={handleFilter}/>
          </View>
        </View>
      </Modal>

      <Header drawerBtn={true} name="Master Items" />

      <View style={_s.filterContainer}>
        <TouchableOpacity
          style={_s.filterBtn}
          activeOpacity={1}
          onPress={() => setFilterVisible(!filterVisible)}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {counterFilter != 0 ? (
              <View style={_s.counterFilterContainer}>
                <Text>{counterFilter}</Text>
              </View>
            ) : (
              <AntDesignIcon
                name="filter"
                size={20}
                color="black"
                style={{marginRight: 5}}
              />
            )}
            <Text style={_s.filterText}>Filter </Text>
          </View>
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <TextInput
            style={_s.searchField}
            placeholder="Search by item name..."
            onChangeText={text => searchText(text)}
          />
        </View>
      </View>

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
  filterContainer: {
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center'
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
  modalHeader: {
    ..._style.listItemHeaderText,
    fontSize: 20,
    marginLeft: 8,
  },
  counterFilterContainer: {
    borderColor: '#41729F',
    borderWidth: 1,
    paddingHorizontal: 5,
    marginRight: 7,
    borderRadius: 15,
  },
  searchField: {
    marginVertical: 0,
    paddingVertical: 0,
  },
});

export default MasterItem;
