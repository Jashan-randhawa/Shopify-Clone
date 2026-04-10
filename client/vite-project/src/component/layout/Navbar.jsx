import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge,
  Box, Avatar, Menu, MenuItem, Divider, InputBase, Container,
  Paper, List, ListItem, ListItemText, ListItemAvatar,
  Chip, CircularProgress, Fade, useScrollTrigger
} from '@mui/material';
import {
  ShoppingCart, Search, ShoppingBag, Close,
  TrendingUp, History, ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { fetchProducts } from '../../utils/dummyjson';

const TRENDING = ['smartphones', 'laptops', 'skincare', 'fragrances', 'furniture'];

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);

  // ── Search state ──────────────────────────────────────────────────────────
  const [query, setQuery]           = useState('');
  const [focused, setFocused]       = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSug, setLoadingSug] = useState(false);
  const [history, setHistory]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('search_history') || '[]'); } catch { return []; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const inputRef  = useRef(null);
  const boxRef    = useRef(null);
  const debouncedQuery = useDebounce(query, 280);

  const elevated = useScrollTrigger({ disableHysteresis: true, threshold: 10 });

  // ── Fetch live suggestions ────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery.trim()) { setSuggestions([]); return; }
    setLoadingSug(true);
    fetchProducts({ search: debouncedQuery, limit: 5 })
      .then(d => setSuggestions(d.products || []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSug(false));
  }, [debouncedQuery]);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setFocused(false);
        setSelectedIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Save to history ───────────────────────────────────────────────────────
  const saveHistory = useCallback((term) => {
    const updated = [term, ...history.filter(h => h !== term)].slice(0, 6);
    setHistory(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));
  }, [history]);

  // ── Navigate to search results ────────────────────────────────────────────
  const doSearch = useCallback((term) => {
    const t = (term || query).trim();
    if (!t) return;
    saveHistory(t);
    setFocused(false);
    setQuery('');
    setMobileOpen(false);
    navigate(`/products?search=${encodeURIComponent(t)}`);
  }, [query, navigate, saveHistory]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    const items = suggestions.length ? suggestions : [];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx >= 0 && items[selectedIdx]) {
        doSearch(items[selectedIdx].name);
      } else {
        doSearch();
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
      setSelectedIdx(-1);
      inputRef.current?.blur();
    }
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem('search_history');
  };

  const showDropdown = focused && (query.trim() ? true : history.length > 0 || TRENDING.length > 0);

  // ── Shared search input ───────────────────────────────────────────────────
  const SearchBox = ({ sx = {} }) => (
    <Box ref={boxRef} sx={{ position: 'relative', flex: 1, ...sx }}>
      <Box sx={{
        display: 'flex', alignItems: 'center',
        bgcolor: focused ? 'white' : '#f5f5f5',
        borderRadius: showDropdown ? '12px 12px 0 0' : 2,
        px: 2, py: 0.6,
        border: '1.5px solid',
        borderColor: focused ? '#1a237e' : 'transparent',
        transition: 'all 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(26,35,126,0.08)' : 'none',
      }}>
        {loadingSug
          ? <CircularProgress size={18} sx={{ mr: 1, color: '#1a237e' }} />
          : <Search sx={{ color: focused ? '#1a237e' : 'text.secondary', mr: 1, fontSize: 20, flexShrink: 0 }} />
        }
        <InputBase
          inputRef={inputRef}
          placeholder="Search products, brands, categories…"
          fullWidth
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedIdx(-1); }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          sx={{ fontSize: '0.9rem' }}
        />
        {query && (
          <IconButton size="small" onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
            sx={{ p: 0.3, color: 'text.secondary' }}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* ── Dropdown ── */}
      <Fade in={showDropdown}>
        <Paper elevation={8} sx={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1400,
          borderRadius: '0 0 12px 12px', border: '1.5px solid #1a237e',
          borderTop: 'none', maxHeight: 440, overflowY: 'auto',
        }}>
          {/* Live product suggestions */}
          {query.trim() && suggestions.length > 0 && (
            <>
              <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
                  Products
                </Typography>
              </Box>
              <List dense disablePadding>
                {suggestions.map((p, i) => (
                  <ListItem key={p._id} button
                    selected={selectedIdx === i}
                    onClick={() => { navigate(`/products/${p._id}`); setFocused(false); setQuery(''); }}
                    sx={{
                      px: 2, py: 0.8, cursor: 'pointer',
                      '&.Mui-selected': { bgcolor: '#e8eaf6' },
                      '&:hover': { bgcolor: '#f3f4ff' }
                    }}>
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Box component="img"
                        src={p.images?.[0] || p.thumbnail}
                        alt={p.name}
                        sx={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 1 }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={600} noWrap>{p.name}</Typography>}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="#1a237e" fontWeight={700}>${p.price}</Typography>
                          <Typography variant="caption" color="text.secondary" textTransform="capitalize">{p.category}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Divider />
              {/* Search all */}
              <ListItem button onClick={() => doSearch()} sx={{
                px: 2, py: 1, cursor: 'pointer', color: '#1a237e',
                '&:hover': { bgcolor: '#f3f4ff' }
              }}>
                <Search sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2" fontWeight={600}>
                  Search all results for "<strong>{query}</strong>"
                </Typography>
                <ArrowForward sx={{ fontSize: 14, ml: 'auto' }} />
              </ListItem>
            </>
          )}

          {/* No results */}
          {query.trim() && !loadingSug && suggestions.length === 0 && (
            <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No products found for "<strong>{query}</strong>"</Typography>
              <Button size="small" onClick={() => doSearch()} sx={{ mt: 1, color: '#1a237e' }}>
                Search anyway
              </Button>
            </Box>
          )}

          {/* History */}
          {!query.trim() && history.length > 0 && (
            <>
              <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
                  Recent
                </Typography>
                <Button size="small" onClick={clearHistory} sx={{ fontSize: '0.7rem', color: 'text.secondary', minWidth: 0 }}>
                  Clear
                </Button>
              </Box>
              <Box sx={{ px: 2, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {history.map(h => (
                  <Chip key={h} icon={<History sx={{ fontSize: '14px !important' }} />}
                    label={h} size="small" variant="outlined"
                    onClick={() => doSearch(h)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#e8eaf6', borderColor: '#1a237e' } }}
                  />
                ))}
              </Box>
              <Divider />
            </>
          )}

          {/* Trending */}
          {!query.trim() && (
            <>
              <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
                  🔥 Trending
                </Typography>
              </Box>
              <Box sx={{ px: 2, pb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {TRENDING.map(t => (
                  <Chip key={t} icon={<TrendingUp sx={{ fontSize: '14px !important' }} />}
                    label={t} size="small"
                    onClick={() => navigate(`/products?category=${t}`)}
                    sx={{
                      cursor: 'pointer', textTransform: 'capitalize',
                      bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 600,
                      '&:hover': { bgcolor: '#c5cae9' }
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Paper>
      </Fade>
    </Box>
  );

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="fixed" elevation={elevated ? 4 : 0} sx={{
        bgcolor: 'white',
        borderBottom: elevated ? 'none' : '1px solid #e0e0e0',
        color: 'text.primary',
        transition: 'box-shadow 0.2s',
      }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mr: 2, flexShrink: 0 }}
              onClick={() => navigate('/')}>
              <ShoppingBag sx={{ color: '#1a237e', fontSize: 28 }} />
              <Typography variant="h6" fontWeight={800} sx={{ color: '#1a237e', letterSpacing: -0.5 }}>
                ShopHub
              </Typography>
            </Box>

            {/* Desktop Search */}
            <SearchBox sx={{ display: { xs: 'none', md: 'flex' } }} />

            {/* Nav Links */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5, flexShrink: 0 }}>
              <Button onClick={() => navigate('/products')}
                sx={{ color: 'text.primary', fontWeight: 600, '&:hover': { color: '#1a237e', bgcolor: '#e8eaf6' } }}>
                Products
              </Button>
            </Box>

            {/* Mobile search toggle */}
            <IconButton onClick={() => { setMobileOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#1a237e' }}>
              {mobileOpen ? <Close /> : <Search />}
            </IconButton>

            {/* Cart */}
            <IconButton onClick={() => navigate('/cart')} sx={{ color: '#1a237e', flexShrink: 0 }}>
              <Badge badgeContent={cartCount} color="error" max={99}>
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* User Menu */}
            {user ? (
              <>
                <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1a237e', fontSize: '0.9rem' }}>
                    {user.name?.[0]?.toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                  PaperProps={{ elevation: 8, sx: { mt: 1, minWidth: 180, borderRadius: 2 } }}>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography fontWeight={700} variant="body2">{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>My Profile</MenuItem>
                  <MenuItem onClick={() => { setAnchorEl(null); navigate('/orders'); }}>My Orders</MenuItem>
                  {user.role === 'admin' && (
                    <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin'); }}
                      sx={{ color: '#1a237e', fontWeight: 700 }}>Admin Dashboard</MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: '#e53935' }}>Sign Out</MenuItem>
                </Menu>
              </>
            ) : (
              <Button variant="contained" onClick={() => navigate('/login')}
                sx={{ bgcolor: '#1a237e', fontWeight: 700, flexShrink: 0, '&:hover': { bgcolor: '#283593' }, borderRadius: 2 }}>
                Sign In
              </Button>
            )}
          </Toolbar>
        </Container>

        {/* Mobile search bar */}
        <Fade in={mobileOpen}>
          <Box sx={{
            display: { xs: mobileOpen ? 'flex' : 'none', md: 'none' },
            px: 2, pb: 1.5, borderTop: '1px solid #eee'
          }}>
            <SearchBox sx={{ flex: 1 }} />
          </Box>
        </Fade>
      </AppBar>

      {/* Overlay to close dropdown */}
      {focused && (
        <Box sx={{
          position: 'fixed', inset: 0, zIndex: 1150,
          bgcolor: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(1px)'
        }} onClick={() => { setFocused(false); setQuery(''); }} />
      )}
    </>
  );
};

export default Navbar;
