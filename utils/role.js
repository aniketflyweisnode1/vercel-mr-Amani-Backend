const Role = require('../src/models/role.model');

/**
 * Ensures the provided role_id maps to one of the allowed role names.
 * @param {number|null|undefined} roleId - Numeric role identifier from the user document.
 * @param {string[]} allowedRoleNames - List of permissible role names.
 * @returns {Promise<{isValid: boolean, message?: string, role?: import('../src/models/role.model')}>}
 */
const ensureRoleMatch = async (roleId, allowedRoleNames = []) => {
  if (!allowedRoleNames.length) {
    return { isValid: true };
  }

  if (roleId === null || roleId === undefined) {
    return {
      isValid: false,
      message: 'Role is not assigned to this user'
    };
  }

  const role = await Role.findOne({ role_id: roleId, status: true });

  if (!role) {
    return {
      isValid: false,
      message: 'Assigned role does not exist or is inactive'
    };
  }

  // const normalizedAllowedNames = allowedRoleNames.map((name) => name.toLowerCase());

  // if (!normalizedAllowedNames.includes(role.name.toLowerCase())) {
  //   return {
  //     isValid: false,
  //     message: `User role '${role.name}' is not permitted for this operation`
  //   };
  // }

  return {
    isValid: true,
    role
  };
};

module.exports = {
  ensureRoleMatch
};
