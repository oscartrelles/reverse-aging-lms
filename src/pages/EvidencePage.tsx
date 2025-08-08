import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Link,
  Snackbar,
} from '@mui/material';
import {
  Search,
  FilterList,
  ThumbUp,
  ThumbUpOutlined,
  Science,
  AccessTime,
  Visibility,
  TrendingUp,
  Close,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { scientificUpdateService } from '../services/scientificUpdateService';
import { userProfileService } from '../services/userProfileService';
import { ScientificUpdate } from '../types';
import { format } from 'date-fns';
import { useEvidencePageSEO } from '../hooks/useSEO';
import { seoService } from '../services/seoService';
import SocialSharing from '../components/SocialSharing';

const EvidencePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showAuthModal } = useAuthModal();
  const { updateId } = useParams<{ updateId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // SEO setup
  useEvidencePageSEO();
  
  // State management
  const [updates, setUpdates] = useState<ScientificUpdate[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<ScientificUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // SEO for specific article
  useEffect(() => {
    if (selectedUpdate) {
      seoService.setupPageSEO({
        title: `${selectedUpdate.title} - Scientific Evidence`,
        description: selectedUpdate.summary,
        canonicalPath: `/evidence/${selectedUpdate.id}`,
        type: 'article',
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Scientific Evidence', url: '/evidence' },
          { name: selectedUpdate.title, url: `/evidence/${selectedUpdate.id}` }
        ]
      });
      
      seoService.addArticleSchema({
        title: selectedUpdate.title,
        description: selectedUpdate.summary,
        url: `/evidence/${selectedUpdate.id}`,
        author: 'The Reverse Aging Academy',
        datePublished: selectedUpdate.publishedDate.toDate().toISOString(),
        dateModified: selectedUpdate.publishedDate.toDate().toISOString()
      });
    }
  }, [selectedUpdate]);
  
  // Filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Categories and tags
  const categories = [
    'all',
    'Mindset',
    'Nourishment',
    'Breath',
    'Cold',
    'Heat',
    'Movement',
    'Community'
  ];
  
  const availableTags = [
    'longevity',
    'aging',
    'metabolism',
    'inflammation',
    'autophagy',
    'mitochondria',
    'telomeres',
    'hormones',
    'sleep',
    'stress',
    'exercise',
    'nutrition',
    'supplements',
    'fasting',
    'cold-exposure',
    'heat-therapy',
    'breathing',
    'meditation'
  ];

  // Handle URL parameters for filtering
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const tagParam = searchParams.get('tag');
    
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
    
    if (tagParam && !selectedTags.includes(tagParam)) {
      setSelectedTags([tagParam]);
      // Show filters when tags are present in URL
      setShowFilters(true);
    }
  }, [location.search]);

  // Load updates when filters change
  useEffect(() => {
    if (!updateId) {
      loadUpdates();
    }
  }, [selectedCategory, selectedTags, searchTerm]);

  // Load updates on mount and update last evidence check
  useEffect(() => {
    loadUpdates();
    
    // Update last evidence check timestamp when user visits the evidence page
    if (currentUser?.id) {
      userProfileService.updateLastEvidenceCheck(currentUser.id)
        .catch(error => {
          console.error('Failed to update last evidence check:', error);
        });
    }
  }, [currentUser?.id]);

  // Handle deep link to specific update
  useEffect(() => {
    if (updateId) {
      loadSpecificUpdate(updateId);
    }
  }, [updateId]);

  // Handle URL changes for deep links
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const urlUpdateId = pathSegments[pathSegments.length - 1];
    
    if (urlUpdateId && urlUpdateId !== 'evidence' && urlUpdateId !== updateId) {
      // This handles cases where the URL changes but the component doesn't remount
      loadSpecificUpdate(urlUpdateId);
    }
  }, [location.pathname]);

  // Show auth modal for unauthenticated users on deep links
  useEffect(() => {
    if (updateId && !currentUser) {
      // Show auth modal after a short delay to let the content load first
      const timer = setTimeout(() => {
        showAuthModal('signup', 'Join Our Community', 'You\'re viewing scientific evidence. Create a free account to vote, track your progress, and access exclusive content.');
      }, 2000); // 2 second delay
      
      return () => clearTimeout(timer);
    }
  }, [updateId, currentUser, showAuthModal]);

  const updateURL = () => {
    const searchParams = new URLSearchParams();
    
    if (selectedCategory !== 'all') {
      searchParams.set('category', selectedCategory);
    }
    
    if (selectedTags.length > 0) {
      searchParams.set('tag', selectedTags[0]); // For simplicity, use the first tag
    }
    
    const newURL = searchParams.toString() ? `/evidence?${searchParams.toString()}` : '/evidence';
    
    // Only navigate if we're not already on the evidence page or if the URL is different
    if (location.pathname !== '/evidence' || location.search !== `?${searchParams.toString()}`) {
      navigate(newURL, { replace: true });
    }
  };

  const loadUpdates = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      
      if (selectedTags.length > 0) {
        filters.tags = selectedTags;
      }
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const updatesData = await scientificUpdateService.getAllUpdates(filters);
      setUpdates(updatesData);
    } catch (error) {
      console.error('Error loading updates:', error);
      setError('Failed to load scientific updates');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecificUpdate = async (id: string) => {
    try {
      setLoadingUpdate(true);
      const update = await scientificUpdateService.getUpdateById(id);
      if (update) {
        setSelectedUpdate(update);
        
        // Mark as read if user is authenticated
        if (currentUser) {
          await scientificUpdateService.markAsRead(id, currentUser.id);
        }
      } else {
        setError('Scientific update not found');
      }
    } catch (error) {
      console.error('Error loading specific update:', error);
      setError('Failed to load scientific update');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleVote = async (updateId: string) => {
    if (!currentUser) {
      showAuthModal('signup', 'Join Our Community', 'Create a free account to vote on scientific evidence and track your progress.');
      return;
    }

    try {
      // Find the update to determine current vote status
      const update = updates.find(u => u.id === updateId) || selectedUpdate;
      if (!update) return;

      const hasVoted = update.votedBy?.includes(currentUser.id) || false;
      const isUpvote = !hasVoted; // Toggle: if not voted, upvote; if voted, remove vote

      await scientificUpdateService.voteUpdate(updateId, currentUser.id, isUpvote);
      
      // Update local state without page refresh
      const updateLocalState = (updateToModify: ScientificUpdate) => {
        const newVotedBy = [...(updateToModify.votedBy || [])];
        let newVotes = updateToModify.votes || 0;
        
        if (isUpvote) {
          // Adding vote
          if (!newVotedBy.includes(currentUser.id)) {
            newVotedBy.push(currentUser.id);
            newVotes += 1;
          }
        } else {
          // Removing vote
          const index = newVotedBy.indexOf(currentUser.id);
          if (index > -1) {
            newVotedBy.splice(index, 1);
            newVotes -= 1;
          }
        }
        
        return {
          ...updateToModify,
          votes: newVotes,
          votedBy: newVotedBy
        };
      };

      // Update the updates list
      setUpdates(prevUpdates => 
        prevUpdates.map(u => 
          u.id === updateId ? updateLocalState(u) : u
        )
      );

      // Update selected update if it's the same
      if (selectedUpdate?.id === updateId) {
        setSelectedUpdate(prevSelected => 
          prevSelected ? updateLocalState(prevSelected) : null
        );
      }

      // Show success message
      setSnackbarMessage(isUpvote ? 'Vote added!' : 'Vote removed!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error voting:', error);
      setSnackbarMessage('Failed to vote. Please try again.');
      setSnackbarOpen(true);
    }
  };





  const filteredUpdates = updates.filter(update => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!update.title.toLowerCase().includes(searchLower) &&
          !update.summary.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    if (selectedCategory !== 'all' && update.category !== selectedCategory) {
      return false;
    }
    
    if (selectedTags.length > 0 && !selectedTags.some(tag => update.tags.includes(tag))) {
      return false;
    }
    
    return true;
  });

  // If viewing a specific update
  if (selectedUpdate) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Back button */}
          <Button
            startIcon={<Close />}
            onClick={() => {
              setSelectedUpdate(null);
              // Reset page title
              document.title = 'Scientific Evidence Library | Reverse Aging Challenge';
            }}
            sx={{ mb: 3 }}
          >
            Back to All Evidence
          </Button>

          {loadingUpdate ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Card>
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                  <Chip 
                    label={selectedUpdate.category}
                    color="primary"
                    sx={{ mb: 2, cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedCategory(selectedUpdate.category);
                      setSelectedUpdate(null);
                      updateURL();
                    }}
                  />
                  <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                    {selectedUpdate.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedUpdate.summary}
                  </Typography>
                  
                  {/* Meta information */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {format(selectedUpdate.publishedDate.toDate(), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Visibility sx={{ fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {selectedUpdate.readCount} reads
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp sx={{ fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {selectedUpdate.shareCount} shares
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Key Findings */}
                {selectedUpdate.keyFindings && selectedUpdate.keyFindings.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Key Findings
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedUpdate.keyFindings.map((finding: string, index: number) => (
                        <Typography key={index} variant="body1" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <span style={{ color: '#50EB97', fontSize: '1.2rem' }}>•</span>
                          {finding}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Full Review */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Full Review
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {selectedUpdate.fullReview}
                  </Typography>
                </Box>

                {/* Implications */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Implications for Health & Longevity
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {selectedUpdate.implications}
                  </Typography>
                </Box>

                {/* Tags */}
                {selectedUpdate.tags && selectedUpdate.tags.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Related Topics
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedUpdate.tags.map((tag: string) => (
                        <Chip
                          key={tag}
                          label={tag}
                          variant="outlined"
                          size="small"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedTags([tag]);
                            setSelectedUpdate(null);
                            updateURL();
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* External Link */}
                {selectedUpdate.externalLink && (
                  <Box sx={{ mb: 4 }}>
                    <Button
                      variant="outlined"
                      href={selectedUpdate.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<Link />}
                    >
                      Read Full Study
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                      Opens in a new tab - You'll be taken to an external website
                    </Typography>
                  </Box>
                )}

                {/* Action buttons */}
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                      onClick={() => handleVote(selectedUpdate.id)}
                      color={selectedUpdate.votedBy?.includes(currentUser?.id || '') ? "primary" : "default"}
                    >
                      {selectedUpdate.votedBy?.includes(currentUser?.id || '') ? (
                        <ThumbUp />
                      ) : (
                        <ThumbUpOutlined />
                      )}
                    </IconButton>
                    <Typography variant="body2">
                      {selectedUpdate.votes} helpful
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SocialSharing
                      url={`${window.location.origin}/evidence/${selectedUpdate.id}`}
                      title={selectedUpdate.title}
                      description={selectedUpdate.summary}
                      hashtags={['reverseaging', 'longevity', 'science', 'health']}
                      size="medium"
                      showLabels={false}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Scientific Evidence Library
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Stay ahead with the latest research on healthspan and longevity
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: { md: 2 } }}>
                <TextField
                  fullWidth
                  placeholder="Search scientific evidence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
              
              <Box sx={{ flex: { md: 1 } }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      updateURL();
                    }}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: { md: 1 } }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide' : 'Show'} Tags
                </Button>
              </Box>
            </Box>

            {/* Tag filters */}
            {showFilters && (
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Filter by Tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                      color={selectedTags.includes(tag) ? "primary" : "default"}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                        updateURL();
                      }}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            {updateId && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setError(null);
                    setSelectedUpdate(null);
                    navigate('/evidence');
                  }}
                >
                  Browse All Evidence
                </Button>
              </Box>
            )}
          </Alert>
        ) : filteredUpdates.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No scientific evidence found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms or filters
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {filteredUpdates.map((update) => (
              <Box key={update.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => setSelectedUpdate(update)}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={update.category}
                        color="primary"
                        size="small"
                        sx={{ mb: 1, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(update.category);
                          updateURL();
                        }}
                      />
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {update.title}
                      </Typography>
                    </Box>

                    {/* Summary */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2, 
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {update.summary}
                    </Typography>



                    {/* Tags */}
                    {update.tags && update.tags.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {update.tags.slice(0, 3).map((tag: string) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTags([tag]);
                                updateURL();
                              }}
                            />
                          ))}
                          {update.tags.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{update.tags.length - 3} more
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(update.id);
                          }}
                          color={update.votedBy?.includes(currentUser?.id || '') ? "primary" : "default"}
                        >
                          {update.votedBy?.includes(currentUser?.id || '') ? (
                            <ThumbUp sx={{ fontSize: 16 }} />
                          ) : (
                            <ThumbUpOutlined sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                        <Typography variant="caption">
                          {update.votes}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {format(update.publishedDate.toDate(), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}



        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
};

export default EvidencePage; 