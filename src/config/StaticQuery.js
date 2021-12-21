export const QUERY_CATEGORY = {
  CREATE_TABLE:
    'CREATE TABLE IF NOT EXISTS master_category (' +
    'code TEXT PRIMARY KEY, ' +
    'name TEXT NOT NULL, ' +
    'created_date DATETIME NOT NULL' +
    ')',
  INSERT:
    'INSERT INTO master_category (code, name, created_date) VALUES (?, ?, ?)',
  SELECT: 'SELECT * FROM master_category ORDER BY name ASC',
  SELECT_BY_CODE: 'SELECT * FROM master_category WHERE code = ?',
  SELECT_CATEGORY_ITEM:
    'SELECT master_category.*, master_item.* from master_category LEFT JOIN master_item ON master_item.category_code = master_category.code GROUP BY master_category.code ORDER BY master_category.code ASC',
  DELETE: 'DELETE FROM master_category',
  UPDATE: 'UPDATE master_category SET name = ? WHERE code = ?',
};

export const QUERY_ITEM = {
  CREATE_TABLE:
    'CREATE TABLE IF NOT EXISTS master_item (' +
    'code TEXT PRIMARY KEY, ' +
    'category_code TEXT NOT NULL, ' +
    'name TEXT NOT NULL, ' +
    'price INTEGER NOT NULL, ' +
    'discount INTEGER NOT NULL, ' +
    'created_date DATETIME NOT NULL, ' +
    'FOREIGN KEY (category_code) REFERENCES master_category (code)' +
    ')',
  INSERT:
    'INSERT INTO master_item (code, category_code, name, price, discount, created_date) VALUES (?, ?, ?, ?, ?, ?)',
  SELECT: 'SELECT * FROM master_item ORDER BY code',
  SELECT_BY_CODE: 'SELECT * FROM master_item where code = ?',
  SELECT_BY_CATEGORY_CODE:
    'SELECT * FROM master_item where category_code = ? ORDER BY name',
  DELETE: 'DELETE FROM master_item',
  UPDATE:
    'UPDATE master_item SET category_code = ?, name = ?, price = ?, discount = ? WHERE code = ?',
};

export const QUERY_STORE = {
  CREATE_TABLE:
    'CREATE TABLE IF NOT EXISTS master_store (' +
    'id TEXT PRIMARY KEY, ' +
    'name TEXT NOT NULL, ' +
    'password TEXT, ' +
    'api_url TEXT' +
    ')',
  INSERT:
    'INSERT INTO master_store (id, name, password, api_url) VALUES (?, ?, ?, ?)',
  SELECT: 'SELECT * FROM master_store',
  DELETE: 'DELETE FROM master_store',
};

export const QUERY_TRX_HEADER = {
  CREATE_TABLE:
    'CREATE TABLE IF NOT EXISTS trx_header (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'date DATETIME NOT NULL, ' +
    'discount INTEGER NOT NULL, ' +
    'grand_total INTEGER NOT NULL, ' +
    'status TEXT NOT NULL, ' +
    'ref_void_id INTEGER, ' +
    'created_date DATETIME NOT NULL, ' +
    'store_id TEXT NOT NULL, ' +
    'store_name TEXT NOT NULL, ' +
    'flag TEXT NOT NULL, ' +
    'ojol INTEGER NOT NULL ' +
    ')',
  INSERT:
    'INSERT INTO trx_header (date, discount, grand_total, status, created_date, store_id, store_name, flag, ojol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  INSERT_VOID:
    'INSERT INTO trx_header (date, discount, grand_total, status, ref_void_id, created_date, store_id, store_name, flag, ojol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  // SELECT: "SELECT trx_header.*, COUNT( CASE WHEN trx_detail.flag != 'D' THEN 1 ELSE NULL END) total_item FROM trx_header LEFT JOIN trx_detail ON trx_detail.trx_header_id=trx_header.id WHERE trx_header.status LIKE ? GROUP BY trx_header.id ORDER BY trx_header.created_date DESC",
  SELECT_BY_DATE:
    "SELECT trx_header.*, COUNT( CASE WHEN trx_detail.flag != 'D' THEN 1 ELSE NULL END) total_item FROM trx_header LEFT JOIN trx_detail ON trx_detail.trx_header_id=trx_header.id where DATE(trx_header.date) = ? AND trx_header.status LIKE ? AND trx_header.ojol LIKE ?  GROUP BY trx_header.id ORDER BY trx_header.date DESC",
  SELECT_BY_DATE_BETWEEN:
    "SELECT trx_header.*, COUNT( CASE WHEN trx_detail.flag != 'D' THEN 1 ELSE NULL END) total_item FROM trx_header LEFT JOIN trx_detail ON trx_detail.trx_header_id=trx_header.id where DATE(trx_header.date) > ? AND DATE(trx_header.date) < ? AND trx_header.status LIKE ? AND trx_header.ojol LIKE ? GROUP BY trx_header.id ORDER BY trx_header.date DESC",
  // SELECT_BY_ID: 'SELECT * FROM trx_header where id = ?',
  // DELETE: 'DELETE FROM trx_header WHERE id = ?',
  UPDATE:
    'UPDATE trx_header SET date = ?, discount = ?, grand_total = ?, status = ?, flag = ?, ojol = ? WHERE id = ?',
  GET_LAST_ID: 'SELECT * from trx_header ORDER BY id DESC limit 1',
  // TRUNCATE: 'DELETE FROM trx_header',
  UPDATE_STATUS: 'UPDATE trx_header SET status = ?, flag = ? WHERE id = ?',
  SELECT_ALL: 'SELECT * FROM trx_header',
  SELECT_ALL_FLAG_NOT_Y: "SELECT * FROM trx_header where flag != 'Y'",
  UPDATE_FLAG_Y_ALL: "UPDATE trx_header SET flag = 'Y'",
};

export const QUERY_TRX_DETAIL = {
  CREATE_TABLE:
    'CREATE TABLE IF NOT EXISTS trx_detail (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'trx_header_id INTEGER NOT NULL, ' +
    'item_code TEXT NOT NULL, ' +
    'item_name TEXT NOT NULL, ' +
    'price INTEGER NOT NULL, ' +
    'discount INTEGER NOT NULL, ' +
    'quantity INTEGER NOT NULL, ' +
    'total INTEGER NOT NULL, ' +
    'created_date DATETIME NOT NULL, ' +
    'store_id TEXT NOT NULL, ' +
    'store_name TEXT NOT NULL, ' +
    'flag TEXT NOT NULL, ' +
    'FOREIGN KEY (trx_header_id) REFERENCES trx_header (id)' +
    ')',
  INSERT:
    'INSERT INTO trx_detail (trx_header_id, item_code, item_name, price, discount, quantity, total, created_date, store_id, store_name, flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  SELECT_ALL: 'SELECT * FROM trx_detail',
  SELECT_ALL_FLAG_NOT_Y: "SELECT * FROM trx_detail WHERE flag != 'Y'",
  // SELECT_BY_ID: 'SELECT * FROM trx_detail where id = ?',
  SELECT_BY_TRX_HEADER_ID:
    "SELECT * FROM trx_detail where trx_header_id = ? AND flag !=  'D'",
  // DELETE: 'DELETE FROM trx_detail WHERE id = ?',
  // UPDATE: 'UPDATE trx_detail SET item_code = ?, item_name = ?, price = ?, discount = ?, quantity = ?, total = ? WHERE id = ?',
  // TRUNCATE: 'DELETE FROM trx_detail',
  DELETE_BY_TRX_HEADER_ID:
    "UPDATE trx_detail set flag = 'D' where trx_header_id = ?",
  SELECT_TOTAL_ITEMS_BY_TRX_HEADER_ID:
    "SELECT COUNT(id) as total_item from trx_detail where trx_header_id = ? and flag != 'D'",
  UPDATE_FLAG_Y_ALL: "UPDATE trx_detail SET flag = 'Y' where flag != 'D'",
};
