/**
 * Format a date object to YYYY-MM-DD format for input[type="date"]
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  // If it's already a string in YYYY-MM-DD format, return it
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // Ensure we have a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }
  
  // Format as YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a date for display in the UI
 * @param {Date|string} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} The formatted date string
 */
export const formatDisplayDate = (date, options = {}) => {
  if (!date) return '';
  
  // Ensure we have a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }
  
  // Default options
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  // Merge with provided options
  const formattingOptions = { ...defaultOptions, ...options };
  
  // Format the date using Intl.DateTimeFormat
  return new Intl.DateTimeFormat('en-US', formattingOptions).format(dateObj);
};

/**
 * Calculate the difference between two dates in days
 * @param {Date|string} date1 - The first date
 * @param {Date|string} date2 - The second date
 * @returns {number} The difference in days
 */
export const daysBetween = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  // Ensure we have Date objects
  const dateObj1 = date1 instanceof Date ? date1 : new Date(date1);
  const dateObj2 = date2 instanceof Date ? date2 : new Date(date2);
  
  // Check if the dates are valid
  if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) {
    console.error('Invalid date(s):', date1, date2);
    return 0;
  }
  
  // Calculate the difference in milliseconds
  const diffTime = Math.abs(dateObj2 - dateObj1);
  
  // Convert to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  
  // Ensure we have a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return false;
  }
  
  // Set time to midnight for comparison
  dateObj.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};

/**
 * Check if a date is within a specified number of days from now
 * @param {Date|string} date - The date to check
 * @param {number} days - The number of days
 * @returns {boolean} True if the date is within the specified days
 */
export const isWithinDays = (date, days) => {
  if (!date) return false;
  
  // Ensure we have a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return false;
  }
  
  // Set time to midnight for comparison
  dateObj.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  return dateObj >= today && dateObj <= futureDate;
};
