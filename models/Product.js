const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: String, required: true },  // User's name or ID
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    // Basic Information
    model: String,
    type: String,
    description: String,
    input: String, // Main product image
    images: [String], // Additional product images

    // Product Identification
    pump_id: { type: String, default: null },
    pump_app_name: { type: String, default: null },
    pump_model_name: { type: String, default: null },

    // Group Information
    group: String,
    pump_sub_group: { type: String, default: null },
    pump_sub_group_name: { type: String, default: null },

    // Performance Specifications
    stages: Number,
    head_meters: [Number],
    discharge_lpm: [Number],
    pump_discharge_type: { type: String, default: null },
    pump_discharge_range: { type: String, default: null },
    pump_rated_head: { type: String, default: null },
    pump_sp_gr: { type: String, default: null },

    // Power & Electrical Details
    motor_rating: String,
    pump_power_hp: { type: String, default: null },
    pump_power_kw: { type: String, default: null },
    pump_voltage: { type: String, default: null }, // Replaces voltage
    pump_frequency: { type: String, default: null }, // Replaces hertz
    pump_power_supply: { type: String, default: null }, // Replaces power_supply

    // Physical Specifications
    suction_size: String,
    pump_del_size: { type: String, default: null }, // Replaces delivery_size
    pump_priming_type: { type: String, default: null },
    material: String,

    // Features and Applications
    salient_features: [String],
    applications: [String],

    // Additional Details
    motor_details: {
        type: Map,
        of: String
    },
    pump_details: {
        type: Map,
        of: String
    },

    // Reviews
    reviews: [reviewSchema],

    // Metadata
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: String, default: null }
});

module.exports = mongoose.model('Product', productSchema);