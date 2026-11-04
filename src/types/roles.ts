/**
 * Keycloak realm role names used across the application.
 *
 * These must match the role names defined in your Keycloak realm exactly.
 */
export enum Role {
  ORGANIZATION = 'org',
  ADMIN = 'greenstand-admin',
  WALLET_ADMIN = 'wallet-admin',
}
