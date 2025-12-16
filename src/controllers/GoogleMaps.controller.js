const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { geocodeAddress, reverseGeocode } = require('../../utils/googleMaps');

/**
 * Geocode an address
 * @route   POST /api/v2/googlemaps/geocode
 * @access  Public
 */
const geocode = asyncHandler(async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return sendError(res, 'Address is required', 400);
    }

    const result = await geocodeAddress(address);

    if (result.success) {
      return sendSuccess(res, result, 'Address geocoded successfully', 200);
    } else {
      return sendError(res, result.message || 'Geocoding failed', 400);
    }
  } catch (error) {
    console.error('Error in geocode controller', { error: error.message });
    return sendError(res, error.message || 'Failed to geocode address', 500);
  }
});

/**
 * Reverse geocode coordinates
 * @route   POST /api/v2/googlemaps/reverse-geocode
 * @access  Public
 */
const reverseGeocodeCoordinates = asyncHandler(async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    const result = await reverseGeocode(lat, lng);

    if (result.success) {
      return sendSuccess(res, result, 'Coordinates reverse geocoded successfully', 200);
    } else {
      return sendError(res, result.message || 'Reverse geocoding failed', 400);
    }
  } catch (error) {
    console.error('Error in reverse geocode controller', { error: error.message });
    return sendError(res, error.message || 'Failed to reverse geocode coordinates', 500);
  }
});

module.exports = {
  geocode,
  reverseGeocodeCoordinates
};
