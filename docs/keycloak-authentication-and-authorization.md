# Keycloak Authentication and Authorization

This guide describes the runtime Keycloak flow used by the `keycloak` branch of
`treetracker-admin-api`. Configuration and organization-onboarding steps remain
in the main [README](../README.md).

## Authentication flow

When `KEYCLOAK_URL` is configured, the API mounts Keycloak authentication on
`/api` requests:

1. The client sends an access token in the `Authorization: Bearer <token>` header.
2. `src/middleware/keycloakMiddleware.ts` verifies the token against the configured
   realm JWKS using `jose`.
3. The middleware validates the issuer and, when configured,
   `KEYCLOAK_CLIENT_EXPECTED_CLIENT_ID` against the token `azp` claim.
4. Realm and client roles are normalized into `request.user.policy.policies`.
5. The `organization_id` claim is normalized into
   `request.user.policy.organization`.

Invalid, expired, missing, or incorrectly issued tokens are rejected with `401`.
Authentication only proves that the token is valid; it does not grant access to
every API operation.

## Authorization flow

Route-level authorization is applied after authentication:

- `requireRole` checks whether the request has one of the roles supplied by a route.
- `requireStaffRole` protects unscoped routes and rejects users with an organization
  claim. Staff access is granted through the `greenstand-admin` role.
- `requireOrganizationAccess` checks the first route argument against an organization
  user's `organization_id`. Organization users may access only their own organization;
  staff users with the accepted role may access any organization.

The current Keycloak role model is:

- `greenstand-admin`: staff-wide access.
- `org`: organization-scoped access.

For example, an organization-scoped route must receive the organization ID as its
first controller argument so the interceptor can compare it with the token claim.
Controllers may also perform an additional record-to-organization check as defense
in depth.

## Keycloak clients

The frontend and backend use separate clients:

- `treetracker-admin-client-fe` obtains the user access token and sends it to the API.
- `treetracker-admin-client-be` uses service-account credentials for administrative
  Keycloak operations, such as updating the user's `organization_id` attribute and
  assigning the `org` role.

The frontend client secret must not be used for backend administrative operations.

## Troubleshooting

- A `401` usually indicates a missing, expired, invalid, or incorrectly issued token.
- A `403` indicates that authentication succeeded but the user's role or organization
  scope does not permit the requested operation.
- If a token contains `org` but not `organization_id`, verify the frontend client's
  `organization_id` mapper and issue a fresh token by signing in again.
- If organization creation cannot assign the role or user attribute, verify the backend
  service-account permissions described in the main README.
