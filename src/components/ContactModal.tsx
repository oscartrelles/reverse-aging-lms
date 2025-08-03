import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Close, Send } from '@mui/icons-material';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For now, we'll simulate sending the email
      // In production, this would send to your backend or email service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 2000);
    } catch (err) {
      setError('Failed to send message. Please try again or email us directly at info@breathingflame.com');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({ name: '', email: '', subject: '', message: '' });
      setError('');
      setSuccess(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '1.25rem' }}>
          Contact Us
        </Typography>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            minWidth: 'auto',
            p: 1,
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: `${theme.palette.text.secondary}10`,
            }
          }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Message sent successfully! We'll get back to you soon.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              You can also reach us directly at{' '}
              <Typography
                component="a"
                href="mailto:info@breathingflame.com"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                info@breathingflame.com
              </Typography>
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Have a question about our programs? Want to learn more about the Academy? 
              We'd love to hear from you.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
                disabled={loading}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Box>

            <TextField
              fullWidth
              label="Subject"
              value={formData.subject}
              onChange={handleChange('subject')}
              required
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleChange('message')}
              required
              disabled={loading}
              placeholder="Tell us how we can help you..."
              sx={{ mb: 3 }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You can also reach us directly at{' '}
              <Typography
                component="a"
                href="mailto:info@breathingflame.com"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                info@breathingflame.com
              </Typography>
            </Typography>
          </Box>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.email || !formData.subject || !formData.message}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: '#000',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              }
            }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ContactModal; 