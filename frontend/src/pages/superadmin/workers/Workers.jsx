import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getWorkers, createWorker, updateWorker, deleteWorker, getWorkerStats } from '../../../services/superadmin/workersAPI';
import './Workers.css';

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#795548'];

const WorkerForm = ({ open, handleClose, worker, handleSubmit, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phoneNo: '',
    address: '',
    role: '',
    store: '',
    aadharNo: ''
  });

  useEffect(() => {
    if (worker) {
      setFormData(worker);
    }
  }, [worker]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '16px',
          padding: '16px'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: '#5E35B1',
          '& .MuiSvgIcon-root': {
            fontSize: '2rem'
          }
        }}>
          {mode === 'add' ? <AddIcon /> : <EditIcon />}
          <Typography variant="h5" component="span" fontWeight="600">
            {mode === 'add' ? 'Add New Worker' : 'Edit Worker'}
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleFormSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: '8px',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5E35B1',
                      },
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: '8px',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5E35B1',
                      },
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: '8px',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5E35B1',
                      },
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Aadhar Number"
                name="aadharNo"
                value={formData.aadharNo}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: '8px',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5E35B1',
                      },
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: '8px',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5E35B1',
                      },
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel>Store</InputLabel>
                <Select
                  name="store"
                  value={formData.store}
                  onChange={handleChange}
                  label="Store"
                  sx={{
                    borderRadius: '8px',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5E35B1',
                      },
                    },
                  }}
                >
                  <MenuItem value="entrepreneur 1">Entrepreneur 1</MenuItem>
                  <MenuItem value="entrepreneur 3">Entrepreneur 3</MenuItem>
                  <MenuItem value="entrepreneur 2">Entrepreneur 2</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                  sx={{
                    borderRadius: '8px',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5E35B1',
                      },
                    },
                  }}
                >
                  <MenuItem value="Store Manager">Store Manager</MenuItem>
                  <MenuItem value="Sales Associate">Sales Associate</MenuItem>
                  <MenuItem value="Cashier">Cashier</MenuItem>
                  <MenuItem value="Inventory Manager">Inventory Manager</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              borderColor: '#5E35B1',
              color: '#5E35B1',
              '&:hover': {
                borderColor: '#4527A0',
                backgroundColor: 'rgba(94, 53, 177, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{
              borderRadius: '8px',
              backgroundColor: '#5E35B1',
              '&:hover': {
                backgroundColor: '#4527A0',
              },
              px: 4,
            }}
          >
            {mode === 'add' ? 'Add Worker' : 'Update Worker'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterStore, setFilterStore] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = {
        search,
        store: filterStore,
        role: filterRole
      };
      const [workersData, statsData] = await Promise.all([
        getWorkers(filters),
        getWorkerStats()
      ]);
      setWorkers(workersData.workers);
      setStats(statsData);
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStore, filterRole]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddWorker = () => {
    setSelectedWorker(null);
    setFormMode('add');
    setOpenForm(true);
  };

  const handleEditWorker = (worker) => {
    setSelectedWorker(worker);
    setFormMode('edit');
    setOpenForm(true);
  };

  const handleDeleteWorker = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await deleteWorker(id);
        showSnackbar('Worker deleted successfully');
        fetchData();
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
    }
  };

  const handleSubmitWorker = async (formData) => {
    try {
      if (formMode === 'add') {
        await createWorker(formData);
        showSnackbar('Worker added successfully');
      } else {
        await updateWorker(selectedWorker._id, formData);
        showSnackbar('Worker updated successfully');
      }
      setOpenForm(false);
      fetchData();
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  return (
    <div className="workers-page">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Workers Management
        </Typography>
        
        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {stats.storeStats.map((store) => (
              <Grid item xs={12} sm={6} md={4} key={store._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {store._id}
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {store.totalWorkers}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Workers
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {store.roles.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Role Distribution Chart */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Role Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={stats.roleStats}
                          dataKey="count"
                          nameKey="_id"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {stats.roleStats.map((entry, index) => (
                            <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Store</InputLabel>
              <Select
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                label="Filter by Store"
              >
                <MenuItem value="">All Stores</MenuItem>
                <MenuItem value="entrepreneur 1">Entrepreneur 1</MenuItem>
                <MenuItem value="entrepreneur 3">Entrepreneur 3</MenuItem>
                <MenuItem value="entrepreneur 2">Entrepreneur 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Filter by Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="Store Manager">Store Manager</MenuItem>
                <MenuItem value="Sales Associate">Sales Associate</MenuItem>
                <MenuItem value="Cashier">Cashier</MenuItem>
                <MenuItem value="Inventory Manager">Inventory Manager</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddWorker}
                fullWidth
              >
                Add Worker
              </Button>
              <IconButton onClick={fetchData} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Workers Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Store</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : workers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No workers found
                  </TableCell>
                </TableRow>
              ) : (
                workers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((worker) => (
                    <TableRow key={worker._id}>
                      <TableCell>{worker.name}</TableCell>
                      <TableCell>{worker.age}</TableCell>
                      <TableCell>{worker.phoneNo}</TableCell>
                      <TableCell>
                        <Chip
                          label={worker.store}
                          color={
                            worker.store === 'entrepreneur 1'
                              ? 'primary'
                              : worker.store === 'entrepreneur 3'
                              ? 'success'
                              : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={worker.role} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditWorker(worker)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteWorker(worker._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={workers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {/* Worker Form Dialog */}
      <WorkerForm
        open={openForm}
        handleClose={() => setOpenForm(false)}
        worker={selectedWorker}
        handleSubmit={handleSubmitWorker}
        mode={formMode}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Workers;
