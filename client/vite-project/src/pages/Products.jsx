import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Grid, Skeleton, Select, MenuItem,
  FormControl, InputLabel, Chip, Slider, Button, Drawer, IconButton,
  InputAdornment, Pagination, Divider, Paper, Rating, Collapse,
  Badge, Stack, Tooltip, Fade, TextField
} from '@mui/material';
import {
  Close, TuneOutlined, ExpandMore, ExpandLess,
  FilterListOff, CheckCircle
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../utils/dummyjson';
import ProductCard from '../component/shared/ProductCard';
import Navbar from '../component/layout/Navbar';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price',      label: 'Price: Low to High' },
  { value: '-price',     label: 'Price: High to Low' },
  { value: '-ratings',   label: 'Top Rated' },
  { value: '-sold',      label: 'Best Selling' },
];

const MIN_PRICE = 0;
const MAX_PRICE = 1000;

// ── Collapsible section used inside the filter panel ─────────────────────────
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', py: 1.5 }} onClick={() => setOpen(o => !o)}>
        <Typography fontWeight={700} variant="body2">{title}</Typography>
        {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
      </Box>
      <Collapse in={open}>{children}</Collapse>
    </Box>
  );
};

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ─────────────────────────────────────────────────────────────────
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [categories, setCategories] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter values (live = what the user is editing in the panel)
  const [search, setSearch]           = useState(searchParams.get('search') || '');
  const [selectedCats, setSelectedCats] = useState(() => {
    const c = searchParams.get('category');
    return c && c !== 'all' ? [c] : [];
  });
  const [sort, setSort]               = useState(searchParams.get('sort') || '-createdAt');
  const [priceRange, setPriceRange]   = useState([MIN_PRICE, MAX_PRICE]);
  const [minRating, setMinRating]     = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage]               = useState(1);

  // "Applied" snapshot — what's actually been sent to the API
  const [applied, setApplied] = useState({
    search, selectedCats: [...selectedCats], sort,
    priceRange: [MIN_PRICE, MAX_PRICE], minRating: 0, inStockOnly: false,
  });

  // ── Load categories once ─────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories()
      .then(cats => setCategories(cats))
      .catch(() => {});
  }, []);

  // ── Sync URL → state when URL changes externally (e.g. Navbar search) ────
  useEffect(() => {
    const s    = searchParams.get('search')   || '';
    const c    = searchParams.get('category') || '';
    const so   = searchParams.get('sort')     || '-createdAt';
    const cats = c && c !== 'all' ? [c] : [];
    setSearch(s);
    setSelectedCats(cats);
    setSort(so);
    setPage(1);
    // Update applied immediately so loadProducts fires without waiting for Apply
    setApplied(prev => ({ ...prev, search: s, selectedCats: cats, sort: so }));
  // searchParams.toString() as dep ensures this runs on every URL change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // ── Fetch products whenever applied filters change ────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        search:   applied.search,
        category: applied.selectedCats.length === 1 ? applied.selectedCats[0] : 'all',
        sort:     applied.sort,
        page,
        limit: 12,
        minPrice: applied.priceRange[0] > MIN_PRICE ? applied.priceRange[0] : 0,
        maxPrice: applied.priceRange[1] < MAX_PRICE ? applied.priceRange[1] : Infinity,
      });
      // Client-side rating / stock filter (backend may not support these)
      let filtered = data.products || [];
      if (applied.minRating > 0)   filtered = filtered.filter(p => (p.ratings || 0) >= applied.minRating);
      if (applied.inStockOnly)     filtered = filtered.filter(p => (p.stock || 0) > 0);
      setProducts(filtered);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [applied, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Apply filters ─────────────────────────────────────────────────────────
  const applyFilters = () => {
    setApplied({ search, selectedCats: [...selectedCats], sort, priceRange, minRating, inStockOnly });
    setPage(1);
    setFilterOpen(false);
    // Sync URL
    const p = {};
    if (search) p.search = search;
    if (selectedCats.length === 1) p.category = selectedCats[0];
    if (sort !== '-createdAt') p.sort = sort;
    setSearchParams(p);
  };

  // ── Reset all filters ─────────────────────────────────────────────────────
  const resetAll = () => {
    setSearch(''); setSelectedCats([]); setSort('-createdAt');
    setPriceRange([MIN_PRICE, MAX_PRICE]); setMinRating(0); setInStockOnly(false);
    const blank = { search: '', selectedCats: [], sort: '-createdAt',
      priceRange: [MIN_PRICE, MAX_PRICE], minRating: 0, inStockOnly: false };
    setApplied(blank);
    setPage(1);
    setSearchParams({});
    setFilterOpen(false);
  };

  // ── Toggle a category chip ────────────────────────────────────────────────
  const toggleCat = (cat) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // ── Active filter count (badge on mobile button) ──────────────────────────
  const activeCount = [
    applied.selectedCats.length > 0,
    applied.priceRange[0] > MIN_PRICE || applied.priceRange[1] < MAX_PRICE,
    applied.minRating > 0,
    applied.inStockOnly,
  ].filter(Boolean).length;

  // ── Active filter chips (below search bar) ────────────────────────────────
  const ActiveChips = () => {
    const chips = [];
    if (applied.search)
      chips.push({ label: `"${applied.search}"`, onDelete: () => { setSearch(''); setApplied(p => ({ ...p, search: '' })); } });
    applied.selectedCats.forEach(c =>
      chips.push({ label: c, onDelete: () => setApplied(p => ({ ...p, selectedCats: p.selectedCats.filter(x => x !== c) })) })
    );
    if (applied.priceRange[0] > MIN_PRICE || applied.priceRange[1] < MAX_PRICE)
      chips.push({ label: `$${applied.priceRange[0]}–$${applied.priceRange[1]}`, onDelete: () => setApplied(p => ({ ...p, priceRange: [MIN_PRICE, MAX_PRICE] })) });
    if (applied.minRating > 0)
      chips.push({ label: `${applied.minRating}★ & up`, onDelete: () => setApplied(p => ({ ...p, minRating: 0 })) });
    if (applied.inStockOnly)
      chips.push({ label: 'In Stock', onDelete: () => setApplied(p => ({ ...p, inStockOnly: false })) });

    if (chips.length === 0) return null;
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {chips.map((ch, i) => (
          <Chip key={i} label={ch.label} onDelete={ch.onDelete} size="small"
            sx={{ bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 600,
              '& .MuiChip-deleteIcon': { color: '#1a237e' }, textTransform: 'capitalize' }} />
        ))}
        <Chip label="Clear all" onClick={resetAll} size="small" variant="outlined"
          icon={<FilterListOff sx={{ fontSize: '14px !important', color: '#e53935 !important' }} />}
          sx={{ borderColor: '#e53935', color: '#e53935', fontWeight: 600,
            '& .MuiChip-icon': { color: '#e53935' } }} />
      </Stack>
    );
  };

  // ── Filter panel content (shared between sidebar + drawer) ───────────────
  const FilterPanel = () => (
    <Box sx={{ p: 3, width: { xs: 300, md: '100%' } }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography fontWeight={800} variant="h6">Filters</Typography>
        <Button size="small" onClick={resetAll} sx={{ color: '#e53935', fontSize: '0.75rem' }}
          startIcon={<FilterListOff fontSize="small" />}>
          Reset
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Categories */}
      <FilterSection title="Category">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, pb: 1.5 }}>
          {categories.map(cat => {
            const active = selectedCats.includes(cat);
            return (
              <Chip key={cat} label={cat}
                onClick={() => toggleCat(cat)}
                icon={active ? <CheckCircle sx={{ fontSize: '14px !important', color: 'white !important' }} /> : undefined}
                variant={active ? 'filled' : 'outlined'}
                size="small"
                sx={{
                  cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600,
                  transition: 'all 0.15s',
                  ...(active
                    ? { bgcolor: '#1a237e', color: 'white', borderColor: '#1a237e' }
                    : { '&:hover': { bgcolor: '#e8eaf6', borderColor: '#1a237e', color: '#1a237e' } }
                  )
                }}
              />
            );
          })}
        </Box>
      </FilterSection>

      <Divider sx={{ my: 1 }} />

      {/* Price Range */}
      <FilterSection title="Price Range">
        <Box sx={{ px: 1, pb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Chip label={`$${priceRange[0]}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem', fontWeight: 700 }} />
            <Chip label={`$${priceRange[1]}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem', fontWeight: 700 }} />
          </Box>
          <Slider value={priceRange} onChange={(_, v) => setPriceRange(v)}
            min={MIN_PRICE} max={MAX_PRICE} step={10}
            sx={{ color: '#1a237e', '& .MuiSlider-thumb': { '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 8px rgba(26,35,126,0.16)' } } }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField size="small" label="Min" type="number"
              value={priceRange[0]}
              onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 10), priceRange[1]])}
              inputProps={{ min: MIN_PRICE, max: priceRange[1] - 10 }}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#1a237e' } } }}
            />
            <TextField size="small" label="Max" type="number"
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 10)])}
              inputProps={{ min: priceRange[0] + 10, max: MAX_PRICE }}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#1a237e' } } }}
            />
          </Box>
        </Box>
      </FilterSection>

      <Divider sx={{ my: 1 }} />

      {/* Minimum Rating */}
      <FilterSection title="Minimum Rating">
        <Box sx={{ pb: 1.5 }}>
          {[4, 3, 2, 1].map(r => (
            <Box key={r} sx={{
              display: 'flex', alignItems: 'center', gap: 1, py: 0.6, px: 1,
              borderRadius: 1.5, cursor: 'pointer', transition: 'all 0.15s',
              bgcolor: minRating === r ? '#e8eaf6' : 'transparent',
              border: '1.5px solid', borderColor: minRating === r ? '#1a237e' : 'transparent',
              '&:hover': { bgcolor: '#f3f4ff' }
            }} onClick={() => setMinRating(prev => prev === r ? 0 : r)}>
              <Rating value={r} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
              <Typography variant="caption" fontWeight={minRating === r ? 700 : 400} color={minRating === r ? '#1a237e' : 'text.secondary'}>
                & up
              </Typography>
              {minRating === r && <CheckCircle sx={{ fontSize: 14, color: '#1a237e', ml: 'auto' }} />}
            </Box>
          ))}
        </Box>
      </FilterSection>

      <Divider sx={{ my: 1 }} />

      {/* In Stock */}
      <FilterSection title="Availability" defaultOpen={true}>
        <Box sx={{ pb: 1.5 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            py: 0.8, px: 1, borderRadius: 1.5, cursor: 'pointer',
            bgcolor: inStockOnly ? '#e8eaf6' : 'transparent',
            border: '1.5px solid', borderColor: inStockOnly ? '#1a237e' : 'transparent',
            '&:hover': { bgcolor: '#f3f4ff' }, transition: 'all 0.15s'
          }} onClick={() => setInStockOnly(o => !o)}>
            <Typography variant="body2" fontWeight={inStockOnly ? 700 : 400} color={inStockOnly ? '#1a237e' : 'inherit'}>
              In Stock Only
            </Typography>
            {inStockOnly && <CheckCircle sx={{ fontSize: 16, color: '#1a237e' }} />}
          </Box>
        </Box>
      </FilterSection>

      {/* Apply button */}
      <Button fullWidth variant="contained" onClick={applyFilters}
        sx={{ mt: 2, bgcolor: '#1a237e', fontWeight: 700, borderRadius: 2, py: 1.2,
          '&:hover': { bgcolor: '#283593' } }}>
        Apply Filters
      </Button>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>

        {/* Page heading */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={800} mb={0.5} textTransform="capitalize">
            {applied.selectedCats.length === 1 ? applied.selectedCats[0]
              : applied.selectedCats.length > 1 ? 'Multiple Categories'
              : applied.search ? `Results for "${applied.search}"`
              : 'All Products'}
          </Typography>
          <Typography color="text.secondary">{loading ? '...' : `${total} products found`}</Typography>
        </Box>

        {/* Sort + Filter controls (search is handled by Navbar) */}
        <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap',
          border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <FormControl size="small" sx={{ minWidth: 190, ml: 'auto' }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sort} label="Sort By" onChange={e => { setSort(e.target.value); setApplied(p => ({ ...p, sort: e.target.value })); setPage(1); }}>
              {SORT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Mobile filter button */}
          <Tooltip title="Filters">
            <Badge badgeContent={activeCount} color="error"
              sx={{ display: { md: 'none' }, '& .MuiBadge-badge': { right: 4, top: 4 } }}>
              <Button startIcon={<TuneOutlined />} onClick={() => setFilterOpen(true)}
                variant={activeCount > 0 ? 'contained' : 'outlined'}
                sx={{
                  color: activeCount > 0 ? 'white' : '#1a237e',
                  borderColor: '#1a237e',
                  bgcolor: activeCount > 0 ? '#1a237e' : 'transparent',
                  '&:hover': { bgcolor: activeCount > 0 ? '#283593' : '#e8eaf6' }
                }}>
                Filters
              </Button>
            </Badge>
          </Tooltip>
        </Paper>

        {/* Active filter chips */}
        <ActiveChips />

        <Grid container spacing={3}>
          {/* Desktop Sidebar */}
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, position: 'sticky', top: 80 }}>
              <FilterPanel />
            </Paper>
          </Grid>

          {/* Products Grid */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              {loading
                ? Array(9).fill(0).map((_, i) => (
                  <Grid item xs={12} sm={6} lg={4} key={i}>
                    <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                    <Skeleton height={30} sx={{ mt: 1 }} />
                    <Skeleton height={20} width="60%" />
                  </Grid>
                ))
                : products.map(product => (
                  <Grid item xs={12} sm={6} lg={4} key={product._id}>
                    <Fade in timeout={300}>
                      <Box><ProductCard product={product} /></Box>
                    </Fade>
                  </Grid>
                ))
              }

              {!loading && products.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography variant="h2" mb={2}>🔍</Typography>
                    <Typography variant="h6" fontWeight={700} mb={1}>No products found</Typography>
                    <Typography color="text.secondary" mb={3}>Try adjusting your search or filters</Typography>
                    <Button onClick={resetAll} variant="contained"
                      startIcon={<FilterListOff />}
                      sx={{ bgcolor: '#1a237e', borderRadius: 2 }}>
                      Clear All Filters
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>

            {pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination count={pages} page={page}
                  onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  color="primary"
                  sx={{ '& .Mui-selected': { bgcolor: '#1a237e !important', color: 'white' } }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer anchor="left" open={filterOpen} onClose={() => setFilterOpen(false)}
        PaperProps={{ sx: { borderRadius: '0 16px 16px 0' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pt: 2.5 }}>
          <Typography fontWeight={800} variant="h6">Filters</Typography>
          <IconButton onClick={() => setFilterOpen(false)}><Close /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <FilterPanel />
        </Box>
      </Drawer>
    </Box>
  );
};

export default Products;
