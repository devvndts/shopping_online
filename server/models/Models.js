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
    slug: { type: String, index: true, unique: true, sparse: true },
  },
  { versionKey: false }
);

/** Nhúng trong Product: slug KHÔNG unique (nhiều SP cùng danh mục). */
const ProductCategoryEmbedSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    slug: String,
  },
  { versionKey: false }
);

const BrandSchema = mongoose.Schema(
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
    otpHash: String,
    otpExpires: Number,
    otpLastSentAt: Number,
  },
  { versionKey: false }
);

const ProductSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    brand: String,
    slug: { type: String, index: true, unique: true, sparse: true },
    price: Number,
    image: String,
    /** Ảnh thêm (URL); ảnh bìa vẫn dùng `image` */
    gallery: { type: [String], default: [] },
    description: String,
    cdate: Number,
    category: ProductCategoryEmbedSchema,
  },
  { versionKey: false }
);

/**
 * Snapshot sản phẩm trong đơn hàng.
 * Không dùng ProductSchema để tránh kéo theo unique index (vd slug) vào Order collection.
 */
const OrderProductSnapshotSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    brand: String,
    slug: { type: String, index: true }, // không unique
    price: Number,
    image: String,
    gallery: { type: [String], default: [] },
    description: String,
    cdate: Number,
    category: ProductCategoryEmbedSchema,
  },
  { versionKey: false, _id: false }
);

const ItemSchema = mongoose.Schema(
  {
    product: OrderProductSnapshotSchema,
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
    subtotal: Number,
    discount: Number,
    total: Number,
    promoCode: String,
    promoSnapshot: Object,
    shippingAddress: String,
    paymentMethod: String, // COD | BANK
    paymentNote: String,
    status: String,
    customer: CustomerSchema,
    items: [ItemSchema],
  },
  { versionKey: false }
);

const PromoSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    code: { type: String, index: true, unique: true },
    name: String,
    description: String,
    type: String, // PERCENT | FIXED
    value: Number, // percent (0-100) or fixed amount
    minSubtotal: Number,
    maxDiscount: Number,
    active: Number,
    startAt: Number,
    endAt: Number,
    createdAt: Number,
    updatedAt: Number,
  },
  { versionKey: false }
);

const SettingSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    key: String,
    imageUrl: String,
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
    imageUrl: String,
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
const Brand = mongoose.model('Brand', BrandSchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const Setting = mongoose.model('Setting', SettingSchema);
const Slide = mongoose.model('Slide', SlideSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Promo = mongoose.model('Promo', PromoSchema);

module.exports = {
  Admin,
  Category,
  Brand,
  Customer,
  Product,
  Order,
  Setting,
  Slide,
  Review,
  Promo,
};


 