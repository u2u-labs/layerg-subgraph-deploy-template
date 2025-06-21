// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql', // path to your SDL schema
  generates: {
    './src/generated/types.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
