import { GetUserType, Role } from 'src/common/types';
import { ForbiddenException } from '@nestjs/common';

/**
 * Implements Ownership-Based Access Control combined with Role-Based Access Control (RBAC).
 *
 * The check will return `true` if:
 * 1. The user is the owner of the resource (UID matches), OR
 * 2. The user has a role included in the allowed roles array (default is ['admin']).
 *
 * @param {GetUserType} user - An object representing the user, consisting of a `uid` (unique identifier) and a `roles` array.
 * @param {string|string[]} [requestedUid] - The UID(s) associated with the resource being accessed. The UID(s) are used to check if the user owns the resource.
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
