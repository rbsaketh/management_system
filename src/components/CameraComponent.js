import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, TextField, CircularProgress, Typography } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAlert } from '../context/useAlert';

const CameraComponent = ({ refreshItems }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [user, setUser] = useState(null);
  const alert = useAlert();
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setCameraSupported(true))
      .catch((err) => {
        console.error(err);
        setCameraSupported(false);
      });

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [alert]);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const capturedImage = webcamRef.current.getScreenshot();
      setImage(capturedImage);
      setOpenModal(true);
    }
  };

  const handleCancel = () => {
    setOpenModal(false);
    setImage(null);
  };

  const handleAdd = async () => {
    if (!user) {
      // alert.error("You need to be signed in to add items.");
      console.log("Signed")
      return;
    }

    if (!apiKey) {
      // alert.error("OpenAI API key is required.");
      console.log("no key")

      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://management-system-9hb0.onrender.com//api/classify-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        
        body: JSON.stringify({
          image, // Base64 image data
          userId: user.uid, // Firebase user ID
          apiKey // OpenAI API Key from user input
        })
      });
      const result = await response.json();

      if (result.success) {
        // alert.success(result.message);
      } else {
        console.error(result.message);
      }

      refreshItems();
    } catch (error) {
      console.error(error);
      // alert.error("Failed to classify the item. Please try again.");
    } finally {
      setOpenModal(false);
      setLoading(false);
      setImage(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pantry Item Classifier
      </Typography>
      {cameraSupported ? (
        <>
          <Box className="border-2 border-gray-300" sx={{ width: '320px', height: '240px' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              height="100%"
              videoConstraints={{
                facingMode: "environment",
              }}
            />
          </Box>
          <Button onClick={capturePhoto} variant="contained" color="primary" className="mt-4">
            Take Photo
          </Button>
        </>
      ) : (
        <Typography variant="body1" color="error">
          Camera is not supported on this device or browser. Please try using a different device or updating your browser.
        </Typography>
      )}

      <Dialog
        open={openModal}
        onClose={!loading ? handleCancel : undefined}
        disableBackdropClick={loading}
        disableEscapeKeyDown={loading}
      >
        <DialogTitle>Photo Taken</DialogTitle>
        <DialogContent className='flex flex-col justify-center items-center'>
          <DialogContentText>
            Review the photo. Click Add to save the item or Cancel to discard.
          </DialogContentText>
          <TextField
            required
            label="Enter Your OpenAI API Key"
            variant="outlined"
            className='mt-10'
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value) }}
          />
          {image && <img src={image} alt="Taken photo" style={{ width: '100%', marginTop: '10px' }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button type='submit' onClick={handleAdd} variant="contained" color="primary" disabled={loading || !apiKey}>
            {loading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CameraComponent;
