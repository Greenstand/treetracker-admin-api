# ArgoCD Application Setup for Keycloak

## Overview

This document explains how to set up an ArgoCD Application that automates Keycloak deployments for the TreeTracker Admin API. Once configured, ArgoCD continuously manages the deployment without requiring manual intervention.

## What This Does

The ArgoCD Application defined in this directory:

- **Monitors:** the `keycloak` branch in your repository
- **Source Path:** `deployment/overlays/keycloak-development/`
- **Build Process:** ArgoCD runs Kustomize internally to build the deployment manifests
- **Target Namespace:** `admin-api`

## Setup Frequency

**This is a one-time setup.** Run the following command once to create the ArgoCD Application:

```bash
kubectl apply -f deployment/argocd-apps/treetracker-admin-api-keycloak-app.yaml
```

After this initial setup, ArgoCD automatically:

- Detects changes every 3 minutes
- Rebuilds manifests using Kustomize
- Applies updates to your cluster

**No recurring manual steps are required.**

## Automated Deployment Flow

Once the application is created, deployments happen automatically:

Developer pushes code
↓
CI builds Docker image
↓
CI updates kustomization.yaml
↓
ArgoCD detects change (every 3 minutes)
↓
ArgoCD runs: kustomize build + kubectl apply
↓
✅ Deployed!


## Verification

Use these commands to verify the application and deployment status:

```bash
# Check ArgoCD application status
kubectl get application treetracker-admin-api-keycloak-app -n argocd

# Check Keycloak deployment
kubectl get deployment keycloak-treetracker-admin-api -n admin-api

# Check Keycloak pods
kubectl get pods -n admin-api | grep keycloak
```

## Files in This Directory

- `treetracker-admin-api-keycloak-app.yaml` — ArgoCD Application definition
- `README.md` — This documentation

---

Once set up, ArgoCD handles all Keycloak deployments automatically.