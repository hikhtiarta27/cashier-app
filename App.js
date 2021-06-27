import 'react-native-gesture-handler';
import React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Store from './src/config/redux/Store';
import Drawer from './src/modules/drawer/view/Drawer';
import {NavigationContainer} from '@react-navigation/native';

const {persistor, store} = Store();

function App() {
  return (
    <NavigationContainer>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
        <Drawer />
        </PersistGate>
      </Provider>
    </NavigationContainer>
  );
}

export default App;
