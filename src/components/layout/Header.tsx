import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';

import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  School,
  Person,
  Logout,
  Science,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';

  // Check if current page is active
  const isActivePage = (path: string) => location.pathname === path;

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          mt: 1,
          minWidth: 200,
        }
      }}
    >
      <MenuItem 
        onClick={() => { handleMenuClose(); navigate('/dashboard'); }}
        sx={{
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${theme.palette.primary.main}15`,
            color: theme.palette.primary.main,
          }
        }}
      >
        <Dashboard sx={{ mr: 1, fontSize: 20 }} />
        Dashboard
      </MenuItem>
      <MenuItem 
        onClick={() => { handleMenuClose(); navigate('/profile'); }}
        sx={{
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${theme.palette.primary.main}15`,
            color: theme.palette.primary.main,
          }
        }}
      >
        <Person sx={{ mr: 1, fontSize: 20 }} />
        Profile
      </MenuItem>
      <MenuItem 
        onClick={() => { handleMenuClose(); navigate('/evidence'); }}
        sx={{
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${theme.palette.primary.main}15`,
            color: theme.palette.primary.main,
          }
        }}
      >
        <Science sx={{ mr: 1, fontSize: 20 }} />
        Evidence
      </MenuItem>
      {(currentUser?.isAdmin || currentUser?.isModerator) && (
        <MenuItem 
          onClick={() => { handleMenuClose(); navigate('/admin'); }}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
            }
          }}
        >
          <School sx={{ mr: 1, fontSize: 20 }} />
          {currentUser?.isAdmin ? 'Admin' : 'Moderator'} Dashboard
        </MenuItem>
      )}
      {currentUser?.isAdmin && (
        <MenuItem 
          onClick={() => { handleMenuClose(); navigate('/admin/users'); }}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
            }
          }}
        >
          <Person sx={{ mr: 1, fontSize: 20 }} />
          User Management
        </MenuItem>
      )}
      <MenuItem 
        onClick={handleLogout}
        sx={{
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${theme.palette.error.main}15`,
            color: theme.palette.error.main,
          }
        }}
      >
        <Logout sx={{ mr: 1, fontSize: 20 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchor}
      id={mobileMenuId}
      keepMounted
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          mt: 1,
          minWidth: 200,
        }
      }}
    >
      <MenuItem 
        onClick={() => { handleMenuClose(); navigate('/dashboard'); }}
        sx={{
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${theme.palette.primary.main}15`,
            color: theme.palette.primary.main,
          }
        }}
      >
        <Dashboard sx={{ mr: 1, fontSize: 20 }} />
        Dashboard
      </MenuItem>
      <MenuItem 
        onClick={() => { handleMenuClose(); navigate('/profile'); }}
        sx={{
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${theme.palette.primary.main}15`,
            color: theme.palette.primary.main,
          }
        }}
      >
        <Person sx={{ mr: 1, fontSize: 20 }} />
        Profile
      </MenuItem>
      <MenuItem 
        onClick={() => { handleMenuClose(); navigate('/evidence'); }}
        sx={{
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${theme.palette.primary.main}15`,
            color: theme.palette.primary.main,
          }
        }}
      >
        <Science sx={{ mr: 1, fontSize: 20 }} />
        Evidence
      </MenuItem>
      {(currentUser?.isAdmin || currentUser?.isModerator) && (
        <MenuItem 
          onClick={() => { handleMenuClose(); navigate('/admin'); }}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
            }
          }}
        >
          <School sx={{ mr: 1, fontSize: 20 }} />
          {currentUser?.isAdmin ? 'Admin' : 'Moderator'} Dashboard
        </MenuItem>
      )}
      {currentUser?.isAdmin && (
        <MenuItem 
          onClick={() => { handleMenuClose(); navigate('/admin/users'); }}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
            }
          }}
        >
          <Person sx={{ mr: 1, fontSize: 20 }} />
          User Management
        </MenuItem>
      )}
      <MenuItem 
        onClick={handleLogout}
        sx={{
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${theme.palette.error.main}15`,
            color: theme.palette.error.main,
          }
        }}
      >
        <Logout sx={{ mr: 1, fontSize: 20 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        backgroundColor: `${theme.palette.background.paper}E6`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ minHeight: 70 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.3s ease',
              borderRadius: 2,
              px: 1,
              py: 0.5,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}10`,
                transform: 'scale(1.02)',
              }
            }}
          >
            <Box
              sx={{
                position: 'relative',
                mr: 2,
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.secondary.main}30)`,
                  borderRadius: '50%',
                  zIndex: -1,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }
              }}
            >
              <img 
                src="/BF-RAC.png" 
                alt="Reverse Aging Challenge Logo"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                  transition: 'all 0.3s ease',
                }} 
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'all 0.3s ease',
              }}
            >
              The Reverse Aging Academy
            </Typography>
          </Box>
        </Box>

        {currentUser ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={mobileMenuId}
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                  color="inherit"
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}20`,
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
                {renderMobileMenu}
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/dashboard"
                  sx={{ 
                    mr: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    fontWeight: isActivePage('/dashboard') ? 600 : 400,
                    color: isActivePage('/dashboard') ? theme.palette.primary.main : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}15`,
                      transform: 'translateY(-1px)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      width: isActivePage('/dashboard') ? '100%' : '0%',
                      height: 2,
                      backgroundColor: theme.palette.primary.main,
                      transform: 'translateX(-50%)',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover::after': {
                      width: '100%',
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/evidence"
                  sx={{ 
                    mr: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    fontWeight: isActivePage('/evidence') ? 600 : 400,
                    color: isActivePage('/evidence') ? theme.palette.primary.main : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}15`,
                      transform: 'translateY(-1px)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      width: isActivePage('/evidence') ? '100%' : '0%',
                      height: 2,
                      backgroundColor: theme.palette.primary.main,
                      transform: 'translateX(-50%)',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover::after': {
                      width: '100%',
                    }
                  }}
                >
                  Evidence
                </Button>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{
                    transition: 'all 0.3s ease',
                    border: `2px solid transparent`,
                    width: 44,
                    height: 44,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}20`,
                      borderColor: theme.palette.primary.main,
                      transform: 'scale(1.05)',
                      width: 48,
                      height: 48,
                    }
                  }}
                >
                  {currentUser.photoURL ? (
                    <Avatar
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      sx={{ 
                        width: 36, 
                        height: 36,
                        border: `2px solid ${theme.palette.primary.main}30`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          width: 40,
                          height: 40,
                          border: `2px solid ${theme.palette.primary.main}`,
                        }
                      }}
                    />
                  ) : (
                    <AccountCircle sx={{ 
                      fontSize: 36,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        fontSize: 40,
                      }
                    }} />
                  )}
                </IconButton>
                {renderMenu}
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => showAuthModal(undefined, 'Welcome back!')}
              sx={{ 
                mr: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}20`,
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 