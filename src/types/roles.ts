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
  MANAGER_USER = 'manager_user',
}
