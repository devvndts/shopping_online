require('./loadEnv');
require('./utils/MongooseUtil');
const scheduleSlugBackfills = require('./bootstrap/slugBackfill');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
scheduleSlugBackfills();
const PORT = process.env.PORT || 3000;

// Base64 lớn (slide/settings) + ảnh sản phẩm từ admin trước khi upload Firebase.
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '25mb' }));

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from server!' });
});
app.use('/api/admin', require('./api/admin.js'));
app.use('/api/customer', require('./api/customer.js'));
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
