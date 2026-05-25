# GitHub API Test Automation Framework

Portfolio-ready API test automation framework built with **Playwright** and **TypeScript** against the **GitHub REST API**.

The project demonstrates not only API test implementation, but also safe handling of authenticated and destructive test operations, maintainable framework architecture, and deliberate engineering decisions suitable for a real-world QA Automation project.

> **Project status:** Actively developed. The current version covers authenticated user verification and safe private repository creation with cleanup inside an isolated sandbox organization.

## Tech Stack

- TypeScript
- Playwright Test
- GitHub REST API
- Node.js 24
- dotenv
- Playwright HTML reporting

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

### Sandbox Repository Retrieval Test

Verifies that the framework can:

- prepare an existing private repository through a reusable fixture;
- retrieve that repository from the sandbox organization using `GET`;
- confirm its expected name, owner, description, and privacy state;
- remove the fixture-created repository during teardown.

This scenario keeps setup and cleanup outside the test body, so the test remains focused on repository retrieval behaviour.

### Sandbox Repository Name Unit Tests

Verify the local safety mechanism responsible for repository naming:

- generated repository names contain the required test prefix;
- valid sandbox repository names are accepted;
- repository names outside the test naming convention are rejected.

## Safety-First Design

Repository operations are intentionally isolated and guarded.

The framework does **not** create or delete repositories in the portfolio repository owner's main account area. Destructive tests operate only inside a dedicated GitHub organization created specifically as a sandbox for automation.

Current safety measures include:

- a dedicated sandbox organization for repository CRUD tests;
- a fine-grained personal access token scoped to the sandbox organization;
- temporary repositories forced to be private at the TypeScript type level;
- generated repository names prefixed with `api-test-repo-`;
- a runtime guard blocking repository operations for names outside the test prefix;
- cleanup attempted in a `finally` block even when functional assertions fail;
- cleanup status verified with soft assertions to preserve failure context.

## Architecture Overview

```text
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
│   ├── create-sandbox-repository.spec.ts
│   └── get-sandbox-repository.spec.ts
├── smoke/
│   └── authenticated-user.spec.ts
└── unit/
    └── sandbox-repository-name.spec.ts
```

### Responsibilities

| Area                 | Responsibility                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `config`             | Loads and validates required environment variables.                                                                              |
| `fixtures`           | Provides authenticated API request contexts and reusable sandbox repository setup/teardown for tests that require prepared data. |
| `clients`            | Encapsulates GitHub sandbox repository API operations.                                                                           |
| `types`              | Defines controlled request payload contracts.                                                                                    |
| `utils`              | Provides repository naming and runtime safety guards.                                                                            |
| `tests/smoke`        | Validates the authenticated API foundation.                                                                                      |
| `tests/repositories` | Validates repository behaviour inside the sandbox organization.                                                                  |
| `tests/unit`         | Validates local framework safety logic without external API dependencies.                                                        |

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

The repository creation scenario performs cleanup inside a `finally` block, so the removal attempt is executed even when a functional assertion fails after resource creation.

### Destructive Operations Are Guarded at Runtime

Before creating or deleting a repository, the sandbox client checks that its name follows the automated-test naming convention:

```text
api-test-repo-
```

This provides an additional runtime safety layer beyond the isolated sandbox organization.

### Multi-Stage API Scenarios Use Readable Test Steps

The sandbox repository creation scenario is reported through explicit Playwright steps:

```text
Create a private repository in the sandbox organization
Verify created repository details
Delete sandbox repository during cleanup
```

This keeps the HTML report readable and makes failures easier to diagnose without splitting every individual assertion into a separate reporting step.

### Existing Resource Scenarios Use Fixture-Based Setup and Teardown

The repository retrieval scenario requires an existing private repository before the `GET` request can be tested.

Instead of repeating repository creation and cleanup directly inside the retrieval test, a dedicated `sandboxRepository` fixture:

- creates a uniquely named private repository before the test;
- exposes the expected repository data to the scenario;
- removes the repository during teardown.

This keeps each test focused on the behaviour it validates:

```text
CREATE test → creation is explicit in the test body
GET test    → repository setup and teardown are handled by a fixture
```

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

For the currently implemented repository creation and cleanup scenario, the token must be configured for the dedicated sandbox organization with repository administration read/write access.

> Do not configure destructive repository tests against an account area or organization containing important repositories.

The local `.env` file is ignored by Git and must never be committed.

## Running the Tests

### Type Checking

```bash
npm run typecheck
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

### Sandbox Repository Retrieval Test Only

```bash
npm test -- tests/repositories/get-sandbox-repository.spec.ts
```

### Local Safety Unit Tests Only

```bash
npm test -- tests/unit/sandbox-repository-name.spec.ts
```

## Test Reporting

The project uses:

- terminal list reporting for fast local feedback;
- Playwright HTML reporting for detailed result inspection;
- explicit `test.step()` reporting for the multi-stage repository creation scenario.

The current sandbox repository test reports its main lifecycle phases as separate steps:

```text
Create a private repository in the sandbox organization
Verify created repository details
Delete sandbox repository during cleanup
```

This makes the report easier to read and helps distinguish whether a failure occurred during resource creation, response verification, or cleanup.

After running the tests, open the HTML report with:

```bash
npx playwright show-report
```

Generated reports are excluded from version control.

## Implemented Scenarios

| Area                 | Scenario                                                                | Status      |
| -------------------- | ----------------------------------------------------------------------- | ----------- |
| Authentication       | Return the configured authenticated GitHub user.                        | Implemented |
| Repository safety    | Generate and validate safe sandbox repository names.                    | Implemented |
| Repository creation  | Create a private repository in the sandbox organization.                | Implemented |
| Repository retrieval | Retrieve an existing private repository prepared by a reusable fixture. | Implemented |
| Repository cleanup   | Delete repositories created by tests or fixtures.                       | Implemented |

## Roadmap

Planned next steps:

- update repository metadata using `PATCH`;
- build a complete repository CRUD lifecycle scenario;
- add negative API scenarios such as duplicate repository creation and missing resources;
- configure GitHub Actions CI securely;
- publish HTML test reports as CI artifacts;
- expand recruiter-facing documentation as the framework grows.

## What This Project Demonstrates

This project is intended to demonstrate practical QA Automation skills, including:

- API testing with Playwright and TypeScript;
- authenticated REST API testing;
- structured and maintainable framework design;
- typed request payloads;
- fixture-based dependency setup;
- fixture-based setup and teardown for tests requiring existing API resources;
- environment and secret management;
- safe handling of destructive test operations;
- cleanup strategy for created test data;
- unit testing of framework safety mechanisms;
- incremental, reviewable Git history.

## Author

**Radosław Ptak**  
QA Engineer building a portfolio-ready API test automation framework.
