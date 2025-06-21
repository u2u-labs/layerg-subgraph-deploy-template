#!/usr/bin/env ts-node

import { Command } from "commander";
import {
  parse,
  ObjectTypeDefinitionNode,
  DocumentNode,
  TypeNode,
} from "graphql";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const program = new Command();
program
  .option("-s, --schema <path>", "Path to GraphQL schema", "./schema.graphql")
  .option(
    "-o, --outDir <path>",
    "Output directory",
    "./src/generated-entities"
  );

const schemaPath = "./schema.graphql";
const outputDir = "./generated-entities";

// Load and parse the schema
const rawSchema = readFileSync(schemaPath, "utf-8");
const ast: DocumentNode = parse(rawSchema);

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Detect @entity types (safe nullable handling)
const entityDefs = ast.definitions.filter(
  (d): d is ObjectTypeDefinitionNode =>
    d.kind === "ObjectTypeDefinition" &&
    (d.directives?.some((dir) => dir.name.value === "entity") ?? false)
);

console.log(
  "✅ Found entities:",
  entityDefs.map((d) => d.name.value).join(", ")
);

// GraphQL → TypeScript type map
const scalarMap: Record<string, string> = {
  ID: "string",
  String: "string",
  Int: "number",
  Float: "number",
  Boolean: "boolean",
  BigInt: "string",
  Bytes: "string",
};

function unwrapType(typeNode: TypeNode): string {
  if (typeNode.kind === "NamedType") return typeNode.name.value;
  return unwrapType(typeNode.type);
}

function isNonNullType(typeNode: TypeNode): boolean {
  return typeNode.kind === "NonNullType";
}

function generateEntitySource(def: ObjectTypeDefinitionNode): string {
  const name = def.name.value;
  const fields = def.fields || [];

  // Class properties with ? or !
  const props = fields.map((f) => {
    const tsType = scalarMap[unwrapType(f.type)] || "any";
    const isRequired = isNonNullType(f.type);
    const propName = isRequired ? `${f.name.value}!` : `${f.name.value}?`;
    return `  ${propName}: ${tsType};`;
  });

  const fromJSON = fields.map(
    (f) => `      ${f.name.value}: json["${f.name.value}"],`
  );

  const toJSON = fields.map(
    (f) => `      "${f.name.value}": this.${f.name.value},`
  );

  const fieldNames = fields.map((f) => `"${f.name.value}"`).join(", ");
  const valuePlaceholders = fields
    .map((f) => `\${this.${f.name.value}}`)
    .join(", ");
  const updateAssignments = fields
    .filter((f) => f.name.value !== "id")
    .map((f) => `"${f.name.value}" = \${this.${f.name.value}}`)
    .join(", ");

  const allowedFieldsArray = fields.map((f) => `"${f.name.value}"`).join(", ");

  return `// Auto-generated from schema.graphql
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class ${name} {
${props.join("\n")}

  constructor(init?: Partial<${name}>) {
    Object.assign(this, init);
  }

  static fromJSON(json: any): ${name} {
    return new ${name}({
${fromJSON.join("\n")}
    });
  }

  toJSON(): any {
    return {
${toJSON.join("\n")}
    };
  }

  static async get(id: string): Promise<${name} | null> {
    const rows = await prisma.$queryRaw\`SELECT * FROM "${name}" WHERE "id" = \${id}\`;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return ${name}.fromJSON(rows[0]);
  }

  static async getByField(field: keyof ${name}, value: any): Promise<${name} | null> {
    const allowedFields: (keyof ${name})[] = [${allowedFieldsArray}];
    if (!allowedFields.includes(field)) {
      throw new Error(\`Invalid field: \${field}\`);
    }

    const query = \`SELECT * FROM "${name}" WHERE "\${field}" = \$1 LIMIT 1\`;
    const rows = await prisma.$queryRawUnsafe(query, value);
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return ${name}.fromJSON(rows[0]);
  }

  async save(): Promise<void> {
    await prisma.$queryRaw\`INSERT INTO "${name}" (${fieldNames}) VALUES (${valuePlaceholders})
      ON CONFLICT ("id") DO UPDATE SET ${updateAssignments}\`;
  }
}
`;
}

// Write each entity file
for (const def of entityDefs) {
  const name = def.name.value;
  const source = generateEntitySource(def);
  const filepath = join(outputDir, `${name}.ts`);
  writeFileSync(filepath, source);
  console.log(`📝 Wrote ${filepath}`);
}

// // Write index.ts
// const indexContent = entityDefs
//   .map((d) => `export * from "./${d.name.value}";`)
//   .join("\n");
// writeFileSync(join(outputDir, "index.ts"), indexContent);
// console.log("🧩 Wrote index.ts");
