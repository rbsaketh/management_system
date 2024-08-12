import React, { useState } from 'react';
import { Box, Button, DialogContentText, TextField, CircularProgress, Typography } from '@mui/material';

const RecipeComponent = ({ userId }) => {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  const fetchRecipe = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://management-system-9hb0.onrender.com/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, apiKey }),
      });
      const result = await response.json();
      if (result.success) {
        setRecipe(result.recipe);
      } else {
        setError(result.message);
      }
    } catch (e) {
      console.error(e);        
      setError("An error occurred while fetching the recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <DialogContentText>
        Enter your Llama 3.1 API Key and generate a recipe based on your pantry items.
      </DialogContentText>
      <TextField
        required
        label="Enter Your Llama 3.1 API Key"
        variant="outlined"
        fullWidth
        margin="normal"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      {loading && <CircularProgress size={24} />}
      {error && <Typography color="error">{error}</Typography>}
      {recipe && (
        <Box mt={2} p={2} border="1px solid #ccc" borderRadius={4} maxHeight="400px" overflow="auto">
          <Typography variant="h6">Generated Recipe:</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {recipe}
          </pre>
        </Box>
      )}
      <Button
        onClick={fetchRecipe}
        variant="contained"
        color="primary"
        disabled={loading || !apiKey}
        sx={{ mt: 2 }}
      >
        Generate Recipe
      </Button>
    </Box>
  );
};

export default RecipeComponent;
