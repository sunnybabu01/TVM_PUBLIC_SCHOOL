const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Inventory item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Item category is required'],
    enum: ['Lab Equipment', 'Furniture', 'Electronics', 'Sports', 'Classroom Supplies', 'Office Supplies'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Needs Repair', 'Broken'],
    default: 'Good'
  },
  roomNo: {
    type: String,
    required: [true, 'Assigned room number/lab name is required'],
    trim: true
  },
  lastUpdatedBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
