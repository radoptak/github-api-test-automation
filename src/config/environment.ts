import dotenv from 'dotenv';

dotenv.config({ quiet: true });

type RequiredEnvironmentVariable =
  | 'GH_API_TOKEN'
  | 'GH_API_USERNAME'
  | 'GH_API_ORG';

export function requireEnvironmentVariable(
  variableName: RequiredEnvironmentVariable,
): string {
  const value = process.env[variableName];

  if (!value) {
    throw new Error(
      `Missing ${variableName}. Add it to the local .env file based on .env.example.`,
    );
  }

  return value;
}
