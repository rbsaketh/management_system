const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const admin = require('firebase-admin');
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_CREDENTIALS, 'base64').toString('utf8'));
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit if needed

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "inventorymanagement-c3d9e"
  });
}
const db = getFirestore();

// Helper function to decode base64 image and save as a file
const saveBase64Image = (base64Image, filePath) => {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
};

// API route to generate recipe using Llama 3.1
app.post('/api/generate-recipe', async (req, res) => {
  const { userId, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'Llama 3.1 API key is required.' });
  }

  try {
    // Fetch pantry items from Firestore
    const userRef = db.collection('users').doc(userId);
    const inventoryRef = userRef.collection('inventory');
    const itemsSnapshot = await inventoryRef.get();
    const items = itemsSnapshot.docs.map(doc => {
      const data = doc.data();
      return `${data.name} (${data.quantity})`;
    });

    // Call the Llama 3.1 API to generate a recipe
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions', // Replace with actual Llama 3.1 API endpoint
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "Based on the items and quantities provided, provide recipes that the user can make."
          },
          {
            role: "user",
            content: items.join(', ')
          }
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    res.json({ success: true, recipe: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error generating recipe:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate recipe. Please try again.' });
  }
});

// API route to classify image using GPT-4
app.post('/api/classify-image', async (req, res) => {
  const { image, userId, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'OpenAI API key is required.' });
  }

  try {
    // Save base64 image to a file
    const imageName = `${uuidv4()}.jpg`;
    const imagePath = path.join(__dirname, imageName);
    saveBase64Image(image, imagePath);

    // Call the OpenAI API with GPT-4
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a pantry item predictor that can predict an item I am holding in my hand in the image. Return only the name of the item that I am holding in the image."
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    // Remove the temporary image file
    fs.unlinkSync(imagePath);

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
    console.error('Error during item classification:', error.message);
    res.status(500).json({ success: false, message: 'Failed to classify the item. Please try again.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
