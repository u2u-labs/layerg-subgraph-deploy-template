#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var graphql_1 = require("graphql");
var fs_1 = require("fs");
var path_1 = require("path");
var program = new commander_1.Command();
program
    .option("-s, --schema <path>", "Path to GraphQL schema", "./schema.graphql")
    .option("-o, --outDir <path>", "Output directory", "./src/generated-entities");
var schemaPath = "./schema.graphql";
var outputDir = "./generated-entities";
// Load and parse the schema
var rawSchema = (0, fs_1.readFileSync)(schemaPath, "utf-8");
var ast = (0, graphql_1.parse)(rawSchema);
// Ensure output directory exists
if (!(0, fs_1.existsSync)(outputDir)) {
    (0, fs_1.mkdirSync)(outputDir, { recursive: true });
}
// Detect @entity types (safe nullable handling)
var entityDefs = ast.definitions.filter(function (d) {
    var _a, _b;
    return d.kind === "ObjectTypeDefinition" &&
        ((_b = (_a = d.directives) === null || _a === void 0 ? void 0 : _a.some(function (dir) { return dir.name.value === "entity"; })) !== null && _b !== void 0 ? _b : false);
});
console.log("✅ Found entities:", entityDefs.map(function (d) { return d.name.value; }).join(", "));
// GraphQL → TypeScript type map
var scalarMap = {
    ID: "string",
    String: "string",
    Int: "number",
    Float: "number",
    Boolean: "boolean",
    BigInt: "string",
    Bytes: "string",
};
function unwrapType(typeNode) {
    if (typeNode.kind === "NamedType")
        return typeNode.name.value;
    return unwrapType(typeNode.type);
}
function isNonNullType(typeNode) {
    return typeNode.kind === "NonNullType";
}
function generateEntitySource(def) {
    var name = def.name.value;
    var fields = def.fields || [];
    // Class properties with ? or !
    var props = fields.map(function (f) {
        var tsType = scalarMap[unwrapType(f.type)] || "any";
        var isRequired = isNonNullType(f.type);
        var propName = isRequired ? "".concat(f.name.value, "!") : "".concat(f.name.value, "?");
        return "  ".concat(propName, ": ").concat(tsType, ";");
    });
    var fromJSON = fields.map(function (f) { return "      ".concat(f.name.value, ": json[\"").concat(f.name.value, "\"],"); });
    var toJSON = fields.map(function (f) { return "      \"".concat(f.name.value, "\": this.").concat(f.name.value, ","); });
    var fieldNames = fields.map(function (f) { return "\"".concat(f.name.value, "\""); }).join(", ");
    var valuePlaceholders = fields
        .map(function (f) { return "${this.".concat(f.name.value, "}"); })
        .join(", ");
    var updateAssignments = fields
        .filter(function (f) { return f.name.value !== "id"; })
        .map(function (f) { return "\"".concat(f.name.value, "\" = ${this.").concat(f.name.value, "}"); })
        .join(", ");
    var allowedFieldsArray = fields.map(function (f) { return "\"".concat(f.name.value, "\""); }).join(", ");
    return "// Auto-generated from schema.graphql\nimport { PrismaClient } from \"@prisma/client\";\nconst prisma = new PrismaClient();\n\nexport class ".concat(name, " {\n").concat(props.join("\n"), "\n\n  constructor(init?: Partial<").concat(name, ">) {\n    Object.assign(this, init);\n  }\n\n  static fromJSON(json: any): ").concat(name, " {\n    return new ").concat(name, "({\n").concat(fromJSON.join("\n"), "\n    });\n  }\n\n  toJSON(): any {\n    return {\n").concat(toJSON.join("\n"), "\n    };\n  }\n\n  static async get(id: string): Promise<").concat(name, " | null> {\n    const rows = await prisma.$queryRaw`SELECT * FROM \"").concat(name, "\" WHERE \"id\" = ${id}`;\n    if (!Array.isArray(rows) || rows.length === 0) return null;\n    return ").concat(name, ".fromJSON(rows[0]);\n  }\n\n  static async getByField(field: keyof ").concat(name, ", value: any): Promise<").concat(name, " | null> {\n    const allowedFields: (keyof ").concat(name, ")[] = [").concat(allowedFieldsArray, "];\n    if (!allowedFields.includes(field)) {\n      throw new Error(`Invalid field: ${field}`);\n    }\n\n    const query = `SELECT * FROM \"").concat(name, "\" WHERE \"${field}\" = $1 LIMIT 1`;\n    const rows = await prisma.$queryRawUnsafe(query, value);\n    if (!Array.isArray(rows) || rows.length === 0) return null;\n    return ").concat(name, ".fromJSON(rows[0]);\n  }\n\n  async save(): Promise<void> {\n    await prisma.$queryRaw`INSERT INTO \"").concat(name, "\" (").concat(fieldNames, ") VALUES (").concat(valuePlaceholders, ")\n      ON CONFLICT (\"id\") DO UPDATE SET ").concat(updateAssignments, "`;\n  }\n}\n");
}
// Write each entity file
for (var _i = 0, entityDefs_1 = entityDefs; _i < entityDefs_1.length; _i++) {
    var def = entityDefs_1[_i];
    var name_1 = def.name.value;
    var source = generateEntitySource(def);
    var filepath = (0, path_1.join)(outputDir, "".concat(name_1, ".ts"));
    (0, fs_1.writeFileSync)(filepath, source);
    console.log("\uD83D\uDCDD Wrote ".concat(filepath));
}
// // Write index.ts
// const indexContent = entityDefs
//   .map((d) => `export * from "./${d.name.value}";`)
//   .join("\n");
// writeFileSync(join(outputDir, "index.ts"), indexContent);
// console.log("🧩 Wrote index.ts");
