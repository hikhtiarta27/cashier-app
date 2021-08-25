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
import {QUERY_ITEM, QUERY_CATEGORY} from '../../../config/StaticQuery';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import _style from '../../../styles/';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import {dateTimeToFormat, stringToCurrency} from '../../../util';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';
import { setCategoryItemFetch } from '../MasterAction';
import { apiBatchSql, apiDeleteItem, apiGetCategoryList, apiGetItemList, apiGetItemListByCategoryCode } from '../../../config/Api';

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

  function getCategoryItemFromDb(){
    dispatch(setCategoryItemFetch())
  }

  //api call only run once
  useEffect(() => {
    apiGetItemList(dispatch);    
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = apiGetItemList(dispatch);
      const unsubscribe1 = getCategoryItemFromDb();      
      return () => {
        unsubscribe,
        unsubscribe1
      };
    }, []),
  );

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
          apiGetCategoryList(dispatch);
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
                let today = dateTimeToFormat(new Date())
                await apiDeleteItem(dispatch);
                let listSql = []                
                for (let i = 1; i < dataParse.length; i++) {
                  let sql = `INSERT INTO master_item (code, category_code, name, price, discount, created_date) VALUES ('${dataParse[i][0].trim()}', '${dataParse[i][1].trim()}', '${dataParse[i][2].trim()}', ${dataParse[i][3]}, ${dataParse[i][4]}, '${today}')`
                  await listSql.push(sql)                  
                }  
                
                apiBatchSql(dispatch,listSql)
                                
                await apiGetItemList(dispatch);
                getCategoryItemFromDb()
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
          _style.rowTable,
          dataTableFocus == index ? {backgroundColor: '#eee'} : null,
        ]}
        onPress={() => {
          setItems(item);
          setDataTableFocus(index);
        }}
        underlayColor="#eee">
        <>
          {headerTable.map((v, i) => (
            <View key={i} style={_style.flex1}>
              <Text style={_style.rowTableText}>
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
      <View style={_style.headerTable}>
        {headerTable.map((item, index) => (
          <View key={index} style={_style.flex1}>
            <Text style={_style.headerTableText}>{item.value}</Text>
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
      apiGetItemListByCategoryCode(dispatch, param)
    }else{
      apiGetItemList(dispatch)
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
        style={_style.margin0}
        onBackdropPress={cancelFilter}
        onBackButtonPress={cancelFilter}>
        <View style={[_style.flex1, _style.bgWhite]}>
          <View
            style={[_style.rowDirectionCenter, _style.px15, _style.pt15]}>
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
          </View>
          <View style={[_style.flex1, _style.px15]}>
            <Text style={_style.filterHeader}>Kategori</Text>
            <View style={_style.mt10}>
              <TextInput
                style={[_style.searchField, {borderColor: "#eee", borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10}]}
                placeholder="Search by category code..."
                onChangeText={text => searchTextCategory(text)}
                defaultValue={filterCategoryText}
              />
            </View>
            <View>
              <ScrollView contentContainerStyle={[_style.rowDirection, _style.mt10]} horizontal showsHorizontalScrollIndicator={false}>
                {categoryList.length != 0 && categoryList.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      _style.filterBtn,
                      filterCategoryText == item.code
                        ? {borderColor: '#274472', borderWidth: 1}
                        : null,
                    ]}
                    activeOpacity={1} onPress={()=>setFilterCategoryText(item.code)}>
                    <View style={_style.rowDirectionCenter}>
                      <Text style={_style.filterText}> {item.code} - {item.name} </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>     
            </View>         
          </View>
          <View>
            <Button btnText="Simpan" onPress={handleFilter}/>
          </View>
        </View>
      </Modal>

      <Header drawerBtn={true} name="Master Items" />

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
        <View style={_style.flex1}>
          <TextInput
            style={_style.searchField}
            placeholder="Search by item name..."
            onChangeText={text => searchText(text)}
          />
        </View>
      </View>

      <View style={_style.flexRow}>
        <View style={[_style.flex2, _style.tableSeparator]}>
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
        <View style={_style.flex1}>
             <View style={_style.flex1}>
                <View style={_s.itemsDetailContainer}>
                  <Text style={_s.itemsDetailText}>Items Detail</Text>
                </View>
                {headerTable.map((item, index) => (
                  <View key={index} style={_s.itemsDetailChildContainer}>
                    <View style={_style.flex1}>
                      <Text
                        style={[
                          _s.itemsDetailChildText,
                          _style.listItemHeaderText,
                        ]}>
                        {item.value}
                      </Text>
                    </View>
                    {items != null &&
                    <View>
                      <Text style={_s.itemsDetailChildText}>
                        {item.key == 'discount' || item.key == 'price'
                          ? stringToCurrency(items[item.key])
                          : items[item.key]}
                      </Text>
                    </View> }
                  </View>
                ))}
              </View>
              {items != null && 
              <View>
                <Button
                  btnText="edit"
                  onPress={() => navigation.navigate('MasterItemEdit', items)}
                />
              </View>   }        
        </View>
      </View>
    </Container>
  );
}

const _s = StyleSheet.create({  
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
