const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const bookTypes = [
  { id: 1, typeName: '小说' },
  { id: 2, typeName: '文学' },
  { id: 3, typeName: '科技' },
  { id: 4, typeName: '教育' },
  { id: 5, typeName: '计算机' }
];

let books = [
  { bookId: 1, bookCode: 'B001', bookName: 'JavaScript高级编程', bookType: 5, bookAuthor: 'Nicholas C. Zakas', publishPress: '人民邮电出版社', publishDate: '2020-03-15', borrowed: 0, createdBy: 'admin', creationTime: '2026-10-01 10:00:00', lastUpdatetime: '2026-10-01 10:00:00' },
  { bookId: 2, bookCode: 'B002', bookName: '红楼梦', bookType: 1, bookAuthor: '曹雪芹', publishPress: '人民文学出版社', publishDate: '1996-12-01', borrowed: 1, createdBy: 'admin', creationTime: '2026-10-02 14:30:00', lastUpdatetime: '2026-10-02 14:30:00' },
  { bookId: 3, bookCode: 'B003', bookName: '百年孤独', bookType: 1, bookAuthor: '马尔克斯', publishPress: '南海出版公司', publishDate: '2011-06-01', borrowed: 0, createdBy: 'admin', creationTime: '2026-10-03 09:15:00', lastUpdatetime: '2026-10-03 09:15:00' },
  { bookId: 4, bookCode: 'B004', bookName: '数据结构与算法', bookType: 5, bookAuthor: '严蔚敏', publishPress: '清华大学出版社', publishDate: '2018-08-20', borrowed: 1, createdBy: 'admin', creationTime: '2026-10-04 16:45:00', lastUpdatetime: '2026-10-04 16:45:00' },
  { bookId: 5, bookCode: 'B005', bookName: '三体', bookType: 1, bookAuthor: '刘慈欣', publishPress: '重庆出版社', publishDate: '2008-01-01', borrowed: 0, createdBy: 'admin', creationTime: '2026-10-05 11:20:00', lastUpdatetime: '2026-10-05 11:20:00' },
  { bookId: 6, bookCode: 'B006', bookName: '活着', bookType: 2, bookAuthor: '余华', publishPress: '作家出版社', publishDate: '2012-08-01', borrowed: 0, createdBy: 'admin', creationTime: '2026-10-06 08:00:00', lastUpdatetime: '2026-10-06 08:00:00' },
  { bookId: 7, bookCode: 'B007', bookName: 'Python编程从入门到实践', bookType: 5, bookAuthor: 'Eric Matthes', publishPress: '人民邮电出版社', publishDate: '2020-10-01', borrowed: 1, createdBy: 'admin', creationTime: '2026-10-07 13:30:00', lastUpdatetime: '2026-10-07 13:30:00' }
];

let nextId = 8;

function getTypeName(typeId) {
  const type = bookTypes.find(t => t.id === typeId);
  return type ? type.typeName : '未知';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}

app.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;
  const keyword = req.query.keyword || '';

  let filtered = [...books];
  if (keyword) {
    filtered = filtered.filter(b => b.bookName.includes(keyword));
  }

  filtered.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  res.render('list', {
    books: pageData,
    currentPage: page,
    totalPages: totalPages,
    keyword: keyword,
    bookTypes: bookTypes,
    success: req.query.success,
    getTypeName,
    formatDate
  });
});

app.get('/search', (req, res) => {
  const keyword = req.query.keyword || '';
  const typeFilter = req.query.bookType || '';

  let filtered = [...books];
  if (keyword) {
    filtered = filtered.filter(b => b.bookName.includes(keyword));
  }
  if (typeFilter) {
    filtered = filtered.filter(b => b.bookType === parseInt(typeFilter));
  }

  filtered.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));

  res.render('list', {
    books: filtered,
    currentPage: 1,
    totalPages: 1,
    keyword: keyword,
    bookType: typeFilter,
    bookTypes: bookTypes,
    success: null,
    getTypeName,
    formatDate
  });
});

app.get('/book/add', (req, res) => {
  res.render('add', { bookTypes, defaultTime: getCurrentTime(), error: null });
});

app.post('/book/add', (req, res) => {
  const { bookCode, bookName, bookType, bookAuthor, publishPress, publishDate, borrowed } = req.body;

  if (!bookCode || !bookName || !bookType || !bookAuthor || !publishPress || !publishDate) {
    return res.render('add', { bookTypes, defaultTime: getCurrentTime(), error: '所有必填字段不能为空' });
  }

  const timeStr = getCurrentTime();
  books.push({
    bookId: nextId++,
    bookCode, bookName,
    bookType: parseInt(bookType),
    bookAuthor, publishPress, publishDate,
    borrowed: parseInt(borrowed) || 0,
    createdBy: 'admin',
    creationTime: timeStr,
    lastUpdatetime: timeStr
  });
  res.redirect('/?success=add');
});

app.get('/book/:id', (req, res) => {
  const book = books.find(b => b.bookId === parseInt(req.params.id));
  if (!book) return res.send('图书不存在');
  res.render('detail', { book, getTypeName, formatDate });
});

app.get('/book/edit/:id', (req, res) => {
  const book = books.find(b => b.bookId === parseInt(req.params.id));
  if (!book) return res.send('图书不存在');
  res.render('edit', { book, bookTypes, error: null, formatDate });
});

app.post('/book/edit/:id', (req, res) => {
  const book = books.find(b => b.bookId === parseInt(req.params.id));
  if (!book) return res.send('图书不存在');

  const { bookCode, bookName, bookType, bookAuthor, publishPress, publishDate, borrowed } = req.body;

  if (!bookCode || !bookName || !bookType || !bookAuthor || !publishPress || !publishDate) {
    return res.render('edit', { book, bookTypes, error: '所有必填字段不能为空', formatDate });
  }

  book.bookCode = bookCode;
  book.bookName = bookName;
  book.bookType = parseInt(bookType);
  book.bookAuthor = bookAuthor;
  book.publishPress = publishPress;
  book.publishDate = publishDate;
  book.borrowed = parseInt(borrowed) || 0;
  book.lastUpdatetime = getCurrentTime();

  res.redirect('/?success=edit');
});

app.get('/book/delete/:id', (req, res) => {
  const book = books.find(b => b.bookId === parseInt(req.params.id));
  if (!book) return res.send('图书不存在');
  res.render('delete', { book, getTypeName, formatDate });
});

app.post('/book/delete/:id', (req, res) => {
  const index = books.findIndex(b => b.bookId === parseInt(req.params.id));
  if (index === -1) return res.send('图书不存在');
  books.splice(index, 1);
  res.redirect('/?success=delete');
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
