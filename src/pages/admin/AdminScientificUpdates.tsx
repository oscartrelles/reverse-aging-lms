import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Science,
  Search,
  FilterList,
  Sort,
  TrendingUp,
  ThumbUp,
  Share,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { scientificUpdateService } from '../../services/scientificUpdateService';
import ScientificUpdateEditor from '../../components/admin/ScientificUpdateEditor';
import { ScientificUpdate } from '../../types';

const AdminScientificUpdates: React.FC = () => {
  const { currentUser } = useAuth();
  const [updates, setUpdates] = useState<ScientificUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Editor states
  const [showEditor, setShowEditor] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ScientificUpdate | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('publishedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // View states
  const [selectedUpdate, setSelectedUpdate] = useState<ScientificUpdate | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const categories = [
    'Mindset',
    'Nourishment', 
    'Breath',
    'Cold',
    'Heat',
    'Movement',
    'Community'
  ];

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatesData = await scientificUpdateService.getAllUpdates();
      setUpdates(updatesData);
    } catch (error) {
      console.error('Error loading scientific updates:', error);
      setError('Failed to load scientific updates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = () => {
    setEditingUpdate(null);
    setShowEditor(true);
  };

  const handleEditUpdate = (update: ScientificUpdate) => {
    setEditingUpdate(update);
    setShowEditor(true);
  };

  const handleViewUpdate = (update: ScientificUpdate) => {
    setSelectedUpdate(update);
    setShowViewDialog(true);
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!window.confirm('Are you sure you want to delete this scientific update? This action cannot be undone.')) {
      return;
    }

    try {
      await scientificUpdateService.deleteUpdate(updateId);
      setSuccess('Scientific update deleted successfully');
      loadUpdates();
    } catch (error) {
      console.error('Error deleting scientific update:', error);
      setError('Failed to delete scientific update');
    }
  };

  const handleSaveUpdate = async (updateData: any) => {
    try {
      if (editingUpdate) {
        await scientificUpdateService.updateUpdate(editingUpdate.id, updateData);
        setSuccess('Scientific update updated successfully');
      } else {
        await scientificUpdateService.createUpdate(updateData);
        setSuccess('Scientific update created successfully');
      }
      setShowEditor(false);
      setEditingUpdate(null);
      loadUpdates();
    } catch (error) {
      console.error('Error saving scientific update:', error);
      setError('Failed to save scientific update');
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingUpdate(null);
  };

  // Filter and sort updates
  const filteredAndSortedUpdates = updates
    .filter(update => {
      const matchesSearch = update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           update.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           update.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || update.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'publishedDate':
          aValue = a.publishedDate.toDate();
          bValue = b.publishedDate.toDate();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'votes':
          aValue = a.votes || 0;
          bValue = b.votes || 0;
          break;
        case 'readCount':
          aValue = a.readCount || 0;
          bValue = b.readCount || 0;
          break;
        default:
          aValue = a.publishedDate.toDate();
          bValue = b.publishedDate.toDate();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStats = () => {
    const totalUpdates = updates.length;
    const totalVotes = updates.reduce((sum, update) => sum + (update.votes || 0), 0);
    const totalReads = updates.reduce((sum, update) => sum + (update.readCount || 0), 0);
    const totalShares = updates.reduce((sum, update) => sum + (update.shareCount || 0), 0);
    
    return { totalUpdates, totalVotes, totalReads, totalShares };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Scientific Evidence Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateUpdate}
          >
            Create New Update
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                {stats.totalUpdates}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Updates
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                {stats.totalVotes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Votes
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                {stats.totalReads}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reads
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                {stats.totalShares}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Shares
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search updates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="publishedDate">Published Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="votes">Votes</MenuItem>
                  <MenuItem value="readCount">Reads</MenuItem>
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<Sort />}
              >
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Updates List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Scientific Updates ({filteredAndSortedUpdates.length})
            </Typography>
            
            {filteredAndSortedUpdates.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No scientific updates found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first scientific update to get started'
                  }
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredAndSortedUpdates.map((update, index) => (
                  <React.Fragment key={update.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                            {update.title}
                          </Typography>
                          <Chip label={update.category} size="small" color="primary" />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {update.summary}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Published: {update.publishedDate.toDate().toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {update.keyFindings?.length || 0} key findings
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          {update.tags?.slice(0, 3).map(tag => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                          {update.tags?.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{update.tags.length - 3} more
                            </Typography>
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ThumbUp sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              {update.votes || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Visibility sx={{ fontSize: 16, color: 'info.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              {update.readCount || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Share sx={{ fontSize: 16, color: 'warning.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              {update.shareCount || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Update">
                            <IconButton
                              size="small"
                              onClick={() => handleViewUpdate(update)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Update">
                            <IconButton
                              size="small"
                              onClick={() => handleEditUpdate(update)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Update">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUpdate(update.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < filteredAndSortedUpdates.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Scientific Update Editor Dialog */}
        {showEditor && (
          <Dialog
            open={showEditor}
            onClose={handleCancelEdit}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editingUpdate ? 'Edit Scientific Update' : 'Create New Scientific Update'}
            </DialogTitle>
            <DialogContent>
              <ScientificUpdateEditor
                updateId={editingUpdate?.id}
                updateData={editingUpdate}
                onSave={handleSaveUpdate}
                onCancel={handleCancelEdit}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* View Update Dialog */}
        <Dialog
          open={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedUpdate?.title}
          </DialogTitle>
          <DialogContent>
            {selectedUpdate && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedUpdate.summary}
                </Typography>
                
                {selectedUpdate.keyFindings && selectedUpdate.keyFindings.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Key Findings:
                    </Typography>
                    <List dense>
                      {selectedUpdate.keyFindings.map((finding, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemText primary={finding} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {selectedUpdate.fullReview && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Full Review:
                    </Typography>
                    <Typography variant="body2">
                      {selectedUpdate.fullReview}
                    </Typography>
                  </Box>
                )}
                
                {selectedUpdate.implications && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Implications:
                    </Typography>
                    <Typography variant="body2">
                      {selectedUpdate.implications}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {selectedUpdate.tags?.map(tag => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
                
                {selectedUpdate.externalLink && (
                  <Button
                    variant="outlined"
                    href={selectedUpdate.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View External Source
                  </Button>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedUpdate && (
              <Button
                variant="contained"
                onClick={() => {
                  setShowViewDialog(false);
                  handleEditUpdate(selectedUpdate);
                }}
              >
                Edit
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminScientificUpdates; 