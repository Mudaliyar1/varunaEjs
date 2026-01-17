// const express = require('express');
// const router = express.Router();
// const Suggestion = require('../models/Suggestion');
// const Product = require('../models/Product');
// const { authenticateUser, authorizeRole } = require('../middlewares/authMiddleware');

// // Route to handle suggestion form submission
// router.post('/suggestionForm', async (req, res) => {
//     try {
//         // Extracting input values
//         const {
//             Name,
//             ["Mobile-No"]: mobileNo,
//             Email: email,
//             State: state,
//             City: city,
//             District: district,
//             ["Buisness-Type"]: businessType,
//             ["find-form"]: findForm,
//             Model,
//             ["Type-Of-Products"]: typeOfProducts,
//             Head,
//             Flow,
//             ["pipe-size"]: pipeSize,
//             Phase: phase,
//             Frequency: frequency
//         } = req.body;

//         // Save user suggestion in MongoDB
//         const newSuggestion = new Suggestion({
//             name: Name,
//             mobileNo,
//             email,
//             state,
//             city,
//             district,
//             businessType,
//             findForm,
//             model: Model,
//             typeOfProducts,
//             head: Head,
//             flow: Flow,
//             pipeSize,
//             phase,
//             frequency
//         });

//         await newSuggestion.save();
//         console.log("Suggestion Saved:", req.body);

//         // Convert Head & Flow to numbers
//         const headValue = parseFloat(Head);
//         const flowValue = parseFloat(Flow);

//         // Query MongoDB to find a matching product
//         const product = await Product.findOne({
//             model: Model,
//             type: typeOfProducts,               // Match product type
//             head_meters: { $in: [headValue] },  // Check if head exists in the array
//             discharge_lpm: { $in: [flowValue] } // Check if flow exists in the array
//         });

//         if (!product) {
//             console.log("No matching product found.");
//         } else {
//             console.log("Matching product found:", product.model);
//         }

//         // Redirect to results page, passing product ID if found
//         res.redirect(`/suggestion/results?productId=${product ? product._id : ''}`);
//     } catch (error) {
//         console.error("Error in /suggestionForm route:", error);
//         res.status(500).send("Server Error");
//     }
// });

// // Route to display suggested product to the user
// router.get('/suggestion/results', async (req, res) => {
//     try {
//         const product = await Product.findById(req.query.productId);

//         if (!product) {
//             return res.render('suggestionResults', { product: null, message: "No product found matching the criteria." });
//         }

//         res.render('suggestionResults', { product, message: "" });
//     } catch (error) {
//         console.error("Error in /suggestion/results route:", error);
//         res.status(500).send("No Product Found");
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion');
const Product = require('../models/Product');

// Route to handle suggestion form submission
router.post('/suggestionForm', async (req, res) => {
    try {
        const {
            Name,
            ["Mobile-No"]: mobileNo,
            Email: email,
            State: state,
            City: city,
            District: district,
            ["Buisness-Type"]: businessType,
            ["find-form"]: findForm,
            Model,
            ["Type-Of-Products"]: typeOfProducts,
            Head,
            Flow,
            ["pipe-size"]: pipeSize,
            Phase: phase,
            Frequency: frequency
        } = req.body;

        // Save user suggestion
        const newSuggestion = new Suggestion({
            name: Name,
            mobileNo,
            email,
            state,
            city,
            district,
            businessType,
            findForm,
            model: Model,
            typeOfProducts,
            head: Head,
            flow: Flow,
            pipeSize,
            phase,
            frequency,
            createdAt: new Date()
        });

        await newSuggestion.save();
        console.log("Suggestion Saved:", req.body);

        // Parse user input ranges
        let headRange = Head.split("-").map(value => parseFloat(value.trim()));
        let flowRange = Flow.split("-").map(value => parseFloat(value.trim()));

        if (headRange.length !== 2 || flowRange.length !== 2 ||
            isNaN(headRange[0]) || isNaN(headRange[1]) ||
            isNaN(flowRange[0]) || isNaN(flowRange[1])) {
            return res.render('suggestionResults', {
                products: [],
                message: "Invalid head or flow range format. Please use format: min-max"
            });
        }

        let userHeadMin = headRange[0];
        let userHeadMax = headRange[1];
        let userFlowMin = flowRange[0];
        let userFlowMax = flowRange[1];

        console.log(`User requested - Head: ${userHeadMin}-${userHeadMax}, Flow: ${userFlowMin}-${userFlowMax}`);

        // Build a more sophisticated query with proper array handling
        const query = {
            type: typeOfProducts
        };

        // Add pipe size filter if specified
        if (pipeSize && pipeSize !== "pipe-size") {
            query.suction_size = pipeSize;
        }

        // Add phase filter if specified
        if (phase && phase !== "Phase") {
            query.type = { $regex: new RegExp(phase, 'i') };
        }

        // Add frequency filter if specified
        if (frequency) {
            query.pump_frequency = frequency.replace('Hz', '');
        }

        // First try: Exact match within range using array operators
        // Note: We need to use $and with multiple $or conditions instead of multiple $or at the top level
        let matchingProducts = await Product.find({
            ...query,
            $and: [
                { $or: [
                    // Check if any value in head_meters array falls within the user's range
                    { head_meters: { $elemMatch: { $gte: userHeadMin, $lte: userHeadMax } } },
                    // For products with single head_meters value
                    { head_meters: { $gte: userHeadMin, $lte: userHeadMax } },
                    // For products with no head_meters value or outside range, we'll still include them
                    // but they'll be ranked lower in the scoring phase
                    { head_meters: { $exists: true } }
                ]},
                { $or: [
                    // Check if any value in discharge_lpm array falls within the user's range
                    { discharge_lpm: { $elemMatch: { $gte: userFlowMin, $lte: userFlowMax } } },
                    // For products with single discharge_lpm value
                    { discharge_lpm: { $gte: userFlowMin, $lte: userFlowMax } },
                    // For products with no discharge_lpm value or outside range
                    { discharge_lpm: { $exists: true } }
                ]}
            ]
        }).sort({ model: 1 }); // Sort by model name

        console.log(`First query found ${matchingProducts.length} products`);

        // If we found products but they don't exactly match the criteria, we'll still show them
        // but add a note that they're approximate matches
        let exactMatch = true;

        // If no products found with the strict criteria, try a more relaxed query
        if (matchingProducts.length === 0) {
            exactMatch = false;
            // Try with just the product type
            matchingProducts = await Product.find(query).sort({ model: 1 });
            console.log(`Relaxed query found ${matchingProducts.length} products`);
        }

        // If we still don't have any products, try to find the closest matches
        if (matchingProducts.length === 0) {
            console.log("No matches found, looking for any products of this type...");

            // Get ALL products regardless of type as a last resort
            const allProducts = await Product.find({});
            console.log(`Found ${allProducts.length} total products in database`);

            if (allProducts.length === 0) {
                // If there are no products at all in the database, this is a bigger issue
                console.error("No products found in the database at all!");
                return res.render('suggestionResults', {
                    products: [],
                    message: "No products available in our database. Please contact our support team."
                });
            }

            // First try to find products of the requested type
            let typeProducts = allProducts.filter(p => p.type === typeOfProducts);
            console.log(`Found ${typeProducts.length} products of type ${typeOfProducts}`);

            // If we found products of this type, use them
            if (typeProducts.length > 0) {
                // Calculate "distance" from requested parameters for each product
                const productsWithScores = typeProducts.map(product => {
                    // Extract head and flow values, handling both arrays and single values
                    const headValues = Array.isArray(product.head_meters) ?
                        product.head_meters.filter(h => h !== null && h !== undefined && !isNaN(Number(h))).map(Number) :
                        (product.head_meters !== null && product.head_meters !== undefined && !isNaN(Number(product.head_meters))) ?
                            [Number(product.head_meters)] : [];

                    const flowValues = Array.isArray(product.discharge_lpm) ?
                        product.discharge_lpm.filter(f => f !== null && f !== undefined && !isNaN(Number(f))).map(Number) :
                        (product.discharge_lpm !== null && product.discharge_lpm !== undefined && !isNaN(Number(product.discharge_lpm))) ?
                            [Number(product.discharge_lpm)] : [];

                    // If we don't have any valid head or flow values, assign default scores
                    if (headValues.length === 0 && flowValues.length === 0) {
                        return {
                            product,
                            score: 50, // Middle score for products with no head/flow data
                            closestHead: null,
                            closestFlow: null
                        };
                    }

                    // Find closest values in each array
                    let closestHead = null;
                    let closestFlow = null;
                    let minHeadDistance = Infinity;
                    let minFlowDistance = Infinity;

                    // Find closest head value
                    if (headValues.length > 0) {
                        headValues.forEach(head => {
                            // Calculate distance to range
                            const distToRange = head < userHeadMin ? userHeadMin - head :
                                               head > userHeadMax ? head - userHeadMax : 0;
                            if (distToRange < minHeadDistance) {
                                minHeadDistance = distToRange;
                                closestHead = head;
                            }
                        });
                    }

                    // Find closest flow value
                    if (flowValues.length > 0) {
                        flowValues.forEach(flow => {
                            // Calculate distance to range
                            const distToRange = flow < userFlowMin ? userFlowMin - flow :
                                               flow > userFlowMax ? flow - userFlowMax : 0;
                            if (distToRange < minFlowDistance) {
                                minFlowDistance = distToRange;
                                closestFlow = flow;
                            }
                        });
                    }

                    // Calculate overall score (lower is better)
                    // If we don't have head or flow values, use a default score component
                    const headScore = closestHead !== null ?
                        minHeadDistance / Math.max(1, userHeadMax) :
                        0.5; // Default score for missing head data

                    const flowScore = closestFlow !== null ?
                        minFlowDistance / Math.max(1, userFlowMax) :
                        0.5; // Default score for missing flow data

                    // Weight the scores - head is usually more important than flow
                    const totalScore = (headScore * 0.6) + (flowScore * 0.4);

                    return {
                        product,
                        score: totalScore,
                        closestHead,
                        closestFlow
                    };
                });

                // Sort by score (lowest first) and take top 5
                productsWithScores.sort((a, b) => a.score - b.score);
                matchingProducts = productsWithScores.map(item => item.product);

                // Limit to top 10 products
                if (matchingProducts.length > 10) {
                    matchingProducts = matchingProducts.slice(0, 10);
                }

                console.log(`Found ${matchingProducts.length} products after scoring`);
                exactMatch = false;
            } else {
                // If we still don't have any products, just return the first few products from the database
                matchingProducts = allProducts.slice(0, 5);
                console.log(`No products of requested type, showing ${matchingProducts.length} generic products`);
                exactMatch = false;
            }
        }

        if (matchingProducts.length === 0) {
            return res.render('suggestionResults', {
                products: [],
                message: "No products available that match your requirements. Please contact our company for assistance.",
                userCriteria: {
                    type: typeOfProducts,
                    head: Head,
                    flow: Flow,
                    pipeSize,
                    phase,
                    frequency
                }
            });
        }

        // Prepare a message based on whether we found exact matches or not
        let message = "";
        if (exactMatch) {
            message = `Found ${matchingProducts.length} products that exactly match your requirements.`;
        } else {
            message = `Found ${matchingProducts.length} products that are close to your requirements. These may not be exact matches but are the best options available.`;
        }

        res.render('suggestionResults', {
            products: matchingProducts,
            message,
            exactMatch,
            userCriteria: {
                type: typeOfProducts,
                head: Head,
                flow: Flow,
                pipeSize,
                phase,
                frequency
            }
        });

    } catch (error) {
        console.error("Error in /suggestionForm route:", error);
        res.status(500).send("An error occurred while processing your request. Please ensure all fields are filled correctly.");
    }
});

// Route to display results
router.get('/suggestion/results', async (req, res) => {
    try {
        let products = [];

        if (req.query.productId) {
            let product = await Product.findById(req.query.productId);
            if (product) {
                products.push(product);
            }
        }

        if (products.length === 0) {
            products = await Product.find(); // Show all products if no match found
        }

        res.render('suggestionResults', { products, message: products.length});
    } catch (error) {
        console.error("Error in /suggestion/results route:", error);
        res.status(500).send("No Product Found");
    }
});



// API to get min-max Head & Flow values and filter options for a selected product type
router.get("/get-product-details", async (req, res) => {
    try {
        const productType = req.query.type;
        if (!productType) return res.status(400).json({ error: "Product type is required" });

        // Fetch all products of the given type
        const products = await Product.find({ type: productType });

        if (!products.length) return res.status(404).json({ error: "No products found for this type." });

        // Extract head and flow values (flattening arrays)
        let headValues = [];
        let flowValues = [];

        products.forEach(product => {
            // Handle head_meters values
            if (Array.isArray(product.head_meters)) {
                product.head_meters.forEach(val => {
                    if (val !== null && val !== undefined && !isNaN(Number(val))) {
                        headValues.push(Number(val));
                    }
                });
            } else if (product.head_meters !== null && product.head_meters !== undefined && !isNaN(Number(product.head_meters))) {
                headValues.push(Number(product.head_meters));
            }

            // Handle discharge_lpm values
            if (Array.isArray(product.discharge_lpm)) {
                product.discharge_lpm.forEach(val => {
                    if (val !== null && val !== undefined && !isNaN(Number(val))) {
                        flowValues.push(Number(val));
                    }
                });
            } else if (product.discharge_lpm !== null && product.discharge_lpm !== undefined && !isNaN(Number(product.discharge_lpm))) {
                flowValues.push(Number(product.discharge_lpm));
            }
        });

        // Handle cases where no valid values exist
        const headMin = headValues.length ? Math.min(...headValues) : 0;
        const headMax = headValues.length ? Math.max(...headValues) : 100;
        const flowMin = flowValues.length ? Math.min(...flowValues) : 0;
        const flowMax = flowValues.length ? Math.max(...flowValues) : 100;

        // Get pipe sizes
        let pipeSizes = [];
        pipeSizes = pipeSizes.concat(await Product.distinct("suction_size", { type: productType }));
        pipeSizes = pipeSizes.concat(await Product.distinct("pump_del_size", { type: productType }));

        // Remove duplicates and empty values
        pipeSizes = [...new Set(pipeSizes)].filter(Boolean);

        // Get phases - we need to be careful here as phases might be part of the type field
        // First, get all unique types for this product category
        const allTypes = await Product.distinct("type", { type: { $regex: new RegExp(productType, 'i') } });

        // Extract phase information from types
        let phases = [];
        const phaseKeywords = ["Single Phase", "Three Phase", "Multi-dimension Phase"];

        // Check if any of the types contain phase information
        allTypes.forEach(type => {
            phaseKeywords.forEach(phase => {
                if (type.includes(phase)) {
                    phases.push(phase);
                }
            });
        });

        // If no phases found, add default phases
        if (phases.length === 0) {
            phases = ["Single Phase", "Multi-dimension Phase"];
        }

        // Get frequencies
        let frequencies = [];
        frequencies = frequencies.concat(await Product.distinct("pump_frequency", { type: productType }));

        // Clean up frequency values
        frequencies = [...new Set(frequencies)]
            .filter(Boolean)
            .map(freq => freq.toString().replace(/Hz$/i, ''));

        // If no frequencies found, add default frequencies
        if (frequencies.length === 0) {
            frequencies = ["50", "60"];
        }

        // Log the data being sent for debugging
        console.log(`Product type: ${productType} - Filter options:`, {
            pipeSizes,
            phases,
            frequencies
        });

        res.json({
            head: { min: headMin, max: headMax },
            flow: { min: flowMin, max: flowMax },
            metadata: {
                pipeSizes,
                phases,
                frequencies
            }
        });

    } catch (error) {
        console.error("Error in /get-product-details API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get('/suggestion', async (req, res) => {
    try {
        // Fetch all unique product types
        let productTypes = await Product.distinct('type');

        // Filter out empty or null values
        productTypes = productTypes.filter(type => type && type.trim() !== '');

        // Sort alphabetically for better user experience
        productTypes.sort((a, b) => a.localeCompare(b));

        console.log(`Found ${productTypes.length} product types:`, productTypes);

        // Get all pipe sizes for initial loading
        const pipeSizes = await Product.distinct('suction_size');
        const pumpDelSizes = await Product.distinct('pump_del_size');

        // Combine all size values, remove duplicates and empty values
        const allPipeSizes = [...new Set([...pipeSizes, ...pumpDelSizes])]
            .filter(size => size && size.toString().trim() !== '');

        // Get all phases by checking the type field for phase information
        const allTypes = await Product.distinct('type');
        let phases = [];
        const phaseKeywords = ["Single Phase", "Three Phase", "Multi-dimension Phase"];

        allTypes.forEach(type => {
            phaseKeywords.forEach(phase => {
                if (type && type.includes(phase)) {
                    phases.push(phase);
                }
            });
        });

        // Remove duplicates
        phases = [...new Set(phases)];

        // If no phases found, add default phases
        if (phases.length === 0) {
            phases = ["Single Phase", "Multi-dimension Phase"];
        }

        // Get all frequencies
        const frequencyValues = await Product.distinct('pump_frequency');

        // Clean up and remove duplicates
        const frequencies = [...new Set(frequencyValues)]
            .filter(freq => freq && freq.toString().trim() !== '')
            .map(freq => freq.toString().replace(/Hz$/i, ''));

        // Fetch a sample of products for display (optional)
        const products = await Product.find({}).limit(10);

        res.render('suggestion', {
            products,
            productTypes,
            allPipeSizes,
            phases,
            frequencies
        });
    } catch (error) {
        console.error("Error in /suggestion route:", error);
        res.status(500).send("Internal Server Error");
    }
});



module.exports = router;
