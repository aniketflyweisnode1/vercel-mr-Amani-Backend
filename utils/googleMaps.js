/**
 * Google Maps API utility
 * Handles Google Maps API calls including Geocoding
 */

const https = require('https');
const { URL } = require('url');
const logger = require('./logger');

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = 'AIzaSyC-bI0hcm2UXFvNpthe8UkZEhcaUbpRnmk';
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

/**
 * Make HTTP GET request using Node.js https module
 * @param {string} urlString - URL to request
 * @returns {Promise<Object>} Parsed JSON response
 */
const makeHttpRequest = (urlString) => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Node.js Google Maps API Client'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({ data: parsedData, status: res.statusCode });
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    } catch (error) {
      reject(new Error(`Invalid URL: ${error.message}`));
    }
  });
};

/**
 * Geocode an address to get latitude and longitude
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} Geocoding result
 */
const geocodeAddress = async (address) => {
  try {
    if (!address || typeof address !== 'string' || address.trim() === '') {
      throw new Error('Address is required and must be a non-empty string');
    }

    const encodedAddress = encodeURIComponent(address.trim());
    const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;

    logger.info('Geocoding address', { address, url: url.replace(GOOGLE_MAPS_API_KEY, '***') });

    const response = await makeHttpRequest(url);

    if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;

      return {
        success: true,
        status: response.data.status,
        address: result.formatted_address,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        placeId: result.place_id,
        types: result.types,
        addressComponents: result.address_components,
        geometry: {
          locationType: result.geometry.location_type,
          viewport: result.geometry.viewport,
          bounds: result.geometry.bounds
        },
        fullResponse: response.data
      };
    } else if (response.data.status === 'ZERO_RESULTS') {
      return {
        success: false,
        status: response.data.status,
        message: 'No results found for the given address',
        address: address
      };
    } else if (response.data.status === 'REQUEST_DENIED') {
      logger.error('Google Maps API request denied', { status: response.data.status, errorMessage: response.data.error_message });
      return {
        success: false,
        status: response.data.status,
        message: response.data.error_message || 'Request denied. Please check API key and permissions.',
        address: address
      };
    } else {
      logger.error('Google Maps API error', { status: response.data.status, errorMessage: response.data.error_message });
      return {
        success: false,
        status: response.data.status,
        message: response.data.error_message || 'Geocoding failed',
        address: address
      };
    }
  } catch (error) {
    logger.error('Error geocoding address', { error: error.message, address });
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

/**
 * Reverse geocode coordinates to get address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Reverse geocoding result
 */
const reverseGeocode = async (lat, lng) => {
  try {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error('Latitude and longitude must be numbers');
    }

    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    if (lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    logger.info('Reverse geocoding coordinates', { lat, lng, url: url.replace(GOOGLE_MAPS_API_KEY, '***') });

    const response = await makeHttpRequest(url);

    if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];

      return {
        success: true,
        status: response.data.status,
        address: result.formatted_address,
        placeId: result.place_id,
        types: result.types,
        addressComponents: result.address_components,
        geometry: result.geometry,
        fullResponse: response.data
      };
    } else {
      logger.error('Reverse geocoding error', { status: response.data.status, errorMessage: response.data.error_message });
      return {
        success: false,
        status: response.data.status,
        message: response.data.error_message || 'Reverse geocoding failed',
        coordinates: { lat, lng }
      };
    }
  } catch (error) {
    logger.error('Error reverse geocoding', { error: error.message, lat, lng });
    throw new Error(`Reverse geocoding failed: ${error.message}`);
  }
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  GOOGLE_MAPS_API_KEY
};
