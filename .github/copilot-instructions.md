# Copilot Instructions — TIA Project

## Project Context
This is a Siemens TIA Portal automation project managed via T-IA Connect.
- **Project**: TIA Project
- **Devices**: 

## Coding Conventions
- PLC programs use IEC 61131-3 languages (SCL, LAD, FBD, STL, GRAPH)
- SCL follows Siemens STEP 7 syntax (not IEC 61131-3 ST)
- Variable names use camelCase for local vars, PascalCase for FB interfaces
- Block names: FB_ prefix for Function Blocks, FC_ for Functions, DB_ for Data Blocks
- Tag names: use descriptive names with type prefix (b=Bool, i=Int, r=Real, s=String)

## Available Tools
The @tia chat participant provides 30+ tools for TIA Portal operations.
Use `@tia` in GitHub Copilot Chat to interact with the PLC project.
