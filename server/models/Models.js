const mongoose = require('mongoose');

// Schemas
const AdminSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
  },
  { versionKey: false }
);

const CategorySchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
  },
  { versionKey: false }
);

const CustomerSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    name: String,
    phone: String,
    email: String,
    active: Number,
    token: String,
  },
  { versionKey: false }
);

const ProductSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    image: String,
    description: String,
    cdate: Number,
    category: CategorySchema,
  },
  { versionKey: false }
);

const ItemSchema = mongoose.Schema(
  {
    product: ProductSchema,
    quantity: Number,
  },
  {
    versionKey: false,
    _id: false,
  }
);

const OrderSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    cdate: Number,
    total: Number,
    status: String,
    customer: CustomerSchema,
    items: [ItemSchema],
  },
  { versionKey: false }
);

const SettingSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    key: String,
    mime: String,
    data: String,
    updatedAt: Number,
  },
  { versionKey: false }
);

const SlideSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    subtitle: String,
    href: String,
    imageMime: String,
    imageData: String,
    active: Number,
    sort: Number,
    updatedAt: Number,
  },
  { versionKey: false }
);

const ReviewSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    productId: String,
    productName: String,
    author: String,
    stars: Number,
    content: String,
    active: Number,
    cdate: Number,
    updatedAt: Number,
  },
  { versionKey: false }
);

// Models
const Admin = mongoose.model('Admin', AdminSchema);
const Category = mongoose.model('Category', CategorySchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const Setting = mongoose.model('Setting', SettingSchema);
const Slide = mongoose.model('Slide', SlideSchema);
const Review = mongoose.model('Review', ReviewSchema);

module.exports = {
  Admin,
  Category,
  Customer,
  Product,
  Order,
  Setting,
  Slide,
  Review,
};


 