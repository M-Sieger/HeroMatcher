import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Willkommen bei HeroMatcher
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph align="center" sx={{ mb: 4 }}>
        Automatisierter Vergleich zwischen unterschriebenen Angeboten und Hero-Vorlagen
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <UploadFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Dokumente hochladen
            </Typography>
            <Typography variant="body1" paragraph sx={{ flex: 1 }}>
              Laden Sie Ihr unterschriebenes Kundenangebot (PDF) und die entsprechende Hero-Vorlage
              hoch.
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/compare')} fullWidth>
              Zum Upload
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CompareArrowsIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Automatischer Vergleich
            </Typography>
            <Typography variant="body1" paragraph sx={{ flex: 1 }}>
              Das System analysiert beide Dokumente und zeigt Ihnen übereinstimmende, fehlende und
              zusätzliche Positionen an.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Funktionen
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              ✓ OCR-Textextraktion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automatische Textextraktion aus PDF-Dokumenten
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              ✓ Intelligenter Vergleich
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Erkennung von Übereinstimmungen und Unterschieden
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              ✓ Übersichtliche Darstellung
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Farbliche Markierung und strukturierte Ausgabe
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
