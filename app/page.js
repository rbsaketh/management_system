'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from '../firebase';
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false); // Set to false initially
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1); // Track quantity for new items

  const updateInventory = async () => {
    const snapshot = collection(firestore, "inventory");
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item.name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity <= 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }
    await updateInventory();
  };

  const addItem = async () => {
    if (itemName.trim() === "" || itemQuantity < 1) return; // Prevent adding empty item names or zero quantity
    const docRef = doc(collection(firestore, "inventory"), itemName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + itemQuantity }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: itemQuantity });
    }
    setItemName("");
    setItemQuantity(1); // Reset item quantity input
    await updateInventory();
  };

  const incrementItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item.name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
    }
    await updateInventory();
  };

  const decrementItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item.name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity <= 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={2}
    >
      <Typography variant="h1">Inventory Management</Typography>
      <Button variant="contained" onClick={handleOpen} sx={{ mt: 2, mb: 2 }}>
        Add New Item
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
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

      <Box width="800px" border="1px solid #333" borderRadius={2} overflow="auto">
        <Typography variant="h2" align="center" bgcolor="#ADD8E6" p={2}>
          Inventory Items
        </Typography>
        <Stack width="100%" height="300px" p={2} spacing={2}>
          {inventory.map((item) => (
            <Stack
              key={item.name}
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
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
