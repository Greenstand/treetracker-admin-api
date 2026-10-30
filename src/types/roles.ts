/**
 * Keycloak realm role names used across the application.
 *
 * These must match the role names defined in your Keycloak realm exactly.
 * The same names are also used in the legacy JWT permission system (auth.js)
 * as the POLICIES constants.
 */
export enum Role {
  ORGANIZATION = 'org',
  ADMIN = 'greenstand-admin',
  APPROVE_TREE = 'approve_tree',
  SUPER_PERMISSION = 'super_permission',
  LIST_TREE = 'list_tree',
  LIST_PLANTER = 'list_planter',
  MANAGE_PLANTER = 'manage_planter',
  MANAGER_USER = 'manager_user',
  WALLET_ADMIN = 'wallet-admin',
}

// Roles that may read captures across every organization, matching the
// legacy isAuth rules for /api/trees in src/js/auth.js.
export const TREE_READ_ROLES: string[] = [
  Role.ADMIN,
  Role.SUPER_PERMISSION,
  Role.LIST_TREE,
  Role.APPROVE_TREE,
];

// Roles that may read growers across every organization, matching the
// legacy isAuth rules for /api/planter in src/js/auth.js.
export const PLANTER_READ_ROLES: string[] = [
  Role.ADMIN,
  Role.SUPER_PERMISSION,
  Role.LIST_PLANTER,
  Role.MANAGE_PLANTER,
];
