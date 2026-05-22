const QRCode = require('qrcode');

/**
 * Generate a standard base64 QR Code string for embedded image elements
 * @param {string} text - The raw text to encode inside the QR code
 * @returns {Promise<string>} - Returns base64 image data URL
 */
const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      color: {
        dark: '#0f172a',  // deep slate
        light: '#ffffff'  // white background
      },
      margin: 1,
      width: 150
    });
  } catch (err) {
    console.error('[QR Generation Error]', err);
    return '';
  }
};

/**
 * Calculates academic grade and grade points based on percentage score
 * @param {number} score - Obtained marks
 * @param {number} total - Total possible marks
 * @returns {object} - { grade: string, points: number, remarks: string }
 */
const calculateGrade = (score, total) => {
  const percentage = (score / total) * 100;
  if (percentage >= 90) return { grade: 'A+', points: 10, remarks: 'Outstanding' };
  if (percentage >= 80) return { grade: 'A', points: 9, remarks: 'Excellent' };
  if (percentage >= 70) return { grade: 'B', points: 8, remarks: 'Very Good' };
  if (percentage >= 60) return { grade: 'C', points: 7, remarks: 'Good' };
  if (percentage >= 50) return { grade: 'D', points: 6, remarks: 'Satisfactory' };
  if (percentage >= 40) return { grade: 'E', points: 5, remarks: 'Pass' };
  return { grade: 'F', points: 0, remarks: 'Fail' };
};

/**
 * Formats a Date object to a clean string format (DD/MM/YYYY)
 * @param {Date|string} date - Date object or date string
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

module.exports = {
  generateQRCode,
  calculateGrade,
  formatDate
};
