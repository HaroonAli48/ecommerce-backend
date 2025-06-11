import userModel from '../models/userModel.js';
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size, colour } = req.body;

    if (userId) {
      const userData = await userModel.findById(userId);
      let cartData = userData.cartData || {};

      const key = `${size}-${colour}`;

      // Check if itemId exists in cartData
      if (!cartData[itemId]) cartData[itemId] = {};

      if (cartData[itemId][key]) {
        cartData[itemId][key] += 1;
      } else {
        cartData[itemId][key] = 1;
      }

      await userModel.findByIdAndUpdate(userId, { cartData });

      res.status(200).json({ success: true, message: "Added to Cart" });
    } else {
      res.status(401).json({ success: false, message: "Not signed in." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Review System

const addReview = async (req, res) => {
    try {
        const { userId, itemId, message } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Not signed in." });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Ensure reviewData exists
        let reviewData = userData.reviewData || {};
        if (!Array.isArray(reviewData[itemId])) {
            reviewData[itemId] = []; // Initialize as an empty array
        }
        // Correctly store the review
        reviewData[itemId].push(message);

        // Update the user document in the database
        await userModel.findByIdAndUpdate(userId, { reviewData  });

        res.status(200).json({ success: true, message:{reviewData} });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const getReviews = async (req, res) => {
    try {
        const { itemId } = req.body; // Item ID to fetch reviews for

        if (!itemId) {
            return res.status(400).json({ success: false, message: "Item ID is required" });
        }

        // Find users who have reviewed this item
        const usersWithReviews = await userModel.find({ [`reviewData.${itemId}`]: { $exists: true } });

        // Extract reviews
        const reviews = usersWithReviews.map(user => ({
            userName: user.name,
            review: user.reviewData[itemId]
        }));

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// Backend route for updating the cart
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;
        
        const userData = await userModel.findById(userId);
        let cartData = userData.cartData;

        if (quantity === 0) {
            // Remove the specific size of the item
            delete cartData[itemId][size];

            // If no more sizes for this item, remove the item itself
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        } else {
            // Update the quantity if it's not 0
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = quantity;
        }

        // Save the updated cart back to the database
        await userModel.findByIdAndUpdate(userId, { cartData });

        res.status(200).json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;

        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        res.status(200).json({ success: true, cartData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, getUserCart, getReviews, addReview};
