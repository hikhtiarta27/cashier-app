import { StyleSheet } from 'react-native'
import Typrograhpy from './Typrograhpy'

const _style = StyleSheet.create({
  ...Typrograhpy,
  margin0:{
    margin: 0,
  },
  mt10:{
    marginTop: 10,
  },
  mt15:{
    marginTop: 15,
  },
  mb10:{
    marginBottom: 10,
  },
  ml10:{
    marginLeft: 10,
  },
  mr10:{
    marginRight: 10,
  },
  mr15:{
    marginRight: 15,
  },
  mx10:{
    marginHorizontal: 10,
  },
  my10:{
    marginVertical: 10,
  },
  pt15:{
    paddingTop: 15,
  },
  px10:{
    paddingHorizontal: 10,
  },
  px15:{
    paddingHorizontal: 15,
  },
  px20:{
    paddingHorizontal: 20,
  },
  py5:{
    paddingVertical: 5,
  }, 
  py10:{
    paddingVertical: 10,
  }, 
  py15:{
    paddingVertical: 15,
  },  

  bgWhite:{
    backgroundColor: "white"
  },

  flex1:{
    flex: 1
  },  
  flex2:{
    flex: 2
  },  
  flexRow: {
    flex: 1,
    flexDirection: 'row'
  },
  flexRowCenter:{
    flex: 1,
    flexDirection: 'row',
    alignItems: "center"
  },
  flexEnd:{
    flex: 1,
    alignItems: 'flex-end'
  },
  rowDirection:{
    flexDirection: 'row',
  },
  rowDirectionCenter:{
    flexDirection: 'row',
    alignItems: 'center'
  },
  tableSeparator:{
    borderRightColor: '#eee', borderRightWidth: 3
  },
  tableSeparatorTop:{
    borderTopColor: '#eee', borderTopWidth: 3, paddingTop: 10
  },
  headerTable: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#274472',
  }, 
  headerTableText: {
    ...Typrograhpy.listItemHeaderText,
    color: 'white',
  },
  rowTable: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  rowTableText: {
    ...Typrograhpy.bodyText,
  },
  searchField: {
    marginVertical: 0,
    paddingVertical: 0,
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
    ...Typrograhpy.bodyText,
    textTransform: 'capitalize',
  },
  filterHeader: {
    ...Typrograhpy.listItemHeaderText,
    textTransform: 'capitalize',
    marginTop: 25,
  },
  modalHeader:{
    ...Typrograhpy.listItemHeaderText,
    fontSize: 20,
    marginLeft: 8,
  },
  fieldContainer: {
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  fieldHeaderText: {
    ...Typrograhpy.bodyText,
    paddingHorizontal: 10,
    color: '#888',
  },
  fieldText: {
    ...Typrograhpy.listItemHeaderText,
    paddingHorizontal: 0,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    fontSize: 16,
  },
  historyDetailContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#41729F',
  },
  historyDetailText: {
    color: 'white',
    ...Typrograhpy.listItemHeaderText,
  },
  historyDetailChildContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  historyDetailChildText: {
    ...Typrograhpy.bodyText,
  },
  totalHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  totalHeaderText: {
    ...Typrograhpy.listItemHeaderText,
  },
  counterFilterContainer: {
    borderColor: '#41729F',
    borderWidth: 1,
    paddingHorizontal: 5,
    marginRight: 7,
    borderRadius: 15,
  },
  hint:{
    ...Typrograhpy.bodyText,
    marginTop: 10,
    paddingHorizontal: 10,
    color: '#888',
  },
  categoryDetailContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#41729F',
  },
  categoryDetailText: {
    color: 'white',
    ...Typrograhpy.listItemHeaderText,
  },
  categoryDetailChildContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  categoryDetailChildText: {
    ...Typrograhpy.bodyText,
  },
})

export default _style;