import { Box, Typography, TextField, Button, Stack, Modal } from '@mui/material';

export default function AddItemModal({ open, onClose, itemName, setItemName, itemQuantity, setItemQuantity, onAdd }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" width={400} bgcolor="white" border="2px solid #000" boxShadow={24} p={4}>
        <Typography variant="h6">Add Item</Typography>
        <Stack spacing={2} mt={2}>
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
          <Button variant="contained" onClick={onAdd}>Add</Button>
        </Stack>
      </Box>
    </Modal>
  );
}
