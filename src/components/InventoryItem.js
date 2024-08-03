import { Box, Typography, Button, Stack } from '@mui/material';

export default function InventoryItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <Box p={2} bgcolor="#f0f0f0" borderRadius={1} boxShadow={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{item.name}</Typography>
        <Typography variant="h6">Quantity: {item.quantity}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={onIncrement}>+</Button>
          <Button variant="contained" color="secondary" onClick={onDecrement}>-</Button>
          <Button variant="outlined" color="error" onClick={onRemove}>Remove</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
