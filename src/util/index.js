import axios from 'axios';
import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';

export const stringToCurrency = x => {
  if (x == undefined) return;
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
/**
 *
 * @param {Date} x
 * @returns
 */
export const dateToFormat = x => {
  let day = x.getDate();
  let month = x.getMonth() + 1;
  day = day < 10 ? `0${day}` : day;
  month = month < 10 ? `0${month}` : month;
  let formatted = `${x.getFullYear()}-${month}-${day}`;
  return formatted;
};

/**
 *
 * @param {Date} x
 * @returns
 */
export const dateTimeToFormat = x => {
  let day = x.getDate();
  let month = x.getMonth() + 1;
  let hour = x.getHours();
  let minute = x.getMinutes();
  let second = x.getSeconds();
  day = day < 10 ? `0${day}` : day;
  month = month < 10 ? `0${month}` : month;
  hour = hour < 10 ? `0${hour}` : hour;
  minute = minute < 10 ? `0${minute}` : minute;
  second = second < 10 ? `0${second}` : second;

  let currentDateTimeFormatted = `${x.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`;
  return currentDateTimeFormatted;
};

/**
 *
 * @param {String} x
 * @returns
 */
export const currencyToInteger = x => {
  if (x.length == 0) return 0;
  return parseInt(x.replace(/[^\d]/g, ''));
};

function handleProgress(event) {
  console.log(Math.round(event.loaded * 100) / event.total);
}

export const apiRequest = (url, method, param, timeout = 3000, done) => {
  const xhr = new XMLHttpRequest();

  let headers = {
    'Content-Type': 'application/json',
  };

  let data = null;

  if (param.headers) {
    param.headers.forEach(x => {
      headers = {
        ...headers,
        [x.key]: x.value,
      };
    });
  }

  if (param.data) {
    data = JSON.stringify(param.data);
  }

  xhr.upload.addEventListener('progress', handleProgress);
  xhr.addEventListener('load', () => {
    done(xhr.response, null);
  });

  xhr.open(method, url);
  Object.keys(headers).map((value, index) => {
    xhr.setRequestHeader(value, headers[value]);
  });
  xhr.send(data);
};

export const apiRequestAxios = (url, method, param, timeout = 3000) => {
  let headers = {
    'Content-Type': 'application/json',
  };

  if (param.headers) {
    param.headers.forEach(x => {
      headers = {
        ...headers,
        [x.keyHeader]: x.valueHeader,
      };
    });
  }

  let config = {
    method: method,
    url,
    headers,
    timeout,
    data: param.data,
    params: param.params
  };

  axios.defaults.timeout = timeout;  
  return axios(config);
};

export const printInvoice = async (header, detail) =>{      
  await BluetoothEscposPrinter.printerAlign(
    BluetoothEscposPrinter.ALIGN.CENTER,
  );
  await BluetoothEscposPrinter.setBlob(0);
  await BluetoothEscposPrinter.printText(`${header.storeName}\n\r`, {
    encoding: 'GBK',
    codepage: 0,
    widthtimes: 1,
    heigthtimes: 1,
    fonttype: 0,
  });
  await BluetoothEscposPrinter.printText(`${header.date.toString()}\n\r\n\r`, {
    encoding: 'GBK',
    codepage: 0,
    widthtimes: 0,
    heigthtimes: 0,
    fonttype: 0,
  });
  await BluetoothEscposPrinter.setBlob(0);  
  let columnWidths = [15, 7, 10]; 
  for(let i=0; i<detail.length; i++){
    let name = detail[i].item_name != undefined ? detail[i].item_name : detail[i].name
    name = name.toString()
    let qty = detail[i].qty != undefined ? detail[i].qty : detail[i].quantity    
    let price = detail[i].priceNew != undefined ? detail[i].priceNew : detail[i].price    
    price = stringToCurrency(price * qty)
    qty = `x${stringToCurrency(qty)}`        

    await BluetoothEscposPrinter.printColumn(
      columnWidths,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,        
        BluetoothEscposPrinter.ALIGN.RIGHT,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      [
        name.toString(), 
        qty.toString(),                 
        price.toString(),        
      ],
      {},
    ); 
  }
  await BluetoothEscposPrinter.printText(
    '--------------------------------\n\r',
    {},
  );

  columnWidths = [20, 12]

  let headerList = [
    {
      key: "priceItem",
      value: "Sub Total"
    },
    {
      key: "discountItem",
      value: "Disc Item"
    },
    {
      key: "discount",
      value: "Discount"
    },
    {
      key: "grandTotal",
      value: "Total"
    },
  ]

  for(let i=0; i<headerList.length; i++){
    await BluetoothEscposPrinter.printColumn(
      columnWidths,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,              
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      [
        headerList[i].value, 
        stringToCurrency(header[headerList[i].key])       
      ],
      {},
    );
  }
  await BluetoothEscposPrinter.printText(
    '--------------------------------\n\r',
    {},
  );
  await BluetoothEscposPrinter.printerAlign(
    BluetoothEscposPrinter.ALIGN.CENTER,
  );
  await BluetoothEscposPrinter.printText('\n\r===TERIMA KASIH===\n\r\n\r\n\r\n\r', {}); 
}