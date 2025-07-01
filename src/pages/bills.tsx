import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Receipt as BillIcon,
  Subscriptions as SubscriptionIcon,
  Notifications as ReminderIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/authContext';

// Import your existing components
import AddBillForm from '../components/AddBillForm';
import BillList from '../components/BillList';
import AddSubscriptionForm from '../components/AddSubscriptionForm';
import SubscriptionList from '../components/SubscriptionList';
import AddReminderForm from '../components/AddReminderForm';
import ReminderList from '../components/ReminderList';

// Create a light purple theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#faf7ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e1b4b',
      secondary: '#64748b',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 10px 25px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -2px rgba(139, 92, 246, 0.05)',
          borderRadius: '16px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '16px',
          fontWeight: 600,
          minHeight: '64px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#1e1b4b',
    },
    h6: {
      fontWeight: 600,
      color: '#1e1b4b',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Bills: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'bill' | 'subscription' | 'reminder'>('bill');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'bill' | 'subscription' | 'reminder') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case 'bill': return 'Add New Bill';
      case 'subscription': return 'Add New Subscription';
      case 'reminder': return 'Add New Reminder';
      default: return 'Add New Item';
    }
  };

  const getDialogComponent = () => {
    switch (dialogType) {
      case 'bill': return <AddBillForm onClose={handleCloseDialog} />;
      case 'subscription': return <AddSubscriptionForm onClose={handleCloseDialog} />;
      case 'reminder': return <AddReminderForm onClose={handleCloseDialog} />;
      default: return null;
    }
  };

  const getAddButtonType = () => {
    switch (tabValue) {
      case 0: return 'bill';
      case 1: return 'subscription';
      case 2: return 'reminder';
      default: return 'bill';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #faf7ff 0%, #f3e8ff 100%)',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Financial Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your bills, subscriptions, and reminders all in one place
            </Typography>
          </Box>

          {/* Main Content */}
          <Paper elevation={0} sx={{ overflow: 'hidden' }}>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="financial management tabs"
                sx={{ px: 3 }}
              >
                <Tab
                  icon={<BillIcon />}
                  label="Bills"
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                <Tab
                  icon={<SubscriptionIcon />}
                  label="Subscriptions"
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                <Tab
                  icon={<ReminderIcon />}
                  label="Reminders"
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box sx={{ position: 'relative' }}>
              {/* Bills Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ px: 3 }}>
                  <Stack spacing={3}>
                    {/* Bills Summary Cards */}
                    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 3 }}>
                      <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                        <Card sx={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                          <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <PaymentIcon sx={{ color: '#dc2626', fontSize: 32 }} />
                              <Box>
                                <Typography variant="h6" color="#991b1b">
                                  Pending Bills
                                </Typography>
                                <Typography variant="body2" color="#7f1d1d">
                                  Track your upcoming payments
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>
                      
                      <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                        <Card sx={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
                          <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <CheckIcon sx={{ color: '#059669', fontSize: 32 }} />
                              <Box>
                                <Typography variant="h6" color="#065f46">
                                  Paid Bills
                                </Typography>
                                <Typography variant="body2" color="#064e3b">
                                  Successfully completed payments
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                        <Card sx={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                          <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <ScheduleIcon sx={{ color: '#d97706', fontSize: 32 }} />
                              <Box>
                                <Typography variant="h6" color="#92400e">
                                  Recurring Bills
                                </Typography>
                                <Typography variant="body2" color="#78350f">
                                  Automated payment schedules
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>
                    </Stack>

                    {/* Bills List */}
                    <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff' }}>
                      <Typography variant="h6" gutterBottom>
                        Your Bills
                      </Typography>
                      <BillList />
                    </Paper>
                  </Stack>
                </Box>
              </TabPanel>

              {/* Subscriptions Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ px: 3 }}>
                  <Stack spacing={3}>
                    {/* Subscriptions Summary */}
                    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 3 }}>
                      <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
                        <Card sx={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' }}>
                          <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <SubscriptionIcon sx={{ color: '#4338ca', fontSize: 32 }} />
                              <Box>
                                <Typography variant="h6" color="#312e81">
                                  Active Subscriptions
                                </Typography>
                                <Typography variant="body2" color="#1e1b4b">
                                  Your recurring services
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>
                      
                      <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
                        <Card sx={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' }}>
                          <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <PaymentIcon sx={{ color: '#8b5cf6', fontSize: 32 }} />
                              <Box>
                                <Typography variant="h6" color="#581c87">
                                  Monthly Spending
                                </Typography>
                                <Typography variant="body2" color="#4c1d95">
                                  Total subscription costs
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>
                    </Stack>

                    {/* Subscriptions List */}
                    <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff' }}>
                      <Typography variant="h6" gutterBottom>
                        Your Subscriptions
                      </Typography>
                      <SubscriptionList />
                    </Paper>
                  </Stack>
                </Box>
              </TabPanel>

              {/* Reminders Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ px: 3 }}>
                  <Stack spacing={3}>
                    {/* Reminders Summary */}
                    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 3 }}>
                      <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
                        <Card sx={{ background: 'linear-gradient(135deg, #fef7cd, #fef3c7)' }}>
                          <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <ReminderIcon sx={{ color: '#d97706', fontSize: 32 }} />
                              <Box>
                                <Typography variant="h6" color="#92400e">
                                  Active Reminders
                                </Typography>
                                <Typography variant="body2" color="#78350f">
                                  Never miss important dates
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
                        <Card sx={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                          <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <ScheduleIcon sx={{ color: '#059669', fontSize: 32 }} />
                              <Box>
                                <Typography variant="h6" color="#065f46">
                                  Upcoming Events
                                </Typography>
                                <Typography variant="body2" color="#064e3b">
                                  Next 7 days
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>
                    </Stack>

                    {/* Reminders List */}
                    <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff' }}>
                      <Typography variant="h6" gutterBottom>
                        Your Reminders
                      </Typography>
                      <ReminderList />
                    </Paper>
                  </Stack>
                </Box>
              </TabPanel>

              {/* Floating Action Button */}
              <Fab
                color="primary"
                aria-label="add"
                sx={{
                  position: 'absolute',
                  bottom: 24,
                  right: 24,
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  },
                }}
                onClick={() => handleOpenDialog(getAddButtonType() as 'bill' | 'subscription' | 'reminder')}
              >
                <AddIcon />
              </Fab>
            </Box>
          </Paper>

          {/* Add Item Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
              },
            }}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div">
                {getDialogTitle()}
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {getDialogComponent()}
            </DialogContent>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Bills;