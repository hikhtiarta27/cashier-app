import React, { useState } from 'react';
import {View, FlatList, Text, TouchableHighlight} from 'react-native';

function Table(props) {

  const [headerList, setHeaderList] = useState([])

  function dataRender({item, index}){
    return(
      <View></View>
    );
  }

  return (
    <View style={{flex: 1,}}>

      <FlatList
        {...props}
        showsVerticalScrollIndicator={false}
        renderItem={dataRender}
        // refreshing={refreshing}
        // onRefresh={apiGetCategoryList}
        // data={categoryList}
        // extraData={categoryList}      
        // keyExtractor={item => item.code}      
      />
    </View>
  );
}

export default Table;
