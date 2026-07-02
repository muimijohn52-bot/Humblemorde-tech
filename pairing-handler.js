const pino = require('pino');

// Initialize logger
const logger = pino();

class PairingHandler {
  constructor() {
    this.pairingCodes = new Map(); // Store pairing codes with timestamps
    this.pairingTimeout = 300000; // 5 minutes expiry
  }

  /**
   * Generate and store an 8-digit pairing code
   * @param {string} phoneNumber - User's phone number
   * @returns {object} - Pairing code details
   */
  generatePairingCode(phoneNumber) {
    try {
      // Generate random 8-digit code
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      const timestamp = Date.now();
      const expiresAt = timestamp + this.pairingTimeout;

      // Store pairing code
      this.pairingCodes.set(code, {
        phoneNumber,
        timestamp,
        expiresAt,
        used: false
      });

      logger.info(`Generated pairing code for ${phoneNumber}`);

      // Auto-cleanup expired code after 5 minutes
      setTimeout(() => {
        this.pairingCodes.delete(code);
        logger.info(`Pairing code ${code} expired and removed`);
      }, this.pairingTimeout);

      return {
        success: true,
        pairingCode: code,
        expiresIn: Math.floor(this.pairingTimeout / 1000),
        message: `Pairing code generated. Enter this code in WhatsApp within ${Math.floor(this.pairingTimeout / 1000)} seconds.`
      };
    } catch (error) {
      logger.error(`Error generating pairing code: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate pairing code
   * @param {string} code - The 8-digit pairing code
   * @returns {object} - Validation result
   */
  validatePairingCode(code) {
    try {
      if (!this.pairingCodes.has(code)) {
        logger.warn(`Invalid pairing code attempted: ${code}`);
        return {
          valid: false,
          message: 'Invalid pairing code'
        };
      }

      const pairingData = this.pairingCodes.get(code);

      // Check if code has expired
      if (Date.now() > pairingData.expiresAt) {
        this.pairingCodes.delete(code);
        logger.warn(`Expired pairing code used: ${code}`);
        return {
          valid: false,
          message: 'Pairing code expired'
        };
      }

      // Check if code already used
      if (pairingData.used) {
        logger.warn(`Already used pairing code attempted: ${code}`);
        return {
          valid: false,
          message: 'Pairing code already used'
        };
      }

      // Mark as used
      pairingData.used = true;
      logger.info(`Pairing code validated successfully: ${code}`);

      return {
        valid: true,
        phoneNumber: pairingData.phoneNumber,
        message: 'Pairing code valid'
      };
    } catch (error) {
      logger.error(`Error validating pairing code: ${error.message}`);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Get all active pairing codes (for admin purposes)
   * @returns {array} - Array of active pairing codes
   */
  getActiveCodes() {
    const activeCodes = [];
    this.pairingCodes.forEach((data, code) => {
      if (!data.used && Date.now() <= data.expiresAt) {
        activeCodes.push({
          code,
          phoneNumber: data.phoneNumber,
          expiresIn: Math.floor((data.expiresAt - Date.now()) / 1000)
        });
      }
    });
    return activeCodes;
  }

  /**
   * Revoke a pairing code
   * @param {string} code - The 8-digit pairing code
   * @returns {boolean} - Success status
   */
  revokePairingCode(code) {
    if (this.pairingCodes.has(code)) {
      this.pairingCodes.delete(code);
      logger.info(`Pairing code revoked: ${code}`);
      return true;
    }
    return false;
  }

  /**
   * Clear all expired codes
   */
  clearExpiredCodes() {
    let cleared = 0;
    this.pairingCodes.forEach((data, code) => {
      if (Date.now() > data.expiresAt) {
        this.pairingCodes.delete(code);
        cleared++;
      }
    });
    if (cleared > 0) {
      logger.info(`Cleared ${cleared} expired pairing codes`);
    }
  }
}

module.exports = new PairingHandler();
