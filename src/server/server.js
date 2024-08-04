require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const admin = require('firebase-admin');
const { initializeApp, applicationDefault, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit if needed

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}
const db = getFirestore();

// OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// API route to classify image
app.post('/api/classify-image', async (req, res) => {
  const { image, userId } = req.body;

  try {
    // Call the OpenAI API to classify the image
    const response = await axios.post(
      'https://api.openai.com/v1/images:generate',
      {
        messages: [
          {
            role: "system",
            content: "You are a pantry item predictor. Identify the item in the image and return only the name of the pantry item. If not a pantry item, return 'false'."
          },
          {
            role: "user",
            content: image // The base64 image data or URL
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const itemName = response.data.choices[0].message.content.trim();

    if (itemName && itemName.toLowerCase() !== "false") {
      const userRef = db.collection('users').doc(userId);
      const itemRef = userRef.collection('inventory').doc(itemName);
      const itemDoc = await itemRef.get();

      if (!itemDoc.exists) {
        await itemRef.set({
          name: itemName,
          quantity: 1
        });
        res.json({ success: true, message: `${itemName} added to your pantry list` });
      } else {
        await itemRef.update({
          quantity: admin.firestore.FieldValue.increment(1)
        });
        res.json({ success: true, message: `${itemName} quantity updated in your pantry list` });
      }
    } else {
      res.status(400).json({ success: false, message: "This item can't be added to your pantry list" });
    }
  } catch (error) {
    console.error('Error during image classification:', error.message);
    res.status(500).json({ success: false, message: 'Failed to classify the item. Please try again.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
