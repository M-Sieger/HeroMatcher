import { useState } from 'react';
import { Box, Typography, Button, Paper, Grid, Alert, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

interface UploadedFile {
  name: string;
  type: string;
}

export default function ComparePage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else {
      setError('Bitte wählen Sie eine gültige PDF-Datei aus.');
    }
  };

  const handleHeroUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHeroFile(file);
      setError(null);
    }
  };

  const handleCompare = async () => {
    if (!pdfFile || !heroFile) {
      setError('Bitte laden Sie beide Dateien hoch.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    formData.append('heroFile', heroFile);

    try {
      const response = await axios.post('/api/compare', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Comparison result:', response.data);
      setSuccess(true);
      // TODO: Display comparison results
    } catch (err) {
      setError('Fehler beim Vergleich der Dokumente. Bitte versuchen Sie es erneut.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dokumentenvergleich
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Dokumente erfolgreich hochgeladen und verglichen!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Unterschriebenes Angebot (PDF)
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              PDF hochladen
              <input type="file" hidden accept="application/pdf" onChange={handlePdfUpload} />
            </Button>
            {pdfFile && <Alert severity="info">Ausgewählt: {pdfFile.name}</Alert>}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hero-Vorlage
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Hero-Datei hochladen
              <input type="file" hidden onChange={handleHeroUpload} />
            </Button>
            {heroFile && <Alert severity="info">Ausgewählt: {heroFile.name}</Alert>}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleCompare}
          disabled={!pdfFile || !heroFile || loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Vergleichen'}
        </Button>
      </Box>

      {/* TODO: Add comparison results display here */}
    </Box>
  );
}
