import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { firestore } from '../../firebase';
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import CameraComponent from '../components/CameraComponent'; // Adjust the path as needed
import RecipeComponent from '../components/RecipeComponent'; // Adjust the path as needed

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        createUserDocument(currentUser);
        updateInventory(currentUser.uid);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const createUserDocument = async (user) => {
    if (!user) return;

    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const userData = {
        displayName: user.displayName || "Anonymous",
        email: user.email,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      await setDoc(userRef, userData);
    } else {
      await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push('/');
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const updateInventory = async (userId) => {
    if (!userId) return;
    const userInventoryRef = collection(firestore, 'users', userId, 'inventory');
    const docs = await getDocs(userInventoryRef);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async () => {
    if (!user || itemName.trim() === '' || itemQuantity < 1) return;
    const userInventoryRef = collection(firestore, 'users', user.uid, 'inventory');
    const docRef = doc(userInventoryRef, itemName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { name: itemName, quantity: quantity + itemQuantity }, { merge: true });
    } else {
      await setDoc(docRef, { name: itemName, quantity: itemQuantity });
    }
    setItemName('');
    setItemQuantity(1);
    await updateInventory(user.uid);
  };

  const incrementItem = async (item) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'inventory', item.id);
    await setDoc(docRef, { quantity: item.quantity + 1 }, { merge: true });
    await updateInventory(user.uid);
  };

  const decrementItem = async (item) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'inventory', item.id);
    if (item.quantity <= 1) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { quantity: item.quantity - 1 }, { merge: true });
    }
    await updateInventory(user.uid);
  };

  const removeItem = async (item) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'inventory', item.id);
    await deleteDoc(docRef);
    await updateInventory(user.uid);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleRecipeOpen = () => setRecipeOpen(true);
  const handleRecipeClose = () => setRecipeOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={2}
      sx={{ overflowY: 'scroll' }}
    >
      <Typography variant="h1">Inventory Management</Typography>
      <Button variant="contained" onClick={handleOpen} sx={{ mt: 2, mb: 2 }}>
        Add New Item
      </Button>
      <Button variant="contained" onClick={() => setCameraOpen(true)} sx={{ mb: 2 }}>
        Add Item with Camera
      </Button>
      <Button variant="contained" color="secondary" onClick={handleRecipeOpen} sx={{ mb: 2 }}>
        Generate Recipe
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="20%"
          left="35%"
          transform="translate(-50%, -50%)"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item Name"
            />
            <TextField
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
              placeholder="Quantity"
              inputProps={{ min: 1 }}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem();
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
        <Box
          position="absolute"
          top="20%"
          left="35%"
          transform="translate(-50%, -50%)"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <CameraComponent refreshItems={() => updateInventory(user?.uid)} />
        </Box>
      </Modal>

      <Modal open={recipeOpen} onClose={handleRecipeClose} top = "20%" left = "50%">
        <Box
          position="absolute"
          top="5%"
          left="30%"
          transform="translate(-50%, -50%)"
          width={600}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          marginBottom={5000} // Add vertical scrollbar
        >
          <RecipeComponent userId={user?.uid} />
        </Box>
      </Modal>

      <Box width="800px" border="1px solid #333" borderRadius={2} overflow="auto">
        <Typography variant="h2" align="center" bgcolor="#ADD8E6" p={2}>
          Inventory Items
        </Typography>
        <Stack width="100%" height="300px" p={2} spacing={2}>
          {inventory.map((item) => (
            <Stack
              key={item.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              bgcolor="#f0f0f0"
              p={2}
              borderRadius={1}
              boxShadow={1}
            >
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="h6">Quantity: {item.quantity}</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="primary" onClick={() => incrementItem(item)}>
                  +
                </Button>
                <Button variant="contained" color="secondary" onClick={() => decrementItem(item)}>
                  -
                </Button>
                <Button variant="outlined" color="error" onClick={() => removeItem(item)}>
                  Remove
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Box>
      
      <Box mt={4} textAlign="center">
        {user && (
          <Typography variant="h6">Welcome, {user.displayName}</Typography>
        )}
        <Button variant="contained" color="primary" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Box>
    </Box>
  );
}
