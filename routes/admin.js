const express = require('express');
const { authenticateUser, authorizeRole } = require('../middlewares/authMiddleware');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');


// Secure Admin Panel (Only for Admins)
router.get('/', authenticateUser, authorizeRole(['admin']), async (req, res) => {
    const products = await Product.find();
    res.render('adminProductList', { products });
});

router.get('/add', authenticateUser, authorizeRole(['admin']), async (req, res) => {
    const products = await Product.find();
    res.render('admin', { products });
});

// Secure Product Addition
router.post('/add', authenticateUser, authorizeRole(['admin']), async (req, res) => {
    try {
        // Helper function to safely split comma-separated values
        const safeSplit = (value, isNumber = false) => {
            if (!value) return isNumber ? [] : [];
            return value.split(",").map(item => {
                const trimmed = item.trim();
                return isNumber ? parseFloat(trimmed) : trimmed;
            }).filter(item => isNumber ? !isNaN(item) : item !== "");
        };

        const newProduct = new Product({
            // Basic Information
            model: req.body.model,
            pump_id: req.body.pump_id,
            pump_app_name: req.body.pump_app_name,

            // Group Information
            group: req.body.group,
            pump_sub_group: req.body.pump_sub_group,
            pump_sub_group_name: req.body.pump_sub_group_name,

            // Model Details
            pump_model_name: req.body.pump_model_name,
            type: req.body.type,
            stages: req.body.stages ? parseInt(req.body.stages) : null,

            // Performance Details
            head_meters: safeSplit(req.body.head_meters, true),
            discharge_lpm: safeSplit(req.body.discharge_lpm, true),
            pump_discharge_type: req.body.pump_discharge_type,
            pump_discharge_range: req.body.pump_discharge_range,
            pump_rated_head: req.body.pump_rated_head,
            pump_sp_gr: req.body.pump_sp_gr,

            // Power & Electrical Details
            motor_rating: req.body.motor_rating,
            pump_power_hp: req.body.pump_power_hp,
            pump_power_kw: req.body.pump_power_kw,
            pump_voltage: req.body.pump_voltage,
            pump_frequency: req.body.pump_frequency,
            pump_power_supply: req.body.pump_power_supply,

            // Physical Specifications
            suction_size: req.body.suction_size,
            pump_del_size: req.body.pump_del_size,
            pump_priming_type: req.body.pump_priming_type,
            material: req.body.material,

            // Additional Information
            description: req.body.description,
            input: req.body.input,
            salient_features: safeSplit(req.body.salient_features),
            applications: safeSplit(req.body.applications),

            // Additional fields
            images: req.body.images ? req.body.images.split(",") : [],
            motor_details: req.body.motor_details,
            pump_details: req.body.pump_details,

            // Metadata
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user ? req.user.username : 'admin'
        });

        await newProduct.save();
        res.redirect('/admin');
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send("Error adding product: " + error.message);
    }
});

// Show Edit Page (Only for Admins)
router.get('/edit/:id', authenticateUser, authorizeRole(['admin']), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.render('edit', { product });
    } catch (error) {
        res.status(500).send("Error loading edit page");
    }
});

// Handle Product Update (Only for Admins)
router.post('/edit/:id', authenticateUser, authorizeRole(['admin']), async (req, res) => {
    try {
        // Helper function to safely split comma-separated values
        const safeSplit = (value, isNumber = false) => {
            if (!value) return isNumber ? [] : [];
            return value.split(",").map(item => {
                const trimmed = item.trim();
                return isNumber ? parseFloat(trimmed) : trimmed;
            }).filter(item => isNumber ? !isNaN(item) : item !== "");
        };

        const updatedProduct = {
            // Basic Information
            model: req.body.model,
            pump_id: req.body.pump_id,
            pump_app_name: req.body.pump_app_name,

            // Group Information
            group: req.body.group,
            pump_sub_group: req.body.pump_sub_group,
            pump_sub_group_name: req.body.pump_sub_group_name,

            // Model Details
            pump_model_name: req.body.pump_model_name,
            type: req.body.type,
            stages: req.body.stages ? parseInt(req.body.stages) : null,

            // Performance Details
            head_meters: safeSplit(req.body.head_meters, true),
            discharge_lpm: safeSplit(req.body.discharge_lpm, true),
            pump_discharge_type: req.body.pump_discharge_type,
            pump_discharge_range: req.body.pump_discharge_range,
            pump_rated_head: req.body.pump_rated_head,
            pump_sp_gr: req.body.pump_sp_gr,

            // Power & Electrical Details
            motor_rating: req.body.motor_rating,
            pump_power_hp: req.body.pump_power_hp,
            pump_power_kw: req.body.pump_power_kw,
            pump_voltage: req.body.pump_voltage,
            pump_frequency: req.body.pump_frequency,
            pump_power_supply: req.body.pump_power_supply,

            // Physical Specifications
            suction_size: req.body.suction_size,
            pump_del_size: req.body.pump_del_size,
            pump_priming_type: req.body.pump_priming_type,
            material: req.body.material,

            // Additional Information
            description: req.body.description,
            input: req.body.input,
            salient_features: safeSplit(req.body.salient_features),
            applications: safeSplit(req.body.applications),

            // Additional fields
            images: req.body.images ? req.body.images.split(",") : [],
            motor_details: req.body.motor_details,
            pump_details: req.body.pump_details,

            // Metadata
            updated_at: new Date()
        };

        await Product.findByIdAndUpdate(req.params.id, updatedProduct);
        res.redirect('/admin');
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product: " + error.message);
    }
});

// Handle Product Deletion (Only for Admins)
router.get('/delete/:id', authenticateUser, authorizeRole(['admin']), async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send("Error deleting product");
    }
});


// Render Registration Page
router.get('/register', authenticateUser, authorizeRole(['admin']), (req, res) => {
    res.render('register', { message: "" });
});

// Handle Registration
router.post('/register', authenticateUser, authorizeRole(['admin']), async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        if (!username || !email || !password || !role) {
            return res.render('register', { message: "All fields are required." });
        }

        if (!["crm", "ce"].includes(role)) {
            return res.render('register', { message: "Invalid role. Only CRM and CE can be registered." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { message: "Email is already registered." });
        }

        const newUser = new User({
            username,
            email,
            password,
            role
        });

        await newUser.save();
        res.render('register', { message: "User registered successfully!" });

    } catch (error) {
        console.error("Error registering user:", error);
        res.render('register', { message: "Server error. Please try again later." });
    }
});

module.exports = router;