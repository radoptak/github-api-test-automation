# GitHub API Test Automation Framework

[![API tests](https://github.com/radoptak/github-api-test-automation/actions/workflows/api-tests.yml/badge.svg)](https://github.com/radoptak/github-api-test-automation/actions/workflows/api-tests.yml)

Portfolio-ready API test automation framework built with **Playwright** and **TypeScript** against the **GitHub REST API**.

The project demonstrates API test implementation, safe handling of authenticated and destructive operations, maintainable framework architecture, CI execution, and deliberate engineering decisions suitable for a real-world QA Automation project.

> **Project status:** Actively developed. The current version covers authenticated user verification, repository CRUD scenarios, negative API paths, client-level safety checks, a complete repository lifecycle test, and GitHub Actions CI inside an isolated sandbox organization.

## Project Highlights

- Real GitHub REST API tests using Playwright and TypeScript.
- Positive and negative repository scenarios, including `CREATE`, `GET`, `PATCH`, `DELETE`, duplicate creation, and missing-resource validation.
- Full repository lifecycle coverage from creation to post-deletion `404` verification.
- Safety-first design using a dedicated sandbox organization, private repositories, controlled payloads, runtime guards, and fallback cleanup.
- Client-level safety tests confirming that unsafe repository names are blocked before API requests are sent.
- GitHub Actions CI with TypeScript validation, linting, formatting validation, full test execution, and Playwright HTML report artifacts.

## Tech Stack

- TypeScript
- Playwright Test
- GitHub REST API
- Node.js 24
- dotenv
- ESLint
- Prettier
- Playwright HTML reporting
- GitHub Actions

## Current Test Coverage

### Authenticated User Smoke Test

Verifies that the configured GitHub token:

- successfully authenticates against `GET /user`;
- belongs to the expected configured user;
- returns valid basic profile data.

### Sandbox Repository Creation Test

Verifies that the framework can:

- create a private repository in a dedicated sandbox organization;
- confirm that the repository was created under the expected organization;
- confirm that the created repository is private;
- remove the created repository during cleanup;
- report the create, verify, and cleanup phases as readable Playwright test steps.

### Duplicate Sandbox Repository Creation Test

Verifies that the framework can:

- create an initial private sandbox repository;
- try to create another repository with the same name;
- confirm that the duplicate creation attempt returns `422`;
- remove the created repository during cleanup.

This scenario validates a controlled negative path for duplicate sandbox repository creation.

### Sandbox Repository Retrieval Test

Verifies that the framework can:

- prepare an existing private repository through a reusable fixture;
- retrieve that repository from the sandbox organization using `GET`;
- confirm its expected name, owner, description, and privacy state;
- remove the fixture-created repository during teardown.

This scenario keeps setup and cleanup outside the test body, so the test remains focused on repository retrieval behaviour.

### Missing Sandbox Repository Retrieval Test

Verifies that the framework can:

- generate a safe sandbox repository name without creating the repository;
- attempt to retrieve the missing repository through `GET`;
- confirm that the API returns `404`.

This scenario validates a controlled negative path for missing sandbox resources.

### Sandbox Repository Description Update Test

Verifies that the framework can:

- prepare an existing private repository through a reusable fixture;
- update only its description through `PATCH`;
- confirm the updated repository details in the `PATCH` response;
- retrieve the repository again through `GET` to confirm that the updated description was persisted;
- remove the fixture-created repository during teardown.

The first update scenario intentionally changes only the repository description, avoiding mutations such as renaming the resource or changing its visibility, which would increase cleanup risk.

### Sandbox Repository Deletion Test

Verifies that the framework can:

- prepare a private sandbox repository specifically for deletion;
- delete the existing repository through `DELETE`;
- confirm the successful deletion response;
- retrieve the deleted repository through `GET` and confirm that it returns `404`;
- perform fallback cleanup only if deletion was not successfully confirmed.

This scenario intentionally creates and manages its own repository because deletion itself is the behaviour under test.

### Complete Sandbox Repository Lifecycle Test

Verifies that the framework can complete the full repository lifecycle:

- create a private sandbox repository;
- retrieve the created repository;
- update its description through `PATCH`;
- retrieve it again to confirm that the updated description was persisted;
- delete the repository;
- confirm that the deleted repository returns `404`;
- perform fallback cleanup only if the repository was created but not successfully deleted.

This scenario validates the full controlled resource lifecycle from creation to deletion.

### Sandbox Repository Name Unit Tests

Verify the local safety mechanism responsible for repository naming:

- generated repository names contain the required test prefix;
- valid sandbox repository names are accepted;
- repository names outside the test naming convention are rejected.

### GitHub Sandbox Repository Client Safety Tests

Verify that the repository client blocks unsafe repository names before sending API requests.

The tests confirm that unsafe names are blocked for:

- repository creation through `POST`;
- repository retrieval through `GET`;
- repository description update through `PATCH`;
- repository deletion through `DELETE`.

These tests use a fake API request context, so they verify client-level safety without contacting the real GitHub API.

## Safety-First Design

Repository operations are intentionally isolated and guarded.

The framework does **not** create or delete repositories in the portfolio repository owner's main account area. Destructive tests operate only inside a dedicated GitHub organization created specifically as a sandbox for automation.

Current safety measures include:

- a dedicated sandbox organization for repository CRUD tests;
- a fine-grained personal access token scoped to the sandbox organization;
- temporary repositories forced to be private at the TypeScript type level;
- the first `PATCH` scenario limited to changing only the repository description, without renaming the resource or changing its visibility;
- generated repository names prefixed with `api-test-repo-`;
- a runtime guard blocking repository operations for names outside the test prefix;
- client-level safety tests confirming that unsafe names are blocked before API requests are sent;
- cleanup attempted in a `finally` block even when functional assertions fail;
- fallback cleanup for destructive scenarios where successful deletion was not confirmed;
- cleanup status verified with soft assertions to preserve failure context;
- post-mutation verification through follow-up `GET` requests.

## Architecture Overview

```text
.github/
└── workflows/
    └── api-tests.yml

src/
├── clients/
│   └── github-sandbox-repository.client.ts
├── config/
│   └── environment.ts
├── fixtures/
│   ├── authenticated-api.fixture.ts
│   └── sandbox-repository.fixture.ts
├── types/
│   └── github-repository.types.ts
└── utils/
    └── sandbox-repository-name.ts

tests/
├── repositories/
│   ├── create-duplicate-sandbox-repository.spec.ts
│   ├── create-sandbox-repository.spec.ts
│   ├── delete-sandbox-repository.spec.ts
│   ├── get-missing-sandbox-repository.spec.ts
│   ├── get-sandbox-repository.spec.ts
│   ├── sandbox-repository-lifecycle.spec.ts
│   └── update-sandbox-repository-description.spec.ts
├── smoke/
│   └── authenticated-user.spec.ts
└── unit/
    ├── github-sandbox-repository-client.spec.ts
    └── sandbox-repository-name.spec.ts
```

### Responsibilities

| Area                 | Responsibility                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `config`             | Loads and validates required environment variables.                                                                              |
| `fixtures`           | Provides authenticated API request contexts and reusable sandbox repository setup/teardown for tests that require prepared data. |
| `clients`            | Encapsulates GitHub sandbox repository API operations and runtime safety guards.                                                 |
| `types`              | Defines controlled request payload contracts.                                                                                    |
| `utils`              | Provides repository naming and runtime safety guards.                                                                            |
| `tests/smoke`        | Validates the authenticated API foundation.                                                                                      |
| `tests/repositories` | Validates repository behaviour inside the sandbox organization.                                                                  |
| `tests/unit`         | Validates local framework safety logic without external API dependencies.                                                        |
| `.github/workflows`  | Runs typecheck, linting, formatting validation, API tests, and report artifact upload in GitHub Actions.                         |

## Key Engineering Decisions

### Authenticated Requests Are Fixture-Based

Authentication is not configured globally for all Playwright tests.

Tests that require GitHub API authentication use a dedicated `authenticatedRequest` fixture. Unit tests remain independent of secrets and external API access.

### Client Layer Introduced Only When Justified

The authenticated user smoke test performs one simple request directly through the authenticated fixture.

A repository client was introduced only when multiple related operations and safety rules appeared around repository lifecycle management.

### Test Repositories Are Always Private

The create-repository payload uses:

```ts
private: true;
```

rather than:

```ts
private: boolean;
```

This prevents the automation code from requesting a public temporary repository.

### Cleanup Is Part of the Test Design

Repository tests create real resources in GitHub API, so cleanup is treated as part of the test design rather than an afterthought.

Different scenarios use different cleanup strategies:

```text
CREATE test       → cleanup in finally
GET/PATCH tests   → cleanup through fixture teardown
DELETE test       → explicit deletion plus fallback cleanup
Lifecycle test    → explicit deletion plus fallback cleanup
```

This keeps each test aligned with its responsibility while protecting the sandbox from leftover resources.

### Destructive Operations Are Guarded at Runtime

Before performing repository operations, the sandbox client checks that the repository name follows the automated-test naming convention:

```text
api-test-repo-
```

This provides an additional runtime safety layer beyond the isolated sandbox organization.

Client-level safety tests verify that unsafe repository names are blocked before any API request is sent.

### Multi-Stage API Scenarios Use Readable Test Steps

Repository scenarios are reported through explicit Playwright steps.

This keeps the HTML report readable and makes failures easier to diagnose without splitting every individual assertion into a separate reporting step.

### Existing Resource Scenarios Use Fixture-Based Setup and Teardown

The repository retrieval and description update scenarios require an existing private repository before the tested operation can run.

Instead of repeating repository creation and cleanup directly inside those tests, a dedicated `sandboxRepository` fixture:

- creates a uniquely named private repository before the test;
- exposes the expected repository data to the scenario;
- removes the repository during teardown.

This keeps each test focused on the behaviour it validates:

```text
CREATE test → creation is explicit in the test body
GET test    → repository setup and teardown are handled by a fixture
PATCH test  → repository setup and teardown are handled by a fixture
```

### Repository Updates Are Intentionally Narrow

The first `PATCH` scenario updates only the repository description.

This is a deliberate safety decision. Changing the repository name would affect the identifier used by fixture teardown, while changing repository visibility would introduce an unnecessary risk of exposing a temporary test resource publicly.

The update flow therefore remains controlled:

```text
fixture creates a private repository
PATCH updates only its description
GET confirms that the new description was persisted
fixture deletes the repository using its unchanged name
```

### Deletion Is Tested Explicitly Without Automatic Resource Teardown

The deletion scenario uses the existing `repositoryClient` fixture, but intentionally does not request the automatic `sandboxRepository` fixture.

Because deletion itself is the behaviour under test, the scenario:

```text
creates its own repository
deletes it explicitly
confirms that a later GET returns 404
uses fallback cleanup only if successful deletion was not confirmed
```

This avoids a duplicate teardown attempt after a successful `DELETE` while still protecting the sandbox from leftover resources after a failure.

### Full Lifecycle Scenario Complements Focused Endpoint Tests

Focused tests validate individual behaviours such as creation, retrieval, update, deletion, negative retrieval, and duplicate creation.

The lifecycle scenario verifies that these operations work together as a complete controlled resource flow:

```text
CREATE → GET → PATCH → GET persisted state → DELETE → GET 404
```

This provides a broader regression scenario without replacing the smaller, more diagnostic tests.

## Prerequisites

- Node.js `>=24.16.0 <25`
- npm
- A GitHub account
- A dedicated GitHub organization used only as an automation sandbox
- A fine-grained GitHub personal access token configured for that sandbox organization

## Local Setup

### 1. Use the Expected Node.js Version

The repository contains an `.nvmrc` file.

```bash
nvm use
```

If the required Node.js version is not installed yet:

```bash
nvm install
nvm use
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Prepare Local Environment Variables

Create a local `.env` file based on the provided template:

```bash
cp .env.example .env
```

Fill in the required values:

```env
GH_API_TOKEN=your_fine_grained_personal_access_token
GH_API_USERNAME=your_github_username
GH_API_ORG=your_dedicated_sandbox_organization
```

### Required Token Access

For the currently implemented repository scenarios, the token must be configured for the dedicated sandbox organization with repository administration read/write access.

> Do not configure destructive repository tests against an account area or organization containing important repositories.

The local `.env` file is ignored by Git and must never be committed.

## Running the Tests

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Formatting Check

```bash
npm run format:check
```

### Full Test Suite

```bash
npm test
```

### Authenticated User Smoke Test Only

```bash
npm test -- tests/smoke/authenticated-user.spec.ts
```

### Sandbox Repository Creation Test Only

```bash
npm test -- tests/repositories/create-sandbox-repository.spec.ts
```

### Duplicate Sandbox Repository Creation Test Only

```bash
npm test -- tests/repositories/create-duplicate-sandbox-repository.spec.ts
```

### Sandbox Repository Retrieval Test Only

```bash
npm test -- tests/repositories/get-sandbox-repository.spec.ts
```

### Missing Sandbox Repository Retrieval Test Only

```bash
npm test -- tests/repositories/get-missing-sandbox-repository.spec.ts
```

### Sandbox Repository Description Update Test Only

```bash
npm test -- tests/repositories/update-sandbox-repository-description.spec.ts
```

### Sandbox Repository Deletion Test Only

```bash
npm test -- tests/repositories/delete-sandbox-repository.spec.ts
```

### Complete Sandbox Repository Lifecycle Test Only

```bash
npm test -- tests/repositories/sandbox-repository-lifecycle.spec.ts
```

### Sandbox Repository Name Unit Tests Only

```bash
npm test -- tests/unit/sandbox-repository-name.spec.ts
```

### GitHub Sandbox Repository Client Safety Tests Only

```bash
npm test -- tests/unit/github-sandbox-repository-client.spec.ts
```

### All Unit Tests Only

```bash
npm test -- tests/unit
```

## Continuous Integration

The project uses GitHub Actions to run the API test suite automatically on pushes and pull requests to `main`.

The CI workflow performs:

- dependency installation with `npm ci`;
- TypeScript validation through `npm run typecheck`;
- linting through `npm run lint`;
- formatting validation through `npm run format:check`;
- full Playwright API test execution through `npm test`;
- Playwright HTML report upload as a workflow artifact.

Required GitHub Actions secrets:

- `GH_API_TOKEN`;
- `GH_API_USERNAME`;
- `GH_API_ORG`.

The token should be scoped to the dedicated sandbox organization used by the test suite.

## Test Reporting

The project uses:

- terminal list reporting for fast local feedback;
- Playwright HTML reporting for detailed result inspection;
- explicit `test.step()` reporting for multi-stage repository scenarios.

The sandbox repository creation test reports:

```text
Create a private repository in the sandbox organization
Verify created repository details
Delete sandbox repository during cleanup
```

The duplicate repository creation test reports:

```text
Create an initial private sandbox repository
Try to create a duplicate sandbox repository
Delete sandbox repository during cleanup
```

The repository retrieval test reports:

```text
Retrieve an existing private sandbox repository
Verify retrieved repository details
```

The missing repository retrieval test reports:

```text
Try to retrieve a missing sandbox repository
```

The repository description update test reports:

```text
Update the sandbox repository description
Verify updated repository details in the PATCH response
Verify the updated description is persisted
```

The repository deletion test reports:

```text
Prepare a private sandbox repository for deletion
Delete the existing sandbox repository
Verify the deleted sandbox repository is no longer available
```

If the deletion scenario fails before successful deletion is confirmed, the report may also include:

```text
Delete sandbox repository during fallback cleanup
```

The complete repository lifecycle test reports:

```text
Create a private sandbox repository
Retrieve the created sandbox repository
Update the sandbox repository description
Verify the updated description is persisted
Delete the sandbox repository
Verify the deleted sandbox repository is no longer available
```

If the lifecycle scenario fails after creating the repository but before successful deletion is confirmed, the report may also include:

```text
Delete sandbox repository during fallback cleanup
```

This makes the report easier to read and helps distinguish whether a failure occurred during resource creation, retrieval, duplicate creation validation, update verification, persistence confirmation, deletion, missing-resource confirmation, full lifecycle execution, or cleanup.

After running the tests, open the HTML report with:

```bash
npx playwright show-report
```

Generated reports are excluded from version control.

In GitHub Actions, the Playwright HTML report is uploaded as a workflow artifact, so failed CI runs can be inspected without generating reports locally.

## Implemented Scenarios

| Area                          | Scenario                                                                                                   | Status      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- |
| Authentication                | Return the configured authenticated GitHub user.                                                           | Implemented |
| Repository safety             | Generate and validate safe sandbox repository names.                                                       | Implemented |
| Repository client safety      | Block unsafe repository names before any API request is sent.                                              | Implemented |
| Repository creation           | Create a private repository in the sandbox organization.                                                   | Implemented |
| Repository negative creation  | Return `422` when trying to create a duplicate sandbox repository.                                         | Implemented |
| Repository retrieval          | Retrieve an existing private repository prepared by a reusable fixture.                                    | Implemented |
| Repository negative retrieval | Return `404` when trying to retrieve a missing sandbox repository.                                         | Implemented |
| Repository update             | Update the description of an existing private repository and confirm the persisted state.                  | Implemented |
| Repository deletion           | Delete an existing private repository and confirm that subsequent retrieval returns `404`.                 | Implemented |
| Repository lifecycle          | Complete a full create, retrieve, update, delete, and missing-resource verification flow.                  | Implemented |
| Repository cleanup            | Clean up repositories created by tests or fixtures, including fallback cleanup for deletion failure paths. | Implemented |

## Roadmap

Planned next steps:

- expand recruiter-facing documentation as the framework grows.

## What This Project Demonstrates

This project is intended to demonstrate practical QA Automation skills, including:

- API testing with Playwright and TypeScript;
- authenticated REST API testing;
- structured and maintainable framework design;
- typed request payloads;
- fixture-based dependency setup;
- fixture-based setup and teardown for tests requiring existing API resources;
- controlled `PATCH` operations with deliberately limited request payloads;
- persisted-state verification through a follow-up `GET` request;
- explicit `DELETE` scenario with post-deletion `404` verification;
- full repository lifecycle validation from `CREATE` to post-deletion `404`;
- controlled negative API scenarios for duplicate and missing resources;
- client-level safety verification before API requests are sent;
- GitHub Actions CI execution with Playwright HTML report artifacts;
- conditional fallback cleanup for failed destructive scenarios;
- environment and secret management;
- safe handling of destructive test operations;
- cleanup strategy for created test data;
- unit testing of framework safety mechanisms;
- incremental, reviewable Git history;
- ESLint and Prettier quality gates in local development and CI.

## Author

**Radosław Ptak**
QA Engineer building a portfolio-ready API test automation framework.
