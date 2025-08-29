// Updated for Maps integration
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';

// Input validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$|^\d{10}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  const num = parseInt(year);
  return !isNaN(num) && num >= 1800 && num <= currentYear + 5;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">The dashboard encountered an error.</p>
            <details className="mb-4">
              <summary className="cursor-pointer text-blue-600">Error Details</summary>
              <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Main component for the CLUES S.M.A.R.T. Dashboard.
 * This component manages all state and renders the appropriate tab content.
 */
const CLUESSmartDashboard = () => {
  // --- State Hooks for managing application data and UI state ---
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState('');
  const [showErrorMessage, setShowErrorMessage] = React.useState('');
  const [clients, setClients] = React.useState([]);
  const [currentClientId, setCurrentClientId] = React.useState(null);
  const [findings, setFindings] = React.useState('');
  const [executiveSummary, setExecutiveSummary] = React.useState('');
  const [propertyPhotos, setPropertyPhotos] = React.useState([]);
  const [versions, setVersions] = React.useState([]);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Authentication state with proper validation
  const [loginForm, setLoginForm] = React.useState({
    email: '',
    password: '',
    isSubmitting: false
  });// Client data state, with initial mock data
  const [currentClient, setCurrentClient] = React.useState({
    name: 'Demo Client',
    email: 'client@example.com',
    phone: '(727) 555-0100',
    propertyAddress: '2015 Hillwood Dr',
    city: 'Clearwater',
    state: 'FL',
    zip: '33763'
  });

  // Property data state, with initial mock data
  const [propertyData, setPropertyData] = React.useState({
    address: '2015 Hillwood Dr, Clearwater, FL 33763',
    subdivision: 'Clearwater Acres',
    listPrice: 305000,
    currentValue: 305000,
    purchasePrice: 75000,
    purchaseDate: '2012',
    sqft: 1148,
    bedrooms: 2,
    bathrooms: 1.5,
    lotSize: '5,998 sq ft',
    yearBuilt: 1972,
    propertyType: 'Single Family',
    condition: 'Fair',
    garage: 1,
    pool: false,
    hoaFees: 0,
    taxAssessment: 225000,
    annualTaxes: 3850,
    mlsNumber: '',
    daysOnMarket: 0,
    latitude: 27.9778,
    longitude: -82.7264,
    conditions: {
      kitchen: 'Fair',
      bathroom: 'Fair',
      flooring: 'Fair',
      painting: false,
      roofing: 'Good',
      hvac: 'Good',
      landscaping: 'Fair',
      staging: 'Medium',
      defects: [],
    }
  });

  // Comparables data with enhanced validation
  const [comparables, setComparables] = React.useState([
    {
      id: 1,
      address: '2015 Hillwood Dr, Clearwater, FL 33763',
      subdivision: 'Clearwater Acres',
      distance: 'Subject',
      status: 'Subject',
      listPrice: 305000,
      soldPrice: null,
      beds: 2,
      baths: 1.5,
      sqft: 1148,
      year: 1972,
      condition: 'Fair',
      pricePerSqft: 266,
      daysOnMarket: 0,
      latitude: 27.9778,
      longitude: -82.7264
    },
    {
      id: 2,
      address: '2074 Hillwood Dr, Clearwater, FL 33763',
      subdivision: 'Clearwater Acres',
      distance: '0.1 mi',
      status: 'Sold',
      listPrice: 420000,
      soldPrice: 420000,
      soldDate: '5/24',
      beds: 3,
      baths: 2,
      sqft: 1128,
      year: 1970,
      condition: 'Excellent',
      pricePerSqft: 372,
      daysOnMarket: 22,
      latitude: 27.9785,
      longitude: -82.7269
    },
    {
      id: 3,
      address: '2499 Indigo Dr, Clearwater, FL 33763',
      subdivision: 'Clearwater Meadows',
      distance: '0.5 mi',
      status: 'Active',
      listPrice: 289900,
      soldPrice: null,
      beds: 2,
      baths: 1,
      sqft: 1420,
      year: 1975,
      condition: 'Poor',
      pricePerSqft: 211,
      daysOnMarket: 67,
      latitude: 27.9751,
      longitude: -82.7301
    },
    {
      id: 4,
      address: '1982 Hillwood Dr, Clearwater, FL 33763',
      subdivision: 'Clearwater Acres',
      distance: '0.2 mi',
      status: 'Pending',
      listPrice: 385000,
      soldPrice: null,
      beds: 3,
      baths: 2,
      sqft: 1250,
      year: 1973,
      condition: 'Good',
      pricePerSqft: 308,
      daysOnMarket: 35,
      latitude: 27.9768,
      longitude: -82.7258
    }
  ]);

  // Repair categories with their ROI and budget info
  const repairCategories = React.useMemo(() => ({
    kitchen: { name: 'Kitchen Remodel', roi: 0.96, timeReduction: 15, maxBudget: 25000 },
    bathroom: { name: 'Bathroom Update', roi: 0.74, timeReduction: 10, maxBudget: 15000 },
    flooring: { name: 'Flooring Refinish', roi: 0.85, timeReduction: 8, maxBudget: 12000 },
    painting: { name: 'Interior/Exterior Paint', roi: 1.94, timeReduction: 5, maxBudget: 8000 },
    roofing: { name: 'Roof Replacement', roi: 0.70, timeReduction: 12, maxBudget: 20000 },
    hvac: { name: 'HVAC Update', roi: 0.66, timeReduction: 8, maxBudget: 10000 },
    landscaping: { name: 'Landscaping', roi: 1.53, timeReduction: 7, maxBudget: 5000 },
    staging: { name: 'Professional Staging', roi: 1.88, timeReduction: 20, maxBudget: 15000 }
  }), []);

  // State for repair budgets, initialized to 0 for all categories with validation
  const [repairBudgets, setRepairBudgets] = React.useState(
    Object.keys(repairCategories).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  );

  // Mortgage data state with validation
  const [mortgageData, setMortgageData] = React.useState({
    purchasePrice: 420000,
    downPayment: 105000,
    loanAmount: 315000,
    interestRate: 7.25,
    loanTerm: 30,
    propertyTax: 320,
    homeInsurance: 150,
    hoa: 0,
    pmi: 0
  });

  // Market trend data for charts - with error handling
  const marketTrendData = React.useMemo(() => [
    { month: 'Feb 2025', avgPrice: 440000, inventory: 7200, soldCount: 1800, daysOnMarket: 42 },
    { month: 'Mar 2025', avgPrice: 445000, inventory: 7800, soldCount: 1950, daysOnMarket: 40 },
    { month: 'Apr 2025', avgPrice: 448000, inventory: 8200, soldCount: 2100, daysOnMarket: 38 },
    { month: 'May 2025', avgPrice: 442000, inventory: 8900, soldCount: 1750, daysOnMarket: 41 },
    { month: 'Jun 2025', avgPrice: 437000, inventory: 9390, soldCount: 1600, daysOnMarket: 45 },
    { month: 'Jul 2025', avgPrice: 430000, inventory: 4819, soldCount: 788, daysOnMarket: 48 },
    { month: 'Aug 2025', avgPrice: 430000, inventory: 4117, soldCount: 750, daysOnMarket: 43 }
  ], []);// --- Utility Functions with Enhanced Error Handling ---

  // Show success message with auto-dismiss
  const showSuccess = React.useCallback((message) => {
    setShowSuccessMessage(message);
    setTimeout(() => setShowSuccessMessage(''), 3000);
  }, []);

  // Show error message with auto-dismiss
  const showError = React.useCallback((message) => {
    setShowErrorMessage(message);
    setTimeout(() => setShowErrorMessage(''), 5000);
  }, []);

  // Safe localStorage operations with error handling
  const safeLocalStorageSet = React.useCallback((key, value) => {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    try {
      const serialized = JSON.stringify(value);
      if (serialized.length > 5242880) { // 5MB limit
        showError('Data too large to save locally');
        return false;
      }
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.error(`Error saving to localStorage (${key}):`, e);
      if (e.name === 'QuotaExceededError') {
        showError('Storage quota exceeded. Please clear some data.');
      } else {
        showError('Failed to save data locally');
      }
      return false;
    }
  }, [showError]);

  const safeLocalStorageGet = React.useCallback((key, defaultValue = null) => {
    if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error loading from localStorage (${key}):`, e);
      return defaultValue;
    }
  }, []);

  // Loads clients and auth status from local storage on initial render
  React.useEffect(() => {
    const savedClients = safeLocalStorageGet('clients', []);
    const savedVersions = safeLocalStorageGet('versions', []);
    const savedAuth = safeLocalStorageGet('auth', false);
    const savedPropertyPhotos = safeLocalStorageGet('propertyPhotos', []);

    if (Array.isArray(savedClients)) {
      setClients(savedClients);
    }
    if (Array.isArray(savedVersions)) {
      setVersions(savedVersions);
    }
    if (Array.isArray(savedPropertyPhotos)) {
      setPropertyPhotos(savedPropertyPhotos);
    }
    setIsAuthenticated(savedAuth === true);
  }, [safeLocalStorageGet]);

  // Auto-save clients when they change
  React.useEffect(() => {
    if (clients.length > 0) {
      safeLocalStorageSet('clients', clients);
    }
  }, [clients, safeLocalStorageSet]);

  // Auto-save versions when they change
  React.useEffect(() => {
    if (versions.length > 0) {
      safeLocalStorageSet('versions', versions);
    }
  }, [versions, safeLocalStorageSet]);

  // Auto-save property photos when they change
  React.useEffect(() => {
    if (propertyPhotos.length > 0) {
      safeLocalStorageSet('propertyPhotos', propertyPhotos);
    }
  }, [propertyPhotos, safeLocalStorageSet]);

  /**
   * Enhanced MLS data fetching with better error handling
   */
  const fetchMLSData = React.useCallback(async (address) => {
    if (!address || address.length < 5) {
      showError('Address is required for MLS search');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Fetching MLS data for:", address);
      
      // Simulate API delay with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const fetchPromise = new Promise(resolve => setTimeout(resolve, 1500));
      
      await Promise.race([fetchPromise, timeoutPromise]);
      
      // Mock response data with validation
      const mockComparables = [
        {
          id: Date.now() + 1,
          address: '2105 Hillwood Dr, Clearwater, FL 33763',
          subdivision: 'Clearwater Acres',
          distance: '0.3 mi',
          status: 'Active',
          listPrice: 395000,
          soldPrice: null,
          beds: 3,
          baths: 2,
          sqft: 1350,
          year: 1974,
          condition: 'Good',
          pricePerSqft: 293,
          daysOnMarket: 18,
          latitude: 27.9782,
          longitude: -82.7271
        },
        {
          id: Date.now() + 2,
          address: '2050 Hillwood Dr, Clearwater, FL 33763',
          subdivision: 'Clearwater Acres',
          distance: '0.2 mi',
          status: 'Sold',
          listPrice: 410000,
          soldPrice: 405000,
          soldDate: '6/24',
          beds: 3,
          baths: 2.5,
          sqft: 1450,
          year: 1971,
          condition: 'Excellent',
          pricePerSqft: 279,
          daysOnMarket: 12,
          latitude: 27.9772,
          longitude: -82.7261
        }
      ];
      
      // Validate mock data
      const validComparables = mockComparables.filter(comp => 
        comp.address && comp.listPrice > 0 && comp.sqft > 0
      );
      
      setComparables(prev => [prev[0], ...validComparables]);
      showSuccess(`Found ${validComparables.length} new comparable properties`);
      
    } catch (error) {
      console.error('Failed to fetch MLS data:', error);
      showError(`MLS data fetch failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [showError, showSuccess]);

  // Fetch MLS data when property address changes - with dependency array
  React.useEffect(() => {
    if (propertyData.address && isAuthenticated) {
      const debounceTimer = setTimeout(() => {
        fetchMLSData(propertyData.address);
      }, 1000);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [propertyData.address, isAuthenticated, fetchMLSData]);/**
   * Enhanced calculation functions with validation and error handling
   */

  /**
   * Calculates the monthly mortgage payment and total interest with validation
   * @returns {object} The mortgage payment details with error handling
   */
  const calculateMortgagePayment = React.useCallback(() => {
    try {
      // Validate inputs
      if (!validateNumber(mortgageData.loanAmount, 0, 10000000)) {
        return { principal: 0, total: 0, totalInterest: 0, error: 'Invalid loan amount' };
      }
      if (!validateNumber(mortgageData.interestRate, 0, 30)) {
        return { principal: 0, total: 0, totalInterest: 0, error: 'Invalid interest rate' };
      }
      if (!validateNumber(mortgageData.loanTerm, 1, 50)) {
        return { principal: 0, total: 0, totalInterest: 0, error: 'Invalid loan term' };
      }

      const P = mortgageData.loanAmount;
      const r = mortgageData.interestRate / 100 / 12;
      const n = mortgageData.loanTerm * 12;

      let monthlyPayment = 0;
      if (mortgageData.interestRate === 0) {
        monthlyPayment = P / n;
      } else {
        const denominator = Math.pow(1 + r, n) - 1;
        if (denominator === 0) {
          return { principal: 0, total: 0, totalInterest: 0, error: 'Invalid calculation parameters' };
        }
        monthlyPayment = P * (r * Math.pow(1 + r, n)) / denominator;
      }

      const totalPayment = monthlyPayment + 
        (mortgageData.propertyTax || 0) + 
        (mortgageData.homeInsurance || 0) + 
        (mortgageData.hoa || 0) + 
        (mortgageData.pmi || 0);

      const totalInterest = (monthlyPayment * n) - P;

      return {
        principal: isFinite(monthlyPayment) ? monthlyPayment : 0,
        total: isFinite(totalPayment) ? totalPayment : 0,
        totalInterest: isFinite(totalInterest) ? totalInterest : 0,
        error: null
      };
    } catch (error) {
      console.error('Mortgage calculation error:', error);
      return { principal: 0, total: 0, totalInterest: 0, error: error.message };
    }
  }, [mortgageData]);

  /**
   * Calculates key property metrics based on comparables with enhanced validation
   * @returns {object} The calculated metrics with error handling
   */
  const calculatePropertyMetrics = React.useCallback(() => {
    try {
      if (!Array.isArray(comparables) || comparables.length === 0) {
        return {
          avgPricePerSqft: 0,
          estimatedValue: 0,
          equity: 0,
          appreciation: 0,
          error: 'No comparable data available'
        };
      }

      const activeComparables = comparables.filter(c => 
        c && 
        c.status !== 'Subject' && 
        validateNumber(c.pricePerSqft, 1, 10000) &&
        validateNumber(c.sqft, 100, 50000)
      );

      if (activeComparables.length === 0) {
        return {
          avgPricePerSqft: 0,
          estimatedValue: propertyData.listPrice || 0,
          equity: 0,
          appreciation: 0,
          error: 'No valid comparable data'
        };
      }

      const avgPricePerSqft = activeComparables.reduce((sum, c) => sum + c.pricePerSqft, 0) / activeComparables.length;
      const estimatedValue = (propertyData.sqft || 0) * avgPricePerSqft;
      const equity = estimatedValue - (mortgageData.loanAmount || 0);
      
      let appreciation = 0;
      if (propertyData.purchasePrice && propertyData.purchasePrice > 0) {
        appreciation = ((estimatedValue - propertyData.purchasePrice) / propertyData.purchasePrice * 100);
      }

      return {
        avgPricePerSqft: Math.round(avgPricePerSqft),
        estimatedValue: Math.round(estimatedValue),
        equity: Math.round(equity),
        appreciation: appreciation.toFixed(1),
        error: null
      };
    } catch (error) {
      console.error('Property metrics calculation error:', error);
      return {
        avgPricePerSqft: 0,
        estimatedValue: 0,
        equity: 0,
        appreciation: 0,
        error: error.message
      };
    }
  }, [comparables, propertyData.sqft, propertyData.purchasePrice, propertyData.listPrice, mortgageData.loanAmount]);

  /**
   * Calculates the total ROI and time reduction from repairs with validation
   * @returns {object} The ROI details with error handling
   */
  const calculateRepairROI = React.useCallback(() => {
    try {
      if (!repairBudgets || typeof repairBudgets !== 'object') {
        return {
          totalInvestment: 0,
          totalValueAdded: 0,
          netROI: 0,
          roiPercent: '0.0',
          timeReduction: 0,
          newEstimatedValue: propertyData.currentValue || 0,
          error: 'Invalid repair budget data'
        };
      }

      const budgetEntries = Object.entries(repairBudgets).filter(([key, budget]) => 
        validateNumber(budget, 0, 1000000) && repairCategories[key]
      );

      const totalInvestment = budgetEntries.reduce((sum, [, budget]) => sum + budget, 0);
      
      let totalValueAdded = 0;
      let totalTimeReduction = 0;

      budgetEntries.forEach(([key, budget]) => {
        if (budget > 0 && repairCategories[key]) {
          const category = repairCategories[key];
          totalValueAdded += budget * (category.roi || 0);
          totalTimeReduction += category.timeReduction || 0;
        }
      });

      const roiPercent = totalInvestment > 0 ? 
        ((totalValueAdded - totalInvestment) / totalInvestment * 100) : 0;

      const newEstimatedValue = (propertyData.currentValue || 0) + totalValueAdded;

      return {
        totalInvestment,
        totalValueAdded: Math.round(totalValueAdded),
        netROI: Math.round(totalValueAdded - totalInvestment),
        roiPercent: roiPercent.toFixed(1),
        timeReduction: Math.min(Math.round(totalTimeReduction), 45),
        newEstimatedValue: Math.round(newEstimatedValue),
        error: null
      };
    } catch (error) {
      console.error('ROI calculation error:', error);
      return {
        totalInvestment: 0,
        totalValueAdded: 0,
        netROI: 0,
        roiPercent: '0.0',
        timeReduction: 0,
        newEstimatedValue: propertyData.currentValue || 0,
        error: error.message
      };
    }
  }, [repairBudgets, repairCategories, propertyData.currentValue]);/**
   * Action functions with enhanced validation and error handling
   */

  /**
   * Enhanced authentication with proper validation
   */
  const handleLogin = React.useCallback(async (e) => {
    e.preventDefault();
    
    if (loginForm.isSubmitting) return;

    // Validation
    if (!loginForm.email || !loginForm.password) {
      showError('Please enter both email and password');
      return;
    }

    if (!validateEmail(loginForm.email)) {
      showError('Please enter a valid email address');
      return;
    }

    if (loginForm.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setLoginForm(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Enhanced validation - multiple valid accounts
      const validAccounts = [
        { email: 'admin@clues.com', password: 'dashboard2024' },
        { email: 'demo@clues.com', password: 'demo123' },
        { email: 'test@clues.com', password: 'test123' }
      ];

      const isValidAccount = validAccounts.some(
        account => account.email === loginForm.email && account.password === loginForm.password
      );

      if (isValidAccount) {
        setIsAuthenticated(true);
        safeLocalStorageSet('auth', true);
        safeLocalStorageSet('userEmail', loginForm.email);
        showSuccess(`Welcome back, ${loginForm.email}!`);
        
        // Clear form
        setLoginForm({ email: '', password: '', isSubmitting: false });
      } else {
        showError('Invalid email or password. Try demo@clues.com / demo123');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed. Please try again.');
    } finally {
      setLoginForm(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [loginForm, showError, showSuccess, safeLocalStorageSet]);

  /**
   * Enhanced logout with confirmation
   */
  const handleLogout = React.useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      setIsAuthenticated(false);
      safeLocalStorageSet('auth', false);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('userEmail');
      }
      showSuccess('Logged out successfully');
      setLoginForm({ email: '', password: '', isSubmitting: false });
    }
  }, [showSuccess, safeLocalStorageSet]);

  /**
   * Enhanced version saving with validation
   */
  const saveVersion = React.useCallback(() => {
    try {
      if (!propertyData || !repairBudgets) {
        showError('Cannot save version: missing data');
        return;
      }

      const version = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        propertyData: { ...propertyData },
        repairBudgets: { ...repairBudgets },
        clientId: currentClientId,
        userNote: `Version saved at ${new Date().toLocaleString()}`
      };

      const newVersions = [...versions, version];
      
      if (newVersions.length > 50) { // Limit to 50 versions
        newVersions.shift(); // Remove oldest
        showSuccess('Version saved (oldest version removed due to limit)');
      } else {
        showSuccess('Version saved successfully');
      }
      
      setVersions(newVersions);
    } catch (error) {
      console.error('Save version error:', error);
      showError('Failed to save version');
    }
  }, [propertyData, repairBudgets, currentClientId, versions, showError, showSuccess]);

  /**
   * Enhanced photo upload with validation
   */
  const handlePhotoUpload = React.useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      showError('Image must be smaller than 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      showError('Please upload only JPEG, PNG, or WebP images');
      return;
    }

    if (propertyPhotos.length >= 20) {
      showError('Maximum 20 photos allowed');
      return;
    }

    const reader = new FileReader();
    
    reader.onloadend = () => {
      try {
        setPropertyPhotos(prev => [...prev, {
          id: Date.now(),
          src: reader.result,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }]);
        showSuccess('Photo uploaded successfully');
      } catch (error) {
        console.error('Photo upload error:', error);
        showError('Failed to upload photo');
      }
    };
    
    reader.onerror = () => {
      showError('Failed to read image file');
    };
    
    reader.readAsDataURL(file);
  }, [propertyPhotos.length, showError, showSuccess]);

  /**
   * Enhanced photo deletion with confirmation
   */
  const deletePhoto = React.useCallback((photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      setPropertyPhotos(prev => prev.filter(photo => photo.id !== photoId));
      showSuccess('Photo deleted');
    }
  }, [showSuccess]);

  /**
   * Enhanced PDF export with better error handling
   */
  const exportPDF = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    
    setIsLoading(true);
    
    try {
      const metrics = calculatePropertyMetrics();
      const roi = calculateRepairROI();
      
      // Enhanced export data
      const exportData = {
        title: 'CLUES S.M.A.R.T. Dashboard - CMA Report',
        generatedAt: new Date().toISOString(),
        property: {
          address: propertyData.address,
          listPrice: propertyData.listPrice,
          sqft: propertyData.sqft,
          condition: propertyData.condition
        },
        metrics: {
          estimatedValue: metrics.estimatedValue,
          avgPricePerSqft: metrics.avgPricePerSqft,
          appreciation: metrics.appreciation
        },
        repairs: {
          totalInvestment: roi.totalInvestment,
          totalValueAdded: roi.totalValueAdded,
          netROI: roi.netROI,
          timeReduction: roi.timeReduction
        },
        comparables: comparables.filter(c => c.status !== 'Subject'),
        recommendations: 'Based on market analysis and property condition'
      };

      // Check for jsPDF
      if (window.jsPDF) {
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        
        // Enhanced PDF content
        doc.setFontSize(20);
        doc.text('CMA Report', 10, 20);
        doc.setFontSize(12);
        doc.text(`Property: ${propertyData.address}`, 10, 35);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 45);
        doc.text(`Estimated Value: $${metrics.estimatedValue.toLocaleString()}`, 10, 60);
        doc.text(`List Price: $${propertyData.listPrice.toLocaleString()}`, 10, 70);
        
        doc.save(`CMA_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        showSuccess('PDF report exported successfully');
      } else {
        // Fallback to JSON export
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CMA_Report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess('Report exported as JSON (jsPDF not available)');
      }
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to export report');
    } finally {
      setIsLoading(false);
    }
  }, [propertyData, calculatePropertyMetrics, calculateRepairROI, comparables, showSuccess, showError]);

  /**
   * Enhanced email sending simulation
   */
  const sendEmail = React.useCallback(() => {
    if (!currentClient.email || !validateEmail(currentClient.email)) {
      showError('Invalid client email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate email sending
    setTimeout(() => {
      setIsLoading(false);
      showSuccess(`Report sent to ${currentClient.email}`);
      console.log('Email sent to:', currentClient.email);
    }, 2000);
  }, [currentClient.email, showError, showSuccess]);/**
   * Enhanced AI modeling with comprehensive analysis
   */
  const runAIModeling = React.useCallback(() => {
    try {
      setIsLoading(true);
      
      if (!propertyData.conditions) {
        showError('Property condition data is missing');
        return;
      }

      const conditions = propertyData.conditions;
      let newBudgets = { ...repairBudgets };
      let recommendations = [];
      let priorityActions = [];

      // Enhanced condition-based budget assignment with reasoning
      if (conditions.kitchen === 'Poor') {
        newBudgets.kitchen = Math.round(repairCategories.kitchen.maxBudget * 0.9);
        priorityActions.push('Kitchen requires major renovation');
        recommendations.push('Kitchen is in poor condition - major remodel recommended for maximum ROI');
      } else if (conditions.kitchen === 'Fair') {
        newBudgets.kitchen = Math.round(repairCategories.kitchen.maxBudget * 0.6);
        recommendations.push('Kitchen updates will significantly improve marketability');
      } else if (conditions.kitchen === 'Good') {
        newBudgets.kitchen = Math.round(repairCategories.kitchen.maxBudget * 0.3);
        recommendations.push('Minor kitchen updates for competitive edge');
      }

      if (conditions.bathroom === 'Poor') {
        newBudgets.bathroom = Math.round(repairCategories.bathroom.maxBudget * 0.8);
        priorityActions.push('Bathroom needs complete renovation');
      } else if (conditions.bathroom === 'Fair') {
        newBudgets.bathroom = Math.round(repairCategories.bathroom.maxBudget * 0.5);
      }

      if (conditions.flooring === 'Poor') {
        newBudgets.flooring = Math.round(repairCategories.flooring.maxBudget * 0.7);
        priorityActions.push('Flooring replacement is critical');
      } else if (conditions.flooring === 'Fair') {
        newBudgets.flooring = Math.round(repairCategories.flooring.maxBudget * 0.4);
      }

      if (conditions.painting === true || conditions.painting === 'Poor') {
        newBudgets.painting = Math.round(repairCategories.painting.maxBudget * 0.8);
        priorityActions.push('Fresh paint is essential - highest ROI improvement');
        recommendations.push('Painting provides 194% ROI - highest priority');
      }

      if (conditions.roofing === 'Poor') {
        newBudgets.roofing = Math.round(repairCategories.roofing.maxBudget * 1.0);
        priorityActions.push('Roof replacement is critical for sale');
      } else if (conditions.roofing === 'Fair') {
        newBudgets.roofing = Math.round(repairCategories.roofing.maxBudget * 0.3);
      }

      if (conditions.hvac === 'Poor') {
        newBudgets.hvac = Math.round(repairCategories.hvac.maxBudget * 0.9);
        priorityActions.push('HVAC system needs replacement');
      } else if (conditions.hvac === 'Fair') {
        newBudgets.hvac = Math.round(repairCategories.hvac.maxBudget * 0.4);
      }

      if (conditions.landscaping === 'Poor') {
        newBudgets.landscaping = Math.round(repairCategories.landscaping.maxBudget * 0.7);
        recommendations.push('Curb appeal is critical in current market');
      } else if (conditions.landscaping === 'Fair') {
        newBudgets.landscaping = Math.round(repairCategories.landscaping.maxBudget * 0.5);
      }

      // Staging recommendations based on market conditions
      if (conditions.staging === 'High' || conditions.staging === 'Needed') {
        newBudgets.staging = Math.round(repairCategories.staging.maxBudget * 0.8);
        priorityActions.push('Professional staging essential in buyer\'s market');
      } else if (conditions.staging === 'Medium') {
        newBudgets.staging = Math.round(repairCategories.staging.maxBudget * 0.5);
      } else if (conditions.staging === 'Low') {
        newBudgets.staging = Math.round(repairCategories.staging.maxBudget * 0.2);
      }

      setRepairBudgets(newBudgets);

      // Calculate enhanced ROI with the new budgets
      const totalInvestment = Object.values(newBudgets).reduce((sum, val) => sum + val, 0);
      let totalValueAdded = 0;
      let totalTimeReduction = 0;

      Object.entries(newBudgets).forEach(([key, budget]) => {
        if (budget > 0 && repairCategories[key]) {
          totalValueAdded += budget * repairCategories[key].roi;
          totalTimeReduction += repairCategories[key].timeReduction;
        }
      });

      const netROI = totalValueAdded - totalInvestment;
      const roiPercent = totalInvestment > 0 ? ((netROI / totalInvestment) * 100) : 0;
      const newEstimatedValue = (propertyData.currentValue || 0) + totalValueAdded;

      // Market analysis
      const currentMarketConditions = 'buyer\'s market with increasing inventory';
      const seasonalFactors = 'Peak selling season approaching (spring market)';
      
      // Generate comprehensive summary
      const summary = `🏠 CLUES S.M.A.R.T. DASHBOARD - AI MARKET ANALYSIS
Generated: ${new Date().toLocaleString()}

📊 PROPERTY CONDITION ANALYSIS:
${Object.entries(conditions).map(([key, value]) => 
  `• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value} → Budget: $${newBudgets[key]?.toLocaleString() || 0}`
).join('\n')}

🔧 IDENTIFIED DEFECTS:
${conditions.defects && conditions.defects.length > 0 ? 
  conditions.defects.map(defect => `• ${defect}`).join('\n') : '• No major defects identified'}

🎯 PRIORITY ACTIONS:
${priorityActions.length > 0 ? priorityActions.map(action => `• ${action}`).join('\n') : '• Standard market preparation recommended'}

💰 INVESTMENT ANALYSIS:
- Total Investment Required: $${totalInvestment.toLocaleString()}
- Expected Value Added: $${Math.round(totalValueAdded).toLocaleString()}
- Net ROI: $${Math.round(netROI).toLocaleString()} (${roiPercent.toFixed(1)}%)
- Time Reduction: ${Math.min(totalTimeReduction, 45)} days
- New Estimated Value: $${Math.round(newEstimatedValue).toLocaleString()}

📈 MARKET POSITIONING:
- Current Market: ${currentMarketConditions}
- Seasonal Factors: ${seasonalFactors}
- Competitive Advantage: ${roiPercent > 50 ? 'Strong' : roiPercent > 20 ? 'Moderate' : 'Limited'}

💡 KEY RECOMMENDATIONS:
${recommendations.length > 0 ? recommendations.map(rec => `• ${rec}`).join('\n') : '• Follow standard market preparation guidelines'}

⚡ QUICK WINS (High ROI/Low Cost):
- Professional photography and virtual tour ($500-800)
- Deep cleaning and decluttering ($200-500)
- Minor landscaping improvements ($500-1,500)
- Fresh interior paint touch-ups ($800-2,000)

🏆 SUCCESS PROBABILITY:
Based on current investments and market conditions, this property has a ${
  roiPercent > 50 ? 'HIGH (85-95%)' : 
  roiPercent > 20 ? 'MODERATE (70-85%)' : 
  'STANDARD (60-75%)'
} probability of selling within ${43 - Math.min(totalTimeReduction, 25)} days at list price.

Generated by CLUES S.M.A.R.T. Dashboard AI Analysis Engine`;

      setExecutiveSummary(summary);
      showSuccess('AI analysis completed successfully');
      
    } catch (error) {
      console.error('AI modeling error:', error);
      showError('AI analysis failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [propertyData, repairBudgets, repairCategories, showError, showSuccess]);

  /**
   * Enhanced repair budget validation and updates
   */
  const updateRepairBudget = React.useCallback((category, value) => {
    const numValue = parseInt(value) || 0;
    const maxBudget = repairCategories[category]?.maxBudget || 0;
    
    if (numValue < 0) {
      showError('Budget cannot be negative');
      return;
    }
    
    if (numValue > maxBudget * 1.2) { // Allow 20% over maximum
      showError(`Budget for ${category} seems unusually high. Maximum recommended: $${maxBudget.toLocaleString()}`);
    }
    
    setRepairBudgets(prev => ({
      ...prev,
      [category]: numValue
    }));
  }, [repairCategories, showError]);

  /**
   * Enhanced mortgage data validation
   */
  const updateMortgageData = React.useCallback((field, value) => {
    const numValue = parseFloat(value) || 0;
    
    // Validation based on field
    switch (field) {
      case 'purchasePrice':
        if (numValue < 0 || numValue > 50000000) {
          showError('Purchase price must be between $0 and $50,000,000');
          return;
        }
        break;
      case 'downPayment':
        if (numValue < 0 || numValue > mortgageData.purchasePrice) {
          showError('Down payment cannot exceed purchase price');
          return;
        }
        break;
      case 'interestRate':
        if (numValue < 0 || numValue > 30) {
          showError('Interest rate must be between 0% and 30%');
          return;
        }
        break;
      case 'loanTerm':
        if (![15, 20, 25, 30, 40].includes(numValue)) {
          showError('Loan term must be 15, 20, 25, 30, or 40 years');
          return;
        }
        break;
    }
    
    setMortgageData(prev => {
      const updated = { ...prev, [field]: numValue };
      
      // Auto-calculate loan amount
      if (field === 'purchasePrice' || field === 'downPayment') {
        updated.loanAmount = Math.max(0, updated.purchasePrice - updated.downPayment);
      }
      
      return updated;
    });
  }, [mortgageData.purchasePrice, showError]);// --- Enhanced React Components with Error Boundaries ---

  const Header = React.memo(() => (
    <ErrorBoundary>
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-lg">
                <div className="text-blue-900 font-bold text-2xl">CLUES</div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">S.M.A.R.T. Dashboard</h1>
                <p className="text-blue-100 text-sm mt-1">Strategic Market Analysis & Recommendation Tool</p>
                <p className="text-blue-200 text-xs mt-1">Comprehensive Location Utility & Evaluation System</p>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-lg lg:text-xl font-semibold">John E. Desautels & Associates</p>
              <p className="text-sm text-blue-100">Licensed Real Estate Broker FL: BK 3045123</p>
              <p className="text-sm text-blue-100">290 41st Ave. St. Pete Beach, FL 33706</p>
              <div className="flex flex-col lg:flex-row lg:justify-end gap-2 text-sm text-blue-100">
                <span>📧 cluesnomads@gmail.com</span>
                <span>📞 (727) 452-3506</span>
              </div>
              {isAuthenticated && (
                <div className="mt-3 flex flex-col lg:flex-row gap-2">
                  <span className="text-xs text-blue-200">
                    User: {safeLocalStorageGet('userEmail', 'Unknown')}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  ));

  const TabNavigation = React.memo(() => {
    const tabs = [
      { id: 'overview', label: '🏠 Property Overview', shortLabel: 'Overview' },
      { id: 'analysis', label: '📊 Property Analysis', shortLabel: 'Analysis' },
      { id: 'comparables', label: '🏘️ Market Comparables', shortLabel: 'Comparables' },
      { id: 'trends', label: '📈 Price Trends', shortLabel: 'Trends' },
      { id: 'marketfactors', label: '🎯 Market Factors', shortLabel: 'Factors' },
      { id: 'cma', label: '📋 CMA Report', shortLabel: 'CMA' },
      { id: 'recommendations', label: '💡 Recommendations', shortLabel: 'Recommendations' },
      { id: 'mortgage', label: '💰 Mortgage Calculator', shortLabel: 'Mortgage' },
      { id: 'dataentry', label: '✏️ Client Entry', shortLabel: 'Entry' },
      { id: 'findings', label: '📝 Findings & Notes', shortLabel: 'Notes' }
    ];
    
    return (
      <ErrorBoundary>
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 lg:px-4 py-2 rounded-t-lg font-medium whitespace-nowrap transition-all flex-shrink-0 text-sm lg:text-base ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={tab.label}
                >
                  <span className="hidden lg:inline">{tab.label}</span>
                  <span className="lg:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  });

  /**
   * Enhanced Loading Component
   */
  const LoadingSpinner = React.memo(({ message = 'Loading...', size = 'medium' }) => {
    const sizeClasses = {
      small: 'h-8 w-8',
      medium: 'h-12 w-12',
      large: 'h-16 w-16'
    };

    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
        <p className="mt-4 text-gray-600 text-center">{message}</p>
      </div>
    );
  });

  /**
   * Enhanced Success/Error Message Components
   */
  const MessageToast = React.memo(({ message, type, onClose }) => {
    React.useEffect(() => {
      if (message) {
        const timer = setTimeout(onClose, type === 'error' ? 5000 : 3000);
        return () => clearTimeout(timer);
      }
    }, [message, type, onClose]);

    if (!message) return null;

    return (
      <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      } text-white px-6 py-4 rounded-lg shadow-lg border-l-4 ${
        type === 'error' ? 'border-red-600' : 'border-green-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl mr-2">
              {type === 'error' ? '❌' : '✅'}
            </span>
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 font-bold text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    );
  });

  /**
   * Enhanced Confirmation Dialog Component
   */
  const ConfirmDialog = React.memo(({ 
    isOpen, 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    onConfirm, 
    onCancel,
    type = 'warning'
  }) => {
    if (!isOpen) return null;

    const typeColors = {
      warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
      danger: 'bg-red-50 border-red-500 text-red-800',
      info: 'bg-blue-50 border-blue-500 text-blue-800'
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <div className={`border-l-4 p-4 mb-6 ${typeColors[type]}`}>
            <p className="text-sm">{message}</p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded transition-colors ${
                type === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  });/**
   * Enhanced Property Overview Tab with error handling and better UX
   */
  const PropertyOverviewTab = React.memo(() => {
    const metrics = React.useMemo(() => calculatePropertyMetrics(), [calculatePropertyMetrics]);
    const roi = React.useMemo(() => calculateRepairROI(), [calculateRepairROI]);

    // Handle calculation errors gracefully
    if (metrics.error || roi.error) {
      return (
        <ErrorBoundary>
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-800 mb-4">Calculation Error</h2>
              <p className="text-red-700 mb-4">
                {metrics.error || roi.error || 'Unable to calculate property metrics'}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </ErrorBoundary>
      );
    }
    
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Property Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Property Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-4">{propertyData.address}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">List Price:</span>
                    <span className="font-semibold text-green-600">
                      ${propertyData.listPrice?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Square Footage:</span>
                    <span className="font-semibold">
                      {propertyData.sqft?.toLocaleString() || 'N/A'} sq ft
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Bedrooms/Bathrooms:</span>
                    <span className="font-semibold">
                      {propertyData.bedrooms || 'N/A'}BR / {propertyData.bathrooms || 'N/A'}BA
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Year Built:</span>
                    <span className="font-semibold">{propertyData.yearBuilt || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Lot Size:</span>
                    <span className="font-semibold">{propertyData.lotSize || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-semibold">{propertyData.propertyType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Condition:</span>
                    <span className={`font-semibold px-2 py-1 rounded text-white text-sm ${
                      propertyData.condition === 'Excellent' ? 'bg-green-500' :
                      propertyData.condition === 'Good' ? 'bg-blue-500' :
                      propertyData.condition === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {propertyData.condition || 'Unknown'}
                    </span>
                  </div>
                  {propertyData.pool && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Pool:</span>
                      <span className="font-semibold text-blue-600">Yes</span>
                    </div>
                  )}
                  {propertyData.garage && propertyData.garage > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Garage:</span>
                      <span className="font-semibold">{propertyData.garage} car(s)</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Market Valuation Section */}
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-4">Market Valuation</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Estimated Market Value</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${metrics.estimatedValue?.toLocaleString() || 'N/A'}
                    </p>
                    {metrics.estimatedValue > 0 && propertyData.listPrice > 0 && (
                      <p className="text-xs text-blue-500 mt-1">
                        {metrics.estimatedValue > propertyData.listPrice ? '+' : ''}
                        {((metrics.estimatedValue - propertyData.listPrice) / propertyData.listPrice * 100).toFixed(1)}% vs list price
                      </p>
                    )}
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Average Price/Sq Ft</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${metrics.avgPricePerSqft || 'N/A'}
                    </p>
                    {propertyData.listPrice > 0 && propertyData.sqft > 0 && (
                      <p className="text-xs text-green-500 mt-1">
                        Your price/sqft: ${Math.round(propertyData.listPrice / propertyData.sqft)}
                      </p>
                    )}
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Total Appreciation</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {metrics.appreciation || '0.0'}%
                    </p>
                    {propertyData.purchasePrice > 0 && (
                      <p className="text-xs text-purple-500 mt-1">
                        Since {propertyData.purchaseDate || 'purchase'}
                      </p>
                    )}
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-gray-600">Estimated Equity</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ${metrics.equity?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="text-xs text-orange-500 mt-1">
                      After loan balance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Property Position & Analysis Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Property Position & Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Market Position</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Competitive Position</p>
                    <p className="text-xl font-bold text-blue-700">
                      {propertyData.listPrice && metrics.estimatedValue && propertyData.listPrice < metrics.estimatedValue ? 'Strong' : 'Moderate'}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {propertyData.listPrice && metrics.estimatedValue ? (
                        propertyData.listPrice < metrics.estimatedValue ? 'Priced below market value' : 'Premium pricing strategy'
                      ) : 'Analysis pending'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Expected Days on Market</p>
                    <p className="text-xl font-bold text-green-700">
                      {Math.max(1, 43 - (roi.timeReduction || 0))} days
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Based on condition and repairs
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Recommended List Price</p>
                    <p className="text-xl font-bold text-purple-700">
                      ${metrics.estimatedValue ? (metrics.estimatedValue * 0.98).toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Strategic pricing for quick sale
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparable Sales Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Active Comparables</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {comparables.filter(c => c.status === 'Active').length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Currently listed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Pending Sales</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {comparables.filter(c => c.status === 'Pending').length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Under contract</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Recent Sold</p>
                      <p className="text-2xl font-bold text-green-600">
                        {comparables.filter(c => c.status === 'Sold').length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
                    </div>
                  </div>
                  
                  {/* Competition Analysis */}
                  {comparables.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Competition Analysis</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Average competitor price: ${comparables
                          .filter(c => c.status !== 'Subject' && c.listPrice)
                          .reduce((sum, c) => sum + c.listPrice, 0) / 
                          Math.max(1, comparables.filter(c => c.status !== 'Subject' && c.listPrice).length)
                          .toLocaleString()}</p>
                        <p>Your pricing advantage: {
                          propertyData.listPrice < (comparables
                            .filter(c => c.status !== 'Subject' && c.listPrice)
                            .reduce((sum, c) => sum + c.listPrice, 0) / 
                            Math.max(1, comparables.filter(c => c.status !== 'Subject' && c.listPrice).length))
                            ? 'Below market' : 'Above market'
                        }</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Pricing Recommendation Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Pricing Recommendation</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-xl">💡</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 mb-3">
                    Based on current market conditions and comparable sales analysis:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                      Initial list price: <strong>${metrics.estimatedValue ? (metrics.estimatedValue * 0.98).toLocaleString() : 'TBD'}</strong>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                      Negotiation range: <strong>${metrics.estimatedValue ? (metrics.estimatedValue * 0.95).toLocaleString() : 'TBD'}</strong> - <strong>${metrics.estimatedValue ? (metrics.estimatedValue * 1.02).toLocaleString() : 'TBD'}</strong>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                      Price reduction threshold: 30 days without offers
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                      Focus on condition improvements to justify pricing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Property Location Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Property Location & Neighborhood</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
              <div className="space-y-3">
                <div className="text-4xl text-gray-400">🗺️</div>
                <p className="text-gray-600 font-medium">Interactive Map View</p>
                <p className="text-sm text-gray-500">Google Maps integration ready for production</p>
                <div className="bg-white p-3 rounded border border-gray-200 inline-block">
                  <p className="text-xs text-blue-600 font-mono">
                    📍 {propertyData.latitude}, {propertyData.longitude}
                  </p>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-gray-500">
                    Neighborhood: {propertyData.subdivision || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  });/**
   * Enhanced Property Analysis Tab with interactive ROI calculator
   */
  const PropertyAnalysisTab = React.memo(() => {
    const roi = React.useMemo(() => calculateRepairROI(), [calculateRepairROI]);

    return (
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Investment Analysis & ROI Calculator */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Investment Analysis & ROI Calculator</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Repair & Upgrade Investments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Repair & Upgrade Investments</h3>
                <div className="space-y-4">
                  {Object.entries(repairCategories).map(([key, category]) => (
                    <div key={key} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">{category.name}</label>
                        <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          ${repairBudgets[key]?.toLocaleString() || '0'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max={category.maxBudget}
                          step="500"
                          value={repairBudgets[key] || 0}
                          onChange={(e) => updateRepairBudget(key, e.target.value)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>$0</span>
                          <span className="text-center">
                            ROI: <span className="font-semibold text-green-600">
                              {(category.roi * 100).toFixed(0)}%
                            </span>
                          </span>
                          <span>${category.maxBudget.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Time Saved: {category.timeReduction} days</span>
                          <input
                            type="number"
                            min="0"
                            max={category.maxBudget}
                            step="100"
                            value={repairBudgets[key] || 0}
                            onChange={(e) => updateRepairBudget(key, e.target.value)}
                            className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="Custom"
                          />
                        </div>
                      </div>
                      
                      {repairBudgets[key] > 0 && (
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                          Estimated value added: ${Math.round((repairBudgets[key] || 0) * category.roi).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        const resetBudgets = Object.keys(repairCategories).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
                        setRepairBudgets(resetBudgets);
                        showSuccess('All budgets reset to zero');
                      }}
                      className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => {
                        const recommendedBudgets = Object.entries(repairCategories).reduce((acc, [key, cat]) => ({
                          ...acc,
                          [key]: Math.round(cat.maxBudget * 0.5)
                        }), {});
                        setRepairBudgets(recommendedBudgets);
                        showSuccess('Applied recommended budgets');
                      }}
                      className="px-3 py-1 text-xs bg-blue-200 text-blue-700 rounded hover:bg-blue-300 transition-colors"
                    >
                      Use Recommended
                    </button>
                    <button
                      onClick={() => {
                        const highROIBudgets = Object.entries(repairCategories).reduce((acc, [key, cat]) => ({
                          ...acc,
                          [key]: cat.roi > 1.5 ? Math.round(cat.maxBudget * 0.7) : 0
                        }), {});
                        setRepairBudgets(highROIBudgets);
                        showSuccess('Applied high-ROI strategy');
                      }}
                      className="px-3 py-1 text-xs bg-green-200 text-green-700 rounded hover:bg-green-300 transition-colors"
                    >
                      High ROI Only
                    </button>
                  </div>
                </div>
              </div>

              {/* Investment Returns */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Investment Returns</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Total Investment</p>
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">COST</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      ${roi.totalInvestment?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      {roi.totalInvestment > 0 ? 'Upfront investment required' : 'No investment planned'}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Total Value Added</p>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">RETURN</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${roi.totalValueAdded?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      {roi.totalValueAdded > roi.totalInvestment ? 'Positive return expected' : 'Consider alternatives'}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Net ROI</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        parseFloat(roi.roiPercent) > 0 ? 'text-blue-600 bg-blue-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {parseFloat(roi.roiPercent) > 0 ? 'PROFIT' : 'LOSS'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${roi.netROI?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xl font-semibold text-blue-700">
                      ({roi.roiPercent || '0.0'}%)
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Time Savings</p>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">SPEED</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{roi.timeReduction || 0} days</p>
                    <p className="text-xs text-purple-500 mt-1">
                      Reduced days on market
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">New Estimated Value</p>
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">TOTAL</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      ${roi.newEstimatedValue?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-orange-500 mt-1">
                      After all improvements
                    </p>
                  </div>
                </div>
                
                {/* ROI Analysis Summary */}
                {roi.totalInvestment > 0 && (
                  <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Investment Analysis</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Break-even point:</span>
                        <span className="font-medium">
                          {roi.totalValueAdded >= roi.totalInvestment ? 'Achieved' : 'Not reached'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payback period:</span>
                        <span className="font-medium">
                          {roi.totalInvestment > 0 && roi.netROI > 0 ? 'At sale' : 'Uncertain'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk level:</span>
                        <span className={`font-medium ${
                          parseFloat(roi.roiPercent) > 50 ? 'text-green-600' :
                          parseFloat(roi.roiPercent) > 20 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {parseFloat(roi.roiPercent) > 50 ? 'Low' :
                           parseFloat(roi.roiPercent) > 20 ? 'Medium' : 'High'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Market Condition Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Market Condition Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Market Type</p>
                  <span className="text-lg">📊</span>
                </div>
                <p className="text-xl font-bold text-blue-700">Buyer's Market</p>
                <p className="text-xs text-gray-500 mt-1">High inventory, slower sales</p>
                <div className="mt-3 text-xs text-blue-600">
                  <p>• More competition</p>
                  <p>• Buyers are selective</p>
                  <p>• Condition matters more</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Avg Days on Market</p>
                  <span className="text-lg">⏱️</span>
                </div>
                <p className="text-xl font-bold text-orange-700">43 days</p>
                <p className="text-xs text-gray-500 mt-1">+5 days from last month</p>
                <div className="mt-3 text-xs text-orange-600">
                  <p>• Trending upward</p>
                  <p>• Condition affects speed</p>
                  <p>• Pricing is critical</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Price Trend</p>
                  <span className="text-lg">📉</span>
                </div>
                <p className="text-xl font-bold text-purple-700">-1.6%</p>
                <p className="text-xs text-gray-500 mt-1">6-month trend</p>
                <div className="mt-3 text-xs text-purple-600">
                  <p>• Slight decline</p>
                  <p>• Stabilizing market</p>
                  <p>• Strategic timing important</p>
                </div>
              </div>
            </div>
            
            {/* Market Strategy Recommendations */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Market Strategy Recommendations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
                <div>
                  <p className="font-medium mb-1">Given current market conditions:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Focus on high-ROI improvements</li>
                    <li>• Professional staging is essential</li>
                    <li>• Price competitively from start</li>
                    <li>• Consider buyer incentives</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Timing considerations:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• List before peak inventory season</li>
                    <li>• Complete repairs before listing</li>
                    <li>• Consider seasonal buyer patterns</li>
                    <li>• Monitor competing listings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  });/**
   * Enhanced Market Comparables Tab with detailed analysis
   */
  const MarketComparablesTab = React.memo(() => (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Live Market Competition Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Live Market Competition Analysis</h2>
          
          {/* Status Indicators */}
          <div className="mb-4 flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Subject Property
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
              Recently Sold
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Active Listings
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Under Contract
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border border-gray-300 p-3 text-left">Address</th>
                  <th className="border border-gray-300 p-3 text-center">Distance</th>
                  <th className="border border-gray-300 p-3 text-center">Status</th>
                  <th className="border border-gray-300 p-3 text-center">List Price</th>
                  <th className="border border-gray-300 p-3 text-center">Beds/Baths</th>
                  <th className="border border-gray-300 p-3 text-center">Sq Ft</th>
                  <th className="border border-gray-300 p-3 text-center">$/Sq Ft</th>
                  <th className="border border-gray-300 p-3 text-center">Condition</th>
                  <th className="border border-gray-300 p-3 text-center">DOM</th>
                </tr>
              </thead>
              <tbody>
                {comparables.map((comp, index) => (
                  <tr key={comp.id} className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-blue-50 transition-colors`}>
                    <td className="border border-gray-300 p-3">
                      <div className="font-semibold text-blue-600">{comp.address}</div>
                      <div className="text-xs text-gray-500">
                        {comp.subdivision}
                        {comp.soldDate && (
                          <span className="ml-2 text-green-600">Sold: {comp.soldDate}</span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className={`font-bold ${
                        comp.distance === 'Subject' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {comp.distance}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                        comp.status === 'Subject' ? 'bg-green-500' :
                        comp.status === 'Sold' ? 'bg-gray-500' :
                        comp.status === 'Active' ? 'bg-blue-500' :
                        comp.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <div className="font-bold">
                        ${comp.listPrice?.toLocaleString() || 'N/A'}
                      </div>
                      {comp.soldPrice && comp.soldPrice !== comp.listPrice && (
                        <div className="text-xs text-green-600">
                          Sold: ${comp.soldPrice.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className="font-medium">
                        {comp.beds}/{comp.baths}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className="font-medium">
                        {comp.sqft?.toLocaleString() || 'N/A'}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className="font-semibold text-lg">
                        ${comp.pricePerSqft || 'N/A'}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                        comp.condition === 'Excellent' ? 'bg-green-500' :
                        comp.condition === 'Good' ? 'bg-blue-500' :
                        comp.condition === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {comp.condition}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className={`font-bold ${
                        comp.daysOnMarket <= 30 ? 'text-green-600' :
                        comp.daysOnMarket <= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {comp.daysOnMarket}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Market Analysis Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-xs text-gray-600 mb-1">Average List Price</p>
              <p className="text-lg font-bold text-blue-600">
                ${comparables.filter(c => c.status !== 'Subject' && c.listPrice)
                  .reduce((sum, c) => sum + c.listPrice, 0) / 
                  Math.max(1, comparables.filter(c => c.status !== 'Subject' && c.listPrice).length)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <p className="text-xs text-gray-600 mb-1">Average $/Sq Ft</p>
              <p className="text-lg font-bold text-green-600">
                ${Math.round(comparables.filter(c => c.status !== 'Subject' && c.pricePerSqft)
                  .reduce((sum, c) => sum + c.pricePerSqft, 0) / 
                  Math.max(1, comparables.filter(c => c.status !== 'Subject' && c.pricePerSqft).length))}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-xs text-gray-600 mb-1">Average DOM</p>
              <p className="text-lg font-bold text-yellow-600">
                {Math.round(comparables.filter(c => c.status !== 'Subject' && c.daysOnMarket)
                  .reduce((sum, c) => sum + c.daysOnMarket, 0) / 
                  Math.max(1, comparables.filter(c => c.status !== 'Subject' && c.daysOnMarket).length))} days
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
              <p className="text-xs text-gray-600 mb-1">Price Range</p>
              <p className="text-sm font-bold text-purple-600">
                ${Math.min(...comparables.filter(c => c.status !== 'Subject' && c.listPrice).map(c => c.listPrice)).toLocaleString()} - 
                ${Math.max(...comparables.filter(c => c.status !== 'Subject' && c.listPrice).map(c => c.listPrice)).toLocaleString()}
              </p>
            </div>
          </div>

          {/* MLS Integration Status */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">MLS</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-semibold">
                  MLS Integration Status: Ready for Stellar MLS API
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Coverage: Pinellas, Hillsborough, Pasco, Hernando, Citrus, Manatee, Sarasota, Orange Counties
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button 
                    onClick={() => fetchMLSData(propertyData.address)}
                    disabled={isLoading}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      isLoading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh MLS Data'}
                  </button>
                  <button 
                    onClick={() => {
                      const csvContent = [
                        ['Address', 'Status', 'List Price', 'Sold Price', 'Beds', 'Baths', 'Sq Ft', 'Price/Sq Ft', 'Days on Market', 'Condition'],
                        ...comparables.map(c => [
                          c.address, c.status, c.listPrice, c.soldPrice || '', 
                          c.beds, c.baths, c.sqft, c.pricePerSqft, c.daysOnMarket, c.condition
                        ])
                      ].map(row => row.join(',')).join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'comparables_export.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                      showSuccess('Comparables exported to CSV');
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparable Properties Map Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Comparable Properties Map</h3>
          <div className="bg-gray-100 rounded-lg p-8 text-center h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="space-y-4">
              <div className="text-6xl text-gray-400">🗺️</div>
              <div>
                <p className="text-gray-600 text-lg font-medium">Interactive Map View</p>
                <p className="text-sm text-gray-500 mt-2">
                  Showing {comparables.length} comparable properties within 1 mile radius
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <p className="font-semibold">Features Ready:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Property markers</li>
                      <li>• Distance calculations</li>
                      <li>• Popup information</li>
                      <li>• Draw radius tools</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Data Available:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• GPS coordinates</li>
                      <li>• Property details</li>
                      <li>• Status indicators</li>
                      <li>• Price comparisons</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-4 font-mono">
                  Google Maps API integration pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Competitive Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Competitive Analysis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Position Analysis */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Price Position Analysis</h4>
              <div className="space-y-3">
                {comparables.filter(c => c.status !== 'Subject').map((comp, index) => (
                  <div key={comp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {comp.address.split(',')[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {comp.beds}BR/{comp.baths}BA • {comp.sqft} sqft • {comp.condition}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        ${comp.pricePerSqft}/sqft
                      </p>
                      <p className={`text-xs ${
                        comp.pricePerSqft > propertyData.listPrice / propertyData.sqft 
                          ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {comp.pricePerSqft > propertyData.listPrice / propertyData.sqft ? '+' : ''}
                        {((comp.pricePerSqft - propertyData.listPrice / propertyData.sqft) / 
                          (propertyData.listPrice / propertyData.sqft) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Timing Analysis */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Market Timing Analysis</h4>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="text-sm font-semibold text-blue-800 mb-2">Recently Sold</h5>
                  <div className="space-y-2">
                    {comparables.filter(c => c.status === 'Sold').map(comp => (
                      <div key={comp.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{comp.address.split(',')[0]}</span>
                        <span className="text-blue-600 font-medium">{comp.daysOnMarket} days</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h5 className="text-sm font-semibold text-yellow-800 mb-2">Currently Active</h5>
                  <div className="space-y-2">
                    {comparables.filter(c => c.status === 'Active').map(comp => (
                      <div key={comp.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{comp.address.split(',')[0]}</span>
                        <span className="text-yellow-600 font-medium">{comp.daysOnMarket} days</span>
                      </div>
                    ))}
                  </div>
                </div>

                {comparables.filter(c => c.status === 'Pending').length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="text-sm font-semibold text-green-800 mb-2">Under Contract</h5>
                    <div className="space-y-2">
                      {comparables.filter(c => c.status === 'Pending').map(comp => (
                        <div key={comp.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{comp.address.split(',')[0]}</span>
                          <span className="text-green-600 font-medium">{comp.daysOnMarket} days</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  ));/**
   * Enhanced Price Trends Tab with interactive charts
   */
  const PriceTrendsTab = React.memo(() => (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Market Price Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Market Price Trends - Clearwater, FL</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="left" 
                  label={{ value: 'Average Price ($)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  label={{ value: 'Inventory', angle: 90, position: 'insideRight' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'avgPrice' ? `$${value.toLocaleString()}` : value.toLocaleString(),
                    name === 'avgPrice' ? 'Avg Price' : name === 'inventory' ? 'Inventory' : 'Sold Count'
                  ]}
                  labelStyle={{ color: '#374151' }}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="avgPrice" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  name="avgPrice"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="inventory" 
                  stroke="#10B981" 
                  strokeWidth={2} 
                  name="inventory"
                  dot={{ fill: '#10B981', strokeWidth: 1, r: 3 }}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="soldCount" 
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  name="soldCount"
                  dot={{ fill: '#F59E0B', strokeWidth: 1, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Trend Analysis */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-800">Price Trend Analysis</p>
              <p className="text-sm text-blue-700 mt-1">
                {marketTrendData.length > 1 ? (
                  marketTrendData[marketTrendData.length - 1].avgPrice > marketTrendData[0].avgPrice 
                    ? `+${(((marketTrendData[marketTrendData.length - 1].avgPrice / marketTrendData[0].avgPrice) - 1) * 100).toFixed(1)}% since Feb` 
                    : `${(((marketTrendData[marketTrendData.length - 1].avgPrice / marketTrendData[0].avgPrice) - 1) * 100).toFixed(1)}% since Feb`
                ) : 'Insufficient data'}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-green-800">Inventory Status</p>
              <p className="text-sm text-green-700 mt-1">
                {marketTrendData.length > 1 ? (
                  marketTrendData[marketTrendData.length - 1].inventory < marketTrendData[marketTrendData.length - 2].inventory
                    ? 'Decreasing (buyer opportunity)' 
                    : 'Increasing (seller challenge)'
                ) : 'Monitoring'}
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <p className="text-xs font-semibold text-orange-800">Sales Activity</p>
              <p className="text-sm text-orange-700 mt-1">
                {marketTrendData.length > 1 ? (
                  marketTrendData[marketTrendData.length - 1].soldCount > marketTrendData[marketTrendData.length - 2].soldCount
                    ? 'Activity increasing' 
                    : 'Activity slowing'
                ) : 'Monitoring'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Days on Market Trend */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Days on Market Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} days`, 'Days on Market']} />
                  <Bar dataKey="daysOnMarket" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supply vs Demand */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Supply vs Demand</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="inventory" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                    name="Available Inventory"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="soldCount" 
                    stackId="2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Properties Sold"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Market Statistics Summary */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Market Statistics Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
              <p className="text-sm text-gray-600">Current Avg Price</p>
              <p className="text-xl font-bold text-blue-600">$430,000</p>
              <p className="text-xs text-gray-500">-2.3% from peak</p>
              <div className="mt-2 h-1 bg-blue-200 rounded">
                <div className="h-full bg-blue-600 rounded" style={{ width: '77%' }}></div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-xl font-bold text-green-600">4,117</p>
              <p className="text-xs text-gray-500">-14.7% MoM</p>
              <div className="mt-2 h-1 bg-green-200 rounded">
                <div className="h-full bg-green-600 rounded" style={{ width: '62%' }}></div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
              <p className="text-sm text-gray-600">Avg DOM</p>
              <p className="text-xl font-bold text-orange-600">43 days</p>
              <p className="text-xs text-gray-500">+2 from last month</p>
              <div className="mt-2 h-1 bg-orange-200 rounded">
                <div className="h-full bg-orange-600 rounded" style={{ width: '71%' }}></div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
              <p className="text-sm text-gray-600">Sale/List Ratio</p>
              <p className="text-xl font-bold text-purple-600">96.8%</p>
              <p className="text-xs text-gray-500">Buyers negotiating</p>
              <div className="mt-2 h-1 bg-purple-200 rounded">
                <div className="h-full bg-purple-600 rounded" style={{ width: '97%' }}></div>
              </div>
            </div>
          </div>
          
          {/* Market Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Key Market Insights</h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Inventory levels stabilizing after summer peak</li>
                <li>• Prices holding steady despite increased competition</li>
                <li>• Buyer activity picking up with seasonal patterns</li>
                <li>• Quality properties moving faster than average</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Strategic Implications</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Competitive pricing essential in current market</li>
                <li>• Condition and presentation more important</li>
                <li>• Marketing strategy should emphasize value</li>
                <li>• Consider timing for optimal exposure</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  ));

  /**
   * Enhanced Market Factors Tab with detailed analysis
   */
  const MarketFactorsTab = React.memo(() => {
    const marketingFactorsData = [
      { factor: 'Professional Photos', impact: '+35%', avgDays: 30, notes: 'High-quality listing photos' },
      { factor: 'Virtual Tour', impact: '+25%', avgDays: 35, notes: '3D walkthrough available' },
      { factor: 'Drone/Aerial', impact: '+15%', avgDays: 38, notes: 'Property and neighborhood views' },
      { factor: 'Standard Photos', impact: 'Baseline', avgDays: 43, notes: 'Basic MLS photos only' },
      { factor: 'Poor Photos', impact: '-40%', avgDays: 75, notes: 'Low quality or few photos' }
    ];
    
    const propertyFeaturesData = [
      { feature: 'Pool', avgDays: 28, priceImpact: '+$8K', demandBoost: 'High' },
      { feature: 'Updated Kitchen', avgDays: 25, priceImpact: '+$12K', demandBoost: 'Very High' },
      { feature: 'Master Suite', avgDays: 32, priceImpact: '+$6K', demandBoost: 'High' },
      { feature: 'Garage (2+ car)', avgDays: 35, priceImpact: '+$4K', demandBoost: 'Medium' }
    ];
    
    const schoolDistrictData = [
      { rating: 'A-Rated Schools', avgDays: 25, familyDemand: 'Very High', priceRange: '$475K+' },
      { rating: 'B-Rated Schools', avgDays: 35, familyDemand: 'High', priceRange: '$400K-475K' },
      { rating: 'C-Rated Schools', avgDays: 50, familyDemand: 'Medium', priceRange: '$350K-400K' },
      { rating: 'Below Average', avgDays: 70, familyDemand: 'Low', priceRange: 'Under $350K' }
    ];
    
    const pricingStrategyData = [
      { strategy: 'Market Price', avgDays: 43, successRate: 85, finalPrice: 98.5 },
      { strategy: '2% Above Market', avgDays: 60, successRate: 65, finalPrice: 96.2 },
      { strategy: '5% Above Market', avgDays: 90, successRate: 40, finalPrice: 92.8 },
      { strategy: '3% Below Market', avgDays: 20, successRate: 95, finalPrice: 101.5 }
    ];
    
    const daysOnMarketByCondition = [
      { condition: 'Move-in Ready', avgDays: 25, priceRange: '$450K-500K', sales: 45 },
      { condition: 'Minor Updates', avgDays: 35, priceRange: '$400K-450K', sales: 62 },
      { condition: 'Cosmetic Repairs', avgDays: 50, priceRange: '$350K-400K', sales: 38 },
      { condition: 'Major Repairs', avgDays: 75, priceRange: '$300K-350K', sales: 18 },
      { condition: 'Fixer Upper', avgDays: 120, priceRange: '$250K-300K', sales: 8 }
    ];
    
    const stagingImpactData = [
      { stagingLevel: 'Professional Staging', avgDays: 20, salesPrice: 101.2, cost: '$3000-5000' },
      { stagingLevel: 'Home Staging', avgDays: 28, salesPrice: 99.8, cost: '$1500-3000' },
      { stagingLevel: 'Decluttered/Clean', avgDays: 35, salesPrice: 98.5, cost: '$200-500' },
      { stagingLevel: 'As-Is/Occupied', avgDays: 55, salesPrice: 96.2, cost: '$0' }
    ];
    
    const seasonalData = [
      { season: 'Spring (Mar-May)', avgDays: 28, demandLevel: 'High', inventory: 'Medium' },
      { season: 'Summer (Jun-Aug)', avgDays: 35, demandLevel: 'Medium', inventory: 'High' },
      { season: 'Fall (Sep-Nov)', avgDays: 45, demandLevel: 'Medium', inventory: 'High' },
      { season: 'Winter (Dec-Feb)', avgDays: 60, demandLevel: 'Low', inventory: 'Very High' }
    ];
    
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Marketing Quality Impact */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Marketing Quality Impact on Sale Speed</h3>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Data Explanation:</strong> Days = Average time on market | Percentage = Impact vs baseline (standard photos)
              </p>
            </div>
            <div className="space-y-4">
              {marketingFactorsData.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.factor}</p>
                    <p className="text-xs text-gray-600">{item.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{item.avgDays} days on market</p>
                    <p className="text-xs font-medium text-green-600">
                      {item.impact === 'Baseline' ? 'Baseline (43 days)' :
                        item.impact.includes('+') ? `${item.impact} faster sale` : `${item.impact} slower sale`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>{/* Property Features Impact */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Property Features Impact on Sale Speed</h3>
            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-green-800">
                <strong>Data Explanation:</strong> Days = Average time on market | Price Impact = Estimated value increase | Demand = Buyer interest level
              </p>
            </div>
            <div className="space-y-4">
              {propertyFeaturesData.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.feature}</p>
                    <p className="text-xs text-gray-600">{item.demandBoost} buyer demand</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{item.avgDays} days on market</p>
                    <p className="text-xs font-medium text-green-600">{item.priceImpact} property value</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-gray-100 p-3 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>Key Insight:</strong> Updated kitchens sell fastest (25 days) while pools add significant value (+$8K) and demand in the Tampa market.
              </p>
            </div>
          </div>
          
          {/* School District Impact */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">School District Impact</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={schoolDistrictData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Days on Market', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="avgDays" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Pricing Strategy Impact */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Pricing Strategy Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                <h4 className="text-sm font-semibold text-gray-600 mb-2 text-center">Days on Market by Strategy</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pricingStrategyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="strategy" angle={-45} textAnchor="end" height={80} fontSize={10} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Avg Days']} />
                    <Bar dataKey="avgDays" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-600 text-center">Strategy Performance</h4>
                {pricingStrategyData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{item.strategy}</p>
                      <p className="text-xs text-gray-600">{item.successRate}% success rate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{item.avgDays} days</p>
                      <p className="text-xs text-gray-600">{item.finalPrice}% of ask</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Property Condition Impact */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Days on Market by Property Condition</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daysOnMarketByCondition} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="condition" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Days on Market', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="avgDays" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Staging Impact */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Staging Impact on Sale Speed</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stagingImpactData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stagingLevel" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Days on Market', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} days`, 'Average Days']} />
                  <Bar dataKey="avgDays" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Seasonal Patterns */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Seasonal Market Patterns</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="season" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Days on Market', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} days`, 'Average Days']} />
                  <Bar dataKey="avgDays" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  });

  /**
   * Enhanced CMA Report Tab with comprehensive analysis
   */
  const CMAReportTab = React.memo(() => {
    const metrics = React.useMemo(() => calculatePropertyMetrics(), [calculatePropertyMetrics]);
    const roi = React.useMemo(() => calculateRepairROI(), [calculateRepairROI]);

    return (
      <ErrorBoundary>
        <div className="space-y-6">
          {/* CMA Report Header */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Comparative Market Analysis Report</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 text-xl">ℹ️</span>
                <div>
                  <p className="text-sm text-blue-800 font-semibold">
                    MLS Integration Status: Ready for Stellar MLS API
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This report will auto-populate with live data once API key is configured
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject Property Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Subject Property Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Current List Price:</span>
                    <span className="font-semibold">${propertyData.listPrice?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">CMA Estimated Value:</span>
                    <span className="font-semibold text-green-600">${metrics.estimatedValue?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Price Per Sq Ft:</span>
                    <span className="font-semibold">
                      ${propertyData.listPrice && propertyData.sqft ? Math.round(propertyData.listPrice / propertyData.sqft) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Market Avg $/Sq Ft:</span>
                    <span className="font-semibold">${metrics.avgPricePerSqft || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Pricing Strategy:</span>
                    <span className={`font-semibold ${
                      propertyData.listPrice && metrics.estimatedValue && propertyData.listPrice < metrics.estimatedValue 
                        ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {propertyData.listPrice && metrics.estimatedValue ? (
                        propertyData.listPrice < metrics.estimatedValue ? 'Competitive' : 'Premium'
                      ) : 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Confidence Level:</span>
                    <span className="font-semibold text-blue-600">
                      {comparables.length > 3 ? 'High' : comparables.length > 1 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Market Position */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Market Position</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Competitive Position</p>
                    <p className="text-xl font-bold text-blue-700">
                      {propertyData.listPrice && metrics.estimatedValue && propertyData.listPrice < metrics.estimatedValue ? 'Strong' : 'Moderate'}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Based on comparable analysis
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Expected Days on Market</p>
                    <p className="text-xl font-bold text-green-700">
                      {Math.max(1, 43 - (roi.timeReduction || 0))} days
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      After recommended improvements
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Recommended List Price</p>
                    <p className="text-xl font-bold text-purple-700">
                      ${metrics.estimatedValue ? (metrics.estimatedValue * 0.98).toLocaleString() : 'TBD'}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Strategic market entry point
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparable Sales Summary */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparable Sales Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Active Comparables</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {comparables.filter(c => c.status === 'Active').length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Pending Sales</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {comparables.filter(c => c.status === 'Pending').length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Recent Sold</p>
                    <p className="text-2xl font-bold text-green-600">
                      {comparables.filter(c => c.status === 'Sold').length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {comparables.filter(c => c.status !== 'Subject').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Recommendation */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Pricing Recommendation</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600 text-2xl">💡</span>
                <div>
                  <p className="text-sm text-gray-700 mb-3">
                    Based on current market conditions and comparable sales analysis:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                      Initial list price: <strong>${metrics.estimatedValue ? (metrics.estimatedValue * 0.98).toLocaleString() : 'TBD'}</strong>
                      {metrics.estimatedValue && (
                        <span className="ml-2 text-xs text-gray-500">
                          (2% below estimated value for competitive positioning)
                        </span>
                      )}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                      Negotiation range: <strong>${metrics.estimatedValue ? (metrics.estimatedValue * 0.95).toLocaleString() : 'TBD'}</strong> - <strong>${metrics.estimatedValue ? (metrics.estimatedValue * 1.02).toLocaleString() : 'TBD'}</strong>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                      Price reduction threshold: 30 days without offers or showings
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                      Focus on condition improvements to justify premium pricing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={exportPDF}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Generating...' : 'Export CMA Report'}
              </button>
              <button 
                onClick={sendEmail}
                disabled={isLoading || !currentClient.email}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isLoading || !currentClient.email 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Email to Client
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  });/**
   * Enhanced Recommendations Tab with actionable insights
   */
  const RecommendationsTab = React.memo(() => (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Strategic Recommendations */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Strategic Recommendations</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Priority Actions for Quick Sale
              </h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Immediate:</span>
                  Professional staging and decluttering ($1,000-2,000) - Fastest impact on buyer perception
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Week 1:</span>
                  Professional photography and virtual tour ($500) - Essential for online marketing
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Week 2:</span>
                  Complete all minor repairs and touch-ups ($2,000) - Eliminate buyer objections
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Week 3:</span>
                  Fresh paint (interior/exterior) and landscaping ($5,000) - Maximum ROI improvements
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-green-800 mb-2 flex items-center">
                <span className="text-2xl mr-2">💰</span>
                High-ROI Improvements
              </h3>
              <ul className="space-y-2 text-green-700 text-sm">
                <li>• Interior/Exterior Paint: <strong>194% ROI</strong> - Essential for Florida homes, highest return</li>
                <li>• Professional Staging: <strong>188% ROI</strong> - Critical in buyer's market conditions</li>
                <li>• Landscaping: <strong>153% ROI</strong> - Curb appeal drives first impressions</li>
                <li>• Kitchen Updates: <strong>96% ROI</strong> - Focus on cosmetic improvements only</li>
              </ul>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-orange-800 mb-2 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                Market Timing Considerations
              </h3>
              <ul className="space-y-2 text-orange-700 text-sm">
                <li>• Current buyer's market with increasing inventory - More competition</li>
                <li>• Prices declining 1% monthly - Time is critical, act quickly</li>
                <li>• Average DOM increasing - Property condition is more important than ever</li>
                <li>• Best listing window: Before October for peak snowbird season activity</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-purple-800 mb-2 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Pricing Strategy
              </h3>
              <ul className="space-y-2 text-purple-700 text-sm">
                <li>• List at <strong>$299,900</strong> to attract more buyers (under $300K search threshold)</li>
                <li>• Be prepared for 96-97% of list price offers in current market</li>
                <li>• Consider buyer concessions for closing costs (2-3% typical)</li>
                <li>• Price reduction strategy: Drop 5% after 30 days if no offers</li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-red-800 mb-2 flex items-center">
                <span className="text-2xl mr-2">🚫</span>
                What NOT to Do
              </h3>
              <ul className="space-y-2 text-red-700 text-sm">
                <li>• Avoid luxury upgrades - Focus on essential improvements only</li>
                <li>• Don't overprice in current market conditions - Buyers have many options</li>
                <li>• Skip pool installation - Long ROI timeline, not cost-effective</li>
                <li>• Avoid listing without professional photos - Fatal marketing mistake</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Marketing Strategy */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Comprehensive Marketing Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <span className="text-lg mr-2">💻</span>
                Online Presence
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>MLS syndication to all major portals</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Virtual tour and drone footage</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Social media campaign (Facebook, Instagram)</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Targeted Facebook/Instagram ads ($300-500)</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>YouTube property tour video</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Google Ads for local searches</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <span className="text-lg mr-2">🏠</span>
                Traditional Marketing
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Professional signage with QR code</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Open houses (first 3 weekends)</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Broker caravan tour</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Direct mail to neighborhood (500 radius)</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Local newspaper real estate section</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Network referral program</li>
              </ul>
            </div>
          </div>
          
          {/* Marketing Timeline */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Marketing Launch Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-medium text-blue-700">Day 1-3</p>
                <p className="text-xs text-gray-600 mt-1">Photography, staging, MLS entry</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-medium text-blue-700">Day 4-7</p>
                <p className="text-xs text-gray-600 mt-1">Portal syndication, social media launch</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-medium text-blue-700">Week 2</p>
                <p className="text-xs text-gray-600 mt-1">First open house, broker tour</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-medium text-blue-700">Week 3+</p>
                <p className="text-xs text-gray-600 mt-1">Direct mail, print advertising</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  ));

  /**
   * Enhanced Mortgage Calculator Tab with validation and detailed breakdown
   */
  const MortgageCalculatorTab = React.memo(() => {
    const payment = React.useMemo(() => calculateMortgagePayment(), [calculateMortgagePayment]);

    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Mortgage Calculator</h2>
            
            {/* Error Display */}
            {payment.error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{payment.error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loan Details Input */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Loan Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Purchase Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        max="50000000"
                        value={mortgageData.purchasePrice}
                        onChange={(e) => updateMortgageData('purchasePrice', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="420000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Down Payment</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        max={mortgageData.purchasePrice}
                        value={mortgageData.downPayment}
                        onChange={(e) => updateMortgageData('downPayment', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="105000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {mortgageData.purchasePrice > 0 && (
                        `${((mortgageData.downPayment / mortgageData.purchasePrice) * 100).toFixed(1)}% of purchase price`
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="30"
                      value={mortgageData.interestRate}
                      onChange={(e) => updateMortgageData('interestRate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="7.25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Loan Term (years)</label>
                    <select
                      value={mortgageData.loanTerm}
                      onChange={(e) => updateMortgageData('loanTerm', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="15">15 years</option>
                      <option value="20">20 years</option>
                      <option value="25">25 years</option>
                      <option value="30">30 years</option>
                      <option value="40">40 years</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Property Tax ($/month)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          min="0"
                          value={mortgageData.propertyTax}
                          onChange={(e) => updateMortgageData('propertyTax', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="320"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Home Insurance ($/month)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          min="0"
                          value={mortgageData.homeInsurance}
                          onChange={(e) => updateMortgageData('homeInsurance', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="150"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">HOA Fees ($/month)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          min="0"
                          value={mortgageData.hoa}
                          onChange={(e) => updateMortgageData('hoa', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">PMI ($/month)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          min="0"
                          value={mortgageData.pmi}
                          onChange={(e) => updateMortgageData('pmi', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Payment Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Payment Breakdown</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-gray-600">Principal & Interest</p>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">CORE</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${payment.principal ? payment.principal.toFixed(0) : '0'}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      {mortgageData.interestRate}% APR for {mortgageData.loanTerm} years
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-gray-600">Property Tax</p>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">ESCROW</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">${mortgageData.propertyTax}</p>
                    <p className="text-xs text-green-500 mt-1">
                      ${(mortgageData.propertyTax * 12).toLocaleString()} annually
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-gray-600">Home Insurance</p>
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">ESCROW</span>
                    </div>
                    <p className="text-xl font-bold text-orange-600">${mortgageData.homeInsurance}</p>
                    <p className="text-xs text-orange-500 mt-1">
                      ${(mortgageData.homeInsurance * 12).toLocaleString()} annually
                    </p>
                  </div>

                  {(mortgageData.hoa > 0 || mortgageData.pmi > 0) && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-600">Other Fees</p>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">FEES</span>
                      </div>
                      <p className="text-lg font-bold text-purple-600">
                        ${(mortgageData.hoa + mortgageData.pmi)}
                      </p>
                      <div className="text-xs text-purple-500 mt-1 space-y-1">
                        {mortgageData.hoa > 0 && <p>HOA: ${mortgageData.hoa}/month</p>}
                        {mortgageData.pmi > 0 && <p>PMI: ${mortgageData.pmi}/month</p>}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-gray-600 font-semibold">Total Monthly Payment</p>
                      <span className="text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded">TOTAL</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">
                      ${payment.total ? payment.total.toFixed(0) : '0'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      All-inclusive monthly housing cost
                    </p>
                  </div>
                </div>
              </div>
            </div>{/* Loan Summary Statistics */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">Loan Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Loan Amount</p>
                  <p className="text-xl font-bold">${mortgageData.loanAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{mortgageData.loanTerm} year term</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Interest Paid</p>
                  <p className="text-xl font-bold">${payment.totalInterest ? payment.totalInterest.toFixed(0).toLocaleString() : '0'}</p>
                  <p className="text-xs text-gray-500">Over life of loan</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Down Payment %</p>
                  <p className="text-xl font-bold">
                    {mortgageData.purchasePrice > 0 ? 
                      ((mortgageData.downPayment / mortgageData.purchasePrice) * 100).toFixed(1) : '0'}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {mortgageData.downPayment < (mortgageData.purchasePrice * 0.2) ? 'PMI may apply' : 'No PMI required'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Debt-to-Income</p>
                  <p className="text-xl font-bold text-blue-600">Calculate</p>
                  <p className="text-xs text-gray-500">Enter income to calculate</p>
                </div>
              </div>
            </div>

            {/* Affordability Analysis */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-800 mb-2">Affordability Guidelines</h5>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• Housing payment should be ≤ 28% of gross monthly income</p>
                  <p>• Total debt payments should be ≤ 36% of gross monthly income</p>
                  <p>• Emergency fund: 3-6 months of payments recommended</p>
                  <p>• Consider maintenance costs: 1-3% of home value annually</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">Additional Costs to Consider</h5>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Closing costs: 2-5% of purchase price</p>
                  <p>• Moving expenses: $1,000-5,000</p>
                  <p>• Immediate repairs/updates: $2,000-10,000</p>
                  <p>• Utilities setup and deposits: $200-500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  });

  /**
   * Enhanced Client Data Entry Tab with comprehensive validation
   */
  const ClientDataEntryTab = React.memo(() => {
    const [newClientData, setNewClientData] = React.useState({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      address: '',
      city: '',
      state: 'FL',
      zip: '',
      subdivision: '',
      listPrice: '',
      purchasePrice: '',
      purchaseDate: '',
      sqft: '',
      bedrooms: '',
      bathrooms: '',
      lotSize: '',
      yearBuilt: '',
      propertyType: 'Single Family',
      condition: 'Fair',
      garage: '',
      pool: false,
      currentMortgageBalance: '',
      monthlyPayment: '',
      taxAssessment: '',
      annualTaxes: 3850,
      hoaFees: 0,
      mlsNumber: '',
      daysOnMarket: 0,
      latitude: 27.9778,
      longitude: -82.7264,
      hasDeck: false,
      hasDock: false,
      hasPorch: false,
      hasSpa: false,
      hasMasterSuite: false,
      hasSolarHeating: false,
      hasVaultedCeilings: false,
      roofCondition: 'Unknown',
      windowsCondition: 'Unknown',
      electricPanelCondition: 'Unknown',
      waterHeaterCondition: 'Unknown',
      doorsCondition: 'Unknown',
      paintCondition: 'Unknown',
      repairsNeeded: '',
    });

    const [formErrors, setFormErrors] = React.useState({});

    const validateForm = () => {
      const errors = {};

      // Client validation
      if (!newClientData.clientName.trim()) errors.clientName = 'Client name is required';
      if (!newClientData.clientEmail.trim()) {
        errors.clientEmail = 'Email is required';
      } else if (!validateEmail(newClientData.clientEmail)) {
        errors.clientEmail = 'Please enter a valid email address';
      }
      if (!newClientData.clientPhone.trim()) {
        errors.clientPhone = 'Phone number is required';
      } else if (!validatePhone(newClientData.clientPhone)) {
        errors.clientPhone = 'Please enter a valid phone number';
      }

      // Property validation
      if (!newClientData.address.trim()) errors.address = 'Property address is required';
      if (!newClientData.city.trim()) errors.city = 'City is required';
      if (!newClientData.zip.trim()) errors.zip = 'ZIP code is required';

      // Numeric validations
      if (newClientData.listPrice && !validateNumber(newClientData.listPrice, 1000, 100000000)) {
        errors.listPrice = 'List price must be between $1,000 and $100,000,000';
      }
      if (newClientData.sqft && !validateNumber(newClientData.sqft, 100, 50000)) {
        errors.sqft = 'Square footage must be between 100 and 50,000';
      }
      if (newClientData.yearBuilt && !validateYear(newClientData.yearBuilt)) {
        errors.yearBuilt = 'Please enter a valid year';
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setNewClientData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Clear specific error when user starts typing
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        showError('Please correct the errors in the form');
        return;
      }

      try {
        const newClient = {
          id: Date.now(),
          ...newClientData,
          createdAt: new Date().toISOString()
        };
        
        setClients(prev => [...prev, newClient]);
        
        // Reset form
        setNewClientData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          address: '',
          city: '',
          state: 'FL',
          zip: '',
          subdivision: '',
          listPrice: '',
          purchasePrice: '',
          purchaseDate: '',
          sqft: '',
          bedrooms: '',
          bathrooms: '',
          lotSize: '',
          yearBuilt: '',
          propertyType: 'Single Family',
          condition: 'Fair',
          garage: '',
          pool: false,
          currentMortgageBalance: '',
          monthlyPayment: '',
          taxAssessment: '',
          annualTaxes: 3850,
          hoaFees: 0,
          mlsNumber: '',
          daysOnMarket: 0,
          latitude: 27.9778,
          longitude: -82.7264,
          hasDeck: false,
          hasDock: false,
          hasPorch: false,
          hasSpa: false,
          hasMasterSuite: false,
          hasSolarHeating: false,
          hasVaultedCeilings: false,
          roofCondition: 'Unknown',
          windowsCondition: 'Unknown',
          electricPanelCondition: 'Unknown',
          waterHeaterCondition: 'Unknown',
          doorsCondition: 'Unknown',
          paintCondition: 'Unknown',
          repairsNeeded: '',
        });
        
        setFormErrors({});
        showSuccess(`Client ${newClient.clientName} saved successfully!`);
        
      } catch (error) {
        console.error('Error saving client:', error);
        showError('Failed to save client data');
      }
    };

    const conditionOptions = ['Unknown', 'New', 'Good', 'Fair', 'Needs Repair', 'Original'];

    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Client & Property Data Entry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Client Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Client Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="clientName" 
                      value={newClientData.clientName} 
                      onChange={handleChange} 
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.clientName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="John Doe"
                    />
                    {formErrors.clientName && <p className="text-xs text-red-600 mt-1">{formErrors.clientName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Client Email <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="clientEmail" 
                      value={newClientData.clientEmail} 
                      onChange={handleChange} 
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.clientEmail ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="john@example.com"
                    />
                    {formErrors.clientEmail && <p className="text-xs text-red-600 mt-1">{formErrors.clientEmail}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Client Phone <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="clientPhone" 
                      value={newClientData.clientPhone} 
                      onChange={handleChange} 
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.clientPhone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="(727) 555-0123"
                    />
                    {formErrors.clientPhone && <p className="text-xs text-red-600 mt-1">{formErrors.clientPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Property Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Property Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Property Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="address" 
                      value={newClientData.address} 
                      onChange={handleChange} 
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="123 Main Street"
                    />
                    {formErrors.address && <p className="text-xs text-red-600 mt-1">{formErrors.address}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="city" 
                      value={newClientData.city} 
                      onChange={handleChange} 
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Clearwater"
                    />
                    {formErrors.city && <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                    <select 
                      name="state" 
                      value={newClientData.state} 
                      onChange={handleChange} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="FL">Florida</option>
                      <option value="AL">Alabama</option>
                      <option value="GA">Georgia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="zip" 
                      value={newClientData.zip} 
                      onChange={handleChange} 
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.zip ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="33763"
                    />
                    {formErrors.zip && <p className="text-xs text-red-600 mt-1">{formErrors.zip}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Subdivision</label>
                    <input 
                      type="text" 
                      name="subdivision" 
                      value={newClientData.subdivision} 
                      onChange={handleChange} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Clearwater Acres"
                    />
                  </div><div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">List Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input 
                        type="number" 
                        name="listPrice" 
                        value={newClientData.listPrice} 
                        onChange={handleChange} 
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.listPrice ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="305000"
                      />
                    </div>
                    {formErrors.listPrice && <p className="text-xs text-red-600 mt-1">{formErrors.listPrice}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Square Footage</label>
                    <input 
                      type="number" 
                      name="sqft" 
                      value={newClientData.sqft} 
                      onChange={handleChange} 
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.sqft ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="1148"
                    />
                    {formErrors.sqft && <p className="text-xs text-red-600 mt-1">{formErrors.sqft}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Bedrooms</label>
                    <input 
                      type="number" 
                      name="bedrooms" 
                      min="0" 
                      max="20" 
                      value={newClientData.bedrooms} 
                      onChange={handleChange} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Bathrooms</label>
                    <input 
                      type="number" 
                      name="bathrooms" 
                      step="0.5" 
                      min="0" 
                      max="20" 
                      value={newClientData.bathrooms} 
                      onChange={handleChange} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Year Built</label>
                    <input 
                      type="number" 
                      name="yearBuilt" 
                      min="1800" 
                      max="2030" 
                      value={newClientData.yearBuilt} 
                      onChange={handleChange} 
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.yearBuilt ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="1972"
                    />
                    {formErrors.yearBuilt && <p className="text-xs text-red-600 mt-1">{formErrors.yearBuilt}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Property Type</label>
                    <select 
                      name="propertyType" 
                      value={newClientData.propertyType} 
                      onChange={handleChange} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Single Family">Single Family</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Multi-Family">Multi-Family</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Condition</label>
                    <select 
                      name="condition" 
                      value={newClientData.condition} 
                      onChange={handleChange} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        name="pool" 
                        checked={newClientData.pool} 
                        onChange={handleChange} 
                        className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Pool</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Property Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[
                    { key: 'hasDeck', label: 'Deck' },
                    { key: 'hasDock', label: 'Dock' },
                    { key: 'hasPorch', label: 'Porch' },
                    { key: 'hasSpa', label: 'Spa' },
                    { key: 'hasMasterSuite', label: 'Master Suite' },
                    { key: 'hasSolarHeating', label: 'Solar Heating' },
                    { key: 'hasVaultedCeilings', label: 'Vaulted Ceilings' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        name={key} 
                        checked={newClientData[key]} 
                        onChange={handleChange} 
                        className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition Assessment Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Condition Assessment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'roofCondition', label: 'Roof' },
                    { key: 'windowsCondition', label: 'Windows' },
                    { key: 'electricPanelCondition', label: 'Electric Panel' },
                    { key: 'waterHeaterCondition', label: 'Water Heater' },
                    { key: 'doorsCondition', label: 'Doors' },
                    { key: 'paintCondition', label: 'Paint' }
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-600 mb-1">{label}:</label>
                      <select
                        name={key}
                        value={newClientData[key]}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {conditionOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repair Notes Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Additional Notes</h3>
                <textarea
                  name="repairsNeeded"
                  placeholder="List any known repairs needed, or additional details about the property's condition..."
                  value={newClientData.repairsNeeded}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                ></textarea>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-center">
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Save Client & Property Data
                </button>
              </div>
            </form>
          </div>
          
          {/* Saved Clients Display */}
          {clients.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Saved Clients ({clients.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left">Name</th>
                      <th className="border border-gray-300 p-3 text-left">Email</th>
                      <th className="border border-gray-300 p-3 text-left">Property</th>
                      <th className="border border-gray-300 p-3 text-left">List Price</th>
                      <th className="border border-gray-300 p-3 text-left">Created</th>
                      <th className="border border-gray-300 p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice(-10).reverse().map(client => (
                      <tr key={client.id} className="hover:bg-blue-50">
                        <td className="border border-gray-300 p-3 font-medium">{client.clientName}</td>
                        <td className="border border-gray-300 p-3 text-sm text-gray-600">{client.clientEmail}</td>
                        <td className="border border-gray-300 p-3 text-sm">{client.address}</td>
                        <td className="border border-gray-300 p-3 font-semibold text-green-600">
                          {client.listPrice ? `${parseInt(client.listPrice).toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="border border-gray-300 p-3 text-xs text-gray-500">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          <button
                            onClick={() => {
                              setCurrentClientId(client.id);
                              setPropertyData(prev => ({
                                ...prev,
                                address: client.address || prev.address,
                                listPrice: parseInt(client.listPrice) || prev.listPrice,
                                sqft: parseInt(client.sqft) || prev.sqft,
                                bedrooms: parseInt(client.bedrooms) || prev.bedrooms,
                                bathrooms: parseFloat(client.bathrooms) || prev.bathrooms,
                                yearBuilt: parseInt(client.yearBuilt) || prev.yearBuilt,
                                condition: client.condition || prev.condition,
                                pool: client.pool || prev.pool
                              }));
                              setCurrentClient(prev => ({
                                ...prev,
                                name: client.clientName,
                                email: client.clientEmail,
                                phone: client.clientPhone
                              }));
                              setActiveTab('overview');
                              showSuccess(`Loaded data for ${client.clientName}`);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            Load
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {clients.length > 10 && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Showing most recent 10 clients (Total: {clients.length})
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  });/**
   * Enhanced Findings Tab with comprehensive reporting and version control
   */
  const FindingsTab = React.memo(() => (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Findings and Executive Summary */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Findings & Executive Summary</h2>
          
          {/* Manual Findings Entry */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manual Findings & Observations
            </label>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="6"
              placeholder="Document key findings from the property analysis, market research, and client consultation..."
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Character count: {findings.length} | Auto-saved as you type
            </p>
          </div>

          {/* AI-Generated Executive Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI-Generated Executive Summary
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-inner min-h-[200px]">
              {executiveSummary ? (
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      AI Analysis Complete
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(executiveSummary);
                        showSuccess('Summary copied to clipboard');
                      }}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {executiveSummary}
                  </pre>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-3">🤖</div>
                  <p className="text-sm">Click "Run AI Analysis" to generate a comprehensive executive summary</p>
                  <p className="text-xs mt-2">Analysis includes property condition, market factors, and strategic recommendations</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              onClick={runAIModeling}
              disabled={isLoading}
              className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-colors ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
            
            <button
              onClick={saveVersion}
              disabled={!propertyData.address}
              className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-colors ${
                !propertyData.address 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Save Version
            </button>
            
            <button
              onClick={sendEmail}
              disabled={isLoading || !currentClient.email || (!executiveSummary && !findings)}
              className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-colors ${
                isLoading || !currentClient.email || (!executiveSummary && !findings) 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Email Report
            </button>

            <button
              onClick={exportPDF}
              disabled={isLoading || (!executiveSummary && !findings)}
              className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-colors ${
                isLoading || (!executiveSummary && !findings) 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Version History */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Version History</h3>
          {versions.length > 0 ? (
            <div className="space-y-3">
              {versions.slice(-10).reverse().map((version, index) => (
                <div key={version.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Version {versions.length - index}
                      </p>
                      <p className="text-xs text-gray-500">
                        Saved: {new Date(version.timestamp).toLocaleString()}
                      </p>
                      {version.userNote && (
                        <p className="text-xs text-blue-600 mt-1">{version.userNote}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (window.confirm('Load this version? Current unsaved changes will be lost.')) {
                            setPropertyData(version.propertyData);
                            setRepairBudgets(version.repairBudgets);
                            showSuccess(`Loaded version from ${new Date(version.timestamp).toLocaleString()}`);
                          }
                        }}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this version permanently?')) {
                            setVersions(prev => prev.filter((_, i) => i !== versions.indexOf(version)));
                            showSuccess('Version deleted');
                          }
                        }}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Property:</span>
                      <p>{version.propertyData?.address?.split(',')[0] || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">List Price:</span>
                      <p>${version.propertyData?.listPrice?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total Investment:</span>
                      <p>${Object.values(version.repairBudgets || {}).reduce((sum, val) => sum + (val || 0), 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Client:</span>
                      <p>{version.clientId ? `ID: ${version.clientId}` : 'Demo'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {versions.length > 10 && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  Showing most recent 10 versions (Total: {versions.length})
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl text-gray-300 mb-3">📄</div>
              <p className="text-gray-500">No versions saved yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Save a version to track changes to your analysis over time.
              </p>
            </div>
          )}
        </div>

        {/* Property Photos */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Property Photos</h3>
          
          {propertyPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {propertyPhotos.map((photo, index) => (
                <div key={photo.id || index} className="relative group">
                  <img 
                    src={photo.src || photo} 
                    alt={`Property ${index + 1}`} 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = photo.src || photo;
                          link.download = `property-photo-${index + 1}.jpg`;
                          link.click();
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id || index)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {photo.name && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{photo.name}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg mb-6">
              <div className="text-4xl text-gray-300 mb-3">📷</div>
              <p className="text-gray-500">No photos uploaded yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Upload property photos to enhance your analysis and reports.
              </p>
            </div>
          )}

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={propertyPhotos.length >= 20}
              />
              <span className="text-xs text-gray-500">
                {propertyPhotos.length}/20 photos
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, WebP (max 5MB each)
              </p>
              {propertyPhotos.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Delete all photos? This action cannot be undone.')) {
                      setPropertyPhotos([]);
                      showSuccess('All photos deleted');
                    }
                  }}
                  className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
                >
                  Clear All Photos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  ));/**
   * Main tab content renderer with enhanced error handling
   */
  const renderTabContent = () => {
    try {
      switch (activeTab) {
        case 'overview':
          return <PropertyOverviewTab />;
        case 'analysis':
          return <PropertyAnalysisTab />;
        case 'comparables':
          return <MarketComparablesTab />;
        case 'trends':
          return <PriceTrendsTab />;
        case 'marketfactors':
          return <MarketFactorsTab />;
        case 'cma':
          return <CMAReportTab />;
        case 'recommendations':
          return <RecommendationsTab />;
        case 'mortgage':
          return <MortgageCalculatorTab />;
        case 'dataentry':
          return <ClientDataEntryTab />;
        case 'findings':
          return <FindingsTab />;
        default:
          return <PropertyOverviewTab />;
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">Tab Loading Error</h2>
          <p className="text-red-700 mb-4">
            Unable to load the {activeTab} tab. Please try refreshing or selecting a different tab.
          </p>
          <button 
            onClick={() => setActiveTab('overview')} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Overview
          </button>
        </div>
      );
    }
  };

  // Loading state with enhanced messaging
  if (isLoading && activeTab !== 'comparables') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner 
          message={
            activeTab === 'findings' ? 'Generating AI analysis...' :
            activeTab === 'cma' ? 'Preparing CMA report...' :
            'Loading property data...'
          } 
          size="large" 
        />
      </div>
    );
  }

  // Authentication screen with enhanced UI
  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100'>
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
          <div className="text-center mb-6">
            <div className="bg-blue-900 text-white p-4 rounded-lg inline-block mb-4">
              <div className="font-bold text-2xl">CLUES</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">S.M.A.R.T. Dashboard</h2>
            <p className="text-gray-600 text-sm mt-2">Strategic Market Analysis & Recommendation Tool</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loginForm.isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                loginForm.isSubmitting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loginForm.isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• admin@clues.com / dashboard2024</p>
              <p>• demo@clues.com / demo123</p>
              <p>• test@clues.com / test123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main application render
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 font-sans">
        <Header />
        <TabNavigation />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {renderTabContent()}
        </main>
        
        {/* Success Message Toast */}
        <MessageToast 
          message={showSuccessMessage} 
          type="success" 
          onClose={() => setShowSuccessMessage('')} 
        />
        
        {/* Error Message Toast */}
        <MessageToast 
          message={showErrorMessage} 
          type="error" 
          onClose={() => setShowErrorMessage('')} 
        />
      </div>
    </ErrorBoundary>
  );
};

// Export the complete application wrapped with error boundary
export default React.memo(() => (
  <ErrorBoundary>
    <CLUESSmartDashboard />
  </ErrorBoundary>
));