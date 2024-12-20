import { GetUserType, Role } from 'src/common/types';
import { ForbiddenException } from '@nestjs/common';

/**
 * Implements Ownership-Based Access Control combined with Role-Based Access Control (RBAC).
 * Determines if a user has permission to access a specific record based on their user ID or assigned roles.
 * Returns true if the user's ID (uid) matches the requestedUid, either directly or indirectly, or if the user possesses a permitted role.
 *
 * @param {string} user.uid - The unique identifier of the user.
 * @param {string|string[]} [requestedUid] - The UID(s) associated with the User table, either directly or indirectly.
 * @param {string[]} [roles=['admin']] - An array of roles permitted to access the record, bypassing the UID permission check. Defaults to ['admin'].
 * @returns {boolean} - Returns true if the user has permission; otherwise, throws a ForbiddenException.
 */
export const checkRowLevelPermission = (
  user: GetUserType,
  requestedUid?: string | string[],
  roles: Role[] = ['admin'],
) => {
  if (!requestedUid) return false;

  if (user.roles?.some((role) => roles.includes(role))) {
    return true;
  }

  const uids =
    typeof requestedUid === 'string'
      ? [requestedUid]
      : requestedUid.filter(Boolean);

  if (!uids.includes(user.uid)) {
    throw new ForbiddenException('');
  }
};
