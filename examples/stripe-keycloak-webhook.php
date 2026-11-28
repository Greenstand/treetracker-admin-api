<?php
// Supply these through the server environment, or retain your existing
// assignments for the five original settings here.
$stripeWebhookSecret = getenv('STRIPE_WEBHOOK_SECRET') ?: '';
$keycloakUrl = 'https://dev-k8s.treetracker.org/keycloak';
$realm = 'treetracker';
$clientId = 'stripe-provisioner';
$clientSecret = getenv('KEYCLOAK_CLIENT_SECRET') ?: '';

// Additional configuration.
$stripeSecretKey = getenv('STRIPE_SECRET_KEY') ?: '';
$stripeLivemode = true;
$stripeApiVersion = getenv('STRIPE_API_VERSION') ?: null;
// With this script in html/typo3/stripe, stripe-log is its sibling.
$stripeLogFile = getenv('STRIPE_LOG_FILE') ?: dirname(__DIR__) . '/stripe-log/stripe-debug.log';

// Webhook implementation starts here.
$priceToRole = [
    'price_1Tl08WGmNPVjwaUK3CmkVYSh' => 'subscriber_seed',
    'price_1Tl0ARGmNPVjwaUKAcknPXis' => 'subscriber_root',
    'price_1Tl0C7GmNPVjwaUKGsnSveav' => 'subscriber_base',
    'price_1Tl0DGGmNPVjwaUKFszdG7t4' => 'subscriber_crown',
];
$rolePriority = ['subscriber_seed', 'subscriber_root', 'subscriber_base', 'subscriber_crown'];
$stripeLivemode = $stripeLivemode ?? true;
$stripeApiVersion = $stripeApiVersion ?? null;

function logMsg($message) {
    global $stripeLogFile;
    $line = gmdate('Y-m-d\TH:i:s\Z') . ' [greenstand-stripe] '
        . str_replace(["\r", "\n"], ' ', $message) . PHP_EOL;
    if (@file_put_contents($stripeLogFile, $line, FILE_APPEND | LOCK_EX) === false) {
        if (!headers_sent()) header('X-Greenstand-Log: unavailable');
        error_log('[greenstand-stripe] Could not write webhook log. ' . trim($line));
    }
}

function verifyStripeSignature($payload, $header, $secret, $now = null) {
    if (!is_string($secret) || $secret === '') return false;
    $timestamps = [];
    $signatures = [];
    foreach (explode(',', $header) as $part) {
        $pair = explode('=', trim($part), 2);
        if (count($pair) !== 2) continue;
        if ($pair[0] === 't') $timestamps[] = $pair[1];
        if ($pair[0] === 'v1') $signatures[] = $pair[1];
    }
    if (count($timestamps) !== 1 || !ctype_digit($timestamps[0])) return false;
    $timestamp = $timestamps[0];
    if (abs(($now ?? time()) - (int) $timestamp) > 300) return false;
    $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
    foreach ($signatures as $signature) {
        if (hash_equals($expected, $signature)) return true;
    }
    return false;
}

function apiRequest($method, $url, $headers, $body = null) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 25,
    ]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $result = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($result === false || $status < 200 || $status >= 300) {
        // Omit response bodies and URLs because they can contain personal data.
        $host = parse_url($url, PHP_URL_HOST);
        if ($host === 'api.stripe.com') {
            $service = 'Stripe API';
        } elseif (strpos(parse_url($url, PHP_URL_PATH) ?? '', '/protocol/openid-connect/token') !== false) {
            $service = 'Keycloak token endpoint';
        } else {
            $service = 'Keycloak Admin API';
        }
        throw new RuntimeException($service . ' request failed, HTTP ' . $status);
    }
    if ($result === '') return [];
    $decoded = json_decode($result, true);
    if (!is_array($decoded)) throw new RuntimeException('Invalid upstream JSON');
    return $decoded;
}

function stripeRequest($method, $path, $parameters = []) {
    global $stripeSecretKey, $stripeApiVersion;
    $url = 'https://api.stripe.com/v1' . $path;
    $headers = ['Authorization: Bearer ' . $stripeSecretKey];
    if ($stripeApiVersion) $headers[] = 'Stripe-Version: ' . $stripeApiVersion;
    if ($method === 'GET') {
        if ($parameters) $url .= '?' . http_build_query($parameters);
        return apiRequest('GET', $url, $headers);
    }
    $headers[] = 'Content-Type: application/x-www-form-urlencoded';
    return apiRequest($method, $url, $headers, http_build_query($parameters));
}

function keycloakRequest($method, $path, $token, $data = null) {
    global $keycloakUrl, $realm;
    $url = rtrim($keycloakUrl, '/') . '/admin/realms/' . rawurlencode($realm) . $path;
    $headers = ['Authorization: Bearer ' . $token, 'Content-Type: application/json'];
    return apiRequest($method, $url, $headers, $data === null ? null : json_encode($data));
}

function getKeycloakToken() {
    global $keycloakUrl, $realm, $clientId, $clientSecret;
    $response = apiRequest(
        'POST',
        rtrim($keycloakUrl, '/') . '/realms/' . rawurlencode($realm) . '/protocol/openid-connect/token',
        ['Content-Type: application/x-www-form-urlencoded'],
        http_build_query([
            'grant_type' => 'client_credentials',
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
        ])
    );
    if (empty($response['access_token'])) throw new RuntimeException('Keycloak token missing');
    return $response['access_token'];
}

function objectId($object) {
    return is_array($object) ? ($object['id'] ?? null) : $object;
}

function singleAttribute($user, $name) {
    $values = $user['attributes'][$name] ?? [];
    if (is_string($values)) $values = [$values];
    if (count($values) > 1) throw new RuntimeException('Multiple values for ' . $name);
    return isset($values[0]) ? trim((string) $values[0]) : '';
}

function resolveOrganizationLink($user, $subscription, $customer, $session) {
    $organizationId = singleAttribute($user, 'organization_id');
    if (!preg_match('/^[1-9][0-9]*$/D', $organizationId)) {
        throw new RuntimeException('Keycloak user needs one approved numeric organization_id');
    }
    foreach ([$subscription, $customer, $session] as $object) {
        $existingId = $object['metadata']['organization_id'] ?? '';
        if ($existingId !== '' && (string) $existingId !== $organizationId) {
            throw new RuntimeException('Stripe organization_id conflicts with Keycloak membership');
        }
    }
    $link = ['organization_id' => $organizationId];
    $candidates = [
        singleAttribute($user, 'organization_uuid'),
        $subscription['metadata']['organization_uuid'] ?? '',
        $customer['metadata']['organization_uuid'] ?? '',
        $session['metadata']['organization_uuid'] ?? '',
    ];
    $uuids = [];
    foreach ($candidates as $value) {
        if ($value === '') continue;
        if (!is_string($value) || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iD', $value)) {
            throw new RuntimeException('Invalid organization UUID');
        }
        $uuids[] = strtolower($value);
    }
    $uuids = array_values(array_unique($uuids));
    if (count($uuids) > 1) {
        throw new RuntimeException('Conflicting organization UUIDs');
    }
    if ($uuids) $link['organization_uuid'] = $uuids[0];
    return $link;
}

function findKeycloakUser($customer, $session, $token) {
    $userId = $customer['metadata']['keycloak_user_id'] ?? '';
    if ($userId !== '') {
        return keycloakRequest('GET', '/users/' . rawurlencode($userId), $token);
    }
    $email = $session['customer_details']['email'] ?? $customer['email'] ?? '';
    if (!is_string($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Customer email missing; add a verified Keycloak user link');
    }
    $users = keycloakRequest('GET', '/users?' . http_build_query([
        'email' => $email, 'exact' => 'true', 'max' => 2,
    ]), $token);
    if (count($users) !== 1 || strcasecmp($users[0]['email'] ?? '', $email) !== 0) {
        throw new RuntimeException('Expected one exact Keycloak email match');
    }
    return keycloakRequest('GET', '/users/' . rawurlencode($users[0]['id']), $token);
}

function subscriptionRoles($subscription) {
    global $priceToRole;
    if (!empty($subscription['items']['has_more'])) {
        throw new RuntimeException('Subscription items require pagination; reconcile manually');
    }
    $roles = [];
    foreach ($subscription['items']['data'] ?? [] as $item) {
        if (($item['quantity'] ?? 1) < 1) continue;
        $priceId = objectId($item['price'] ?? null);
        if (isset($priceToRole[$priceId])) $roles[] = $priceToRole[$priceId];
    }
    return array_values(array_unique($roles));
}

function currentPlanRole($customerId, $organizationLink) {
    global $rolePriority;
    $parameters = ['customer' => $customerId, 'status' => 'all', 'limit' => 100];
    $roles = [];
    do {
        $page = stripeRequest('GET', '/subscriptions', $parameters);
        foreach ($page['data'] as $subscription) {
            $linkedId = $subscription['metadata']['organization_id'] ?? '';
            $linkedUuid = $subscription['metadata']['organization_uuid'] ?? '';
            if ($linkedId !== '' && (string) $linkedId !== $organizationLink['organization_id']) {
                throw new RuntimeException('Customer has subscriptions for multiple organizations');
            }
            if ($linkedUuid !== '' && (!isset($organizationLink['organization_uuid'])
                || strtolower($linkedUuid) !== $organizationLink['organization_uuid'])) {
                throw new RuntimeException('Customer subscription UUID needs a matching verified organization link');
            }
            // Keep access through payment recovery; revoke after Stripe ends access.
            if (in_array($subscription['status'], ['active', 'trialing', 'past_due'], true)) {
                $roles = array_merge($roles, subscriptionRoles($subscription));
            }
        }
        if (!empty($page['has_more'])) {
            if (empty($page['data'])) throw new RuntimeException('Invalid subscription pagination');
            $parameters['starting_after'] = end($page['data'])['id'];
        }
    } while (!empty($page['has_more']));
    $selected = null;
    foreach ($rolePriority as $role) {
        if (in_array($role, $roles, true)) $selected = $role;
    }
    return $selected;
}

function syncSubscriberRole($userId, $desiredRole, $token) {
    $path = '/users/' . rawurlencode($userId) . '/role-mappings/realm';
    $existing = keycloakRequest('GET', $path, $token);
    $remove = [];
    $hasDesired = false;
    foreach ($existing as $role) {
        if ($role['name'] === $desiredRole) $hasDesired = true;
        if (strpos($role['name'], 'subscriber_') === 0 && $role['name'] !== $desiredRole) {
            $remove[] = ['id' => $role['id'], 'name' => $role['name']];
        }
    }
    // Grant first so a failed grant cannot erase the previous plan role.
    if ($desiredRole !== null && !$hasDesired) {
        $role = keycloakRequest('GET', '/roles/' . rawurlencode($desiredRole), $token);
        if (empty($role['id']) || ($role['name'] ?? '') !== $desiredRole) {
            throw new RuntimeException('Configured subscriber role missing');
        }
        keycloakRequest('POST', $path, $token, [['id' => $role['id'], 'name' => $role['name']]]);
    }
    if ($remove) keycloakRequest('DELETE', $path, $token, $remove);
}

function reconcileSubscription($event) {
    global $stripeLivemode;
    $object = $event['data']['object'];
    $session = [];
    if (strpos($event['type'], 'checkout.session.') === 0) {
        if (($object['mode'] ?? '') !== 'subscription') return;
        $session = $object;
        $subscriptionId = objectId($object['subscription'] ?? null);
    } else {
        $subscriptionId = $object['id'] ?? null;
    }
    if (!$subscriptionId) throw new RuntimeException('Subscription ID missing');
    // Retrieve current state so delayed events do not reinstate an old plan.
    $subscription = stripeRequest('GET', '/subscriptions/' . rawurlencode($subscriptionId));
    if (($subscription['livemode'] ?? null) !== $stripeLivemode) {
        throw new RuntimeException('Stripe API key environment mismatch');
    }
    if (!subscriptionRoles($subscription)) return; // Includes seat-only purchases.
    $customerId = objectId($subscription['customer'] ?? null);
    if (!$customerId) throw new RuntimeException('Customer ID missing');
    $customer = stripeRequest('GET', '/customers/' . rawurlencode($customerId));
    if (!empty($customer['deleted'])) throw new RuntimeException('Stripe customer deleted');
    $token = getKeycloakToken();
    $user = findKeycloakUser($customer, $session, $token);
    if (empty($user['id']) || empty($user['enabled'])) throw new RuntimeException('Keycloak user unavailable');
    $organizationLink = resolveOrganizationLink($user, $subscription, $customer, $session);
    $metadata = array_merge($organizationLink, ['keycloak_user_id' => $user['id']]);
    // Metadata updates merge these keys with existing Stripe metadata.
    foreach ([['customers', $customerId, $customer], ['subscriptions', $subscriptionId, $subscription]] as $target) {
        foreach ($metadata as $key => $value) {
            $existingValue = $target[2]['metadata'][$key] ?? '';
            if ($existingValue !== '' && $existingValue !== $value) {
                throw new RuntimeException('Existing Stripe metadata conflicts with resolved identity');
            }
        }
    }
    $desiredRole = currentPlanRole($customerId, $organizationLink);
    foreach ([['customers', $customerId, $customer], ['subscriptions', $subscriptionId, $subscription]] as $target) {
        $changes = [];
        foreach ($metadata as $key => $value) {
            if (($target[2]['metadata'][$key] ?? '') !== $value) $changes[$key] = $value;
        }
        if ($changes) stripeRequest('POST', '/' . $target[0] . '/' . rawurlencode($target[1]), ['metadata' => $changes]);
    }
    syncSubscriberRole($user['id'], $desiredRole, $token);
}

function handleStripeWebhook() {
    global $stripeWebhookSecret, $stripeSecretKey, $stripeLivemode;
    logMsg('Webhook request received');
    $payload = file_get_contents('php://input');
    if (!verifyStripeSignature($payload, $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '', $stripeWebhookSecret ?? '')) {
        logMsg('Rejected request: invalid Stripe signature');
        http_response_code(400);
        echo 'Invalid signature';
        return;
    }
    $event = json_decode($payload, true);
    if (!is_array($event) || empty($event['id']) || empty($event['type']) || !is_array($event['data']['object'] ?? null)) {
        logMsg('Rejected request: invalid event');
        http_response_code(400);
        echo 'Invalid event';
        return;
    }
    $types = [
        'checkout.session.completed', 'checkout.session.async_payment_succeeded',
        'customer.subscription.created', 'customer.subscription.updated',
        'customer.subscription.deleted', 'customer.subscription.paused',
        'customer.subscription.resumed',
    ];
    if (!in_array($event['type'], $types, true)) {
        logMsg('Ignored ' . $event['id'] . ' ' . $event['type']);
        echo 'ok';
        return;
    }
    if (($event['livemode'] ?? null) !== $stripeLivemode) {
        logMsg('Rejected ' . $event['id'] . ': Stripe environment mismatch');
        http_response_code(400);
        echo 'Stripe environment mismatch';
        return;
    }
    $lock = null;
    try {
        if (empty($stripeSecretKey)) throw new RuntimeException('Stripe secret API key missing');
        // A single endpoint lock serializes all users and customers. Contention
        // returns a retryable response rather than letting events interleave.
        $lockPath = sys_get_temp_dir() . '/greenstand-stripe-' . hash('sha256', __DIR__) . '.lock';
        $lock = fopen($lockPath, 'c');
        if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) throw new RuntimeException('Webhook busy');
        reconcileSubscription($event);
        logMsg('Processed ' . $event['id'] . ' ' . $event['type']);
        echo 'ok';
    } catch (Throwable $error) {
        logMsg('Retry ' . $event['id'] . ': ' . $error->getMessage());
        http_response_code(503);
        echo 'Processing incomplete';
    } finally {
        if (is_resource($lock)) { flock($lock, LOCK_UN); fclose($lock); }
    }
}

if (!defined('GREENSTAND_STRIPE_LIBRARY_ONLY')) handleStripeWebhook();
