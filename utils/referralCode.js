/**
 * Generate a unique 10-character alphanumeric referral code
 * @returns {string} 10-character alphanumeric code
 */
const generateReferralCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};

/**
 * Generate a unique referral code that doesn't exist in the database
 * @param {Model} UserModel - Mongoose User model
 * @returns {Promise<string>} Unique referral code
 */
const generateUniqueReferralCode = async (UserModel) => {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop
  
  while (!isUnique && attempts < maxAttempts) {
    code = generateReferralCode();
    const existingUser = await UserModel.findOne({ ReferralCode: code });
    
    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Failed to generate unique referral code after multiple attempts');
  }
  
  return code;
};

module.exports = {
  generateReferralCode,
  generateUniqueReferralCode
};

