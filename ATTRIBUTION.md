# Attribution

> Record of human and AI contributions to this project.

## Project

- **Name:** financial-calc
- **Repository:** https://github.com/justice8096/financial-calc
- **Started:** 2025 (embedded in commercialRetirementProject)

---

## Contributors

### Human

| Name | Role | Areas |
|------|------|-------|
| Justice E. Chase | Lead developer | Architecture, design, domain logic, review, integration |

### AI Tools Used

| Tool | Model/Version | Purpose |
|------|---------------|---------|
| Claude | Claude Opus 4.6 | Code generation, documentation, testing, research |
| Claude Code | — | Agentic development, refactoring, extraction |

---

## Contribution Log

### Original Source Code
Extracted from commercialRetirementProject/packages/shared/. Justice designed the tax bracket engine, Social Security modeling, RMD calculations, and inflation projections with FX drift. This is deep domain expertise. The source project had 142 tests with 97.5% coverage.

| Date | Tag | Description | AI Tool | Human Review |
|------|-----|-------------|---------|--------------|
| 2025-2026 | `human-only` | Tax bracket engine, Social Security modeling, RMD calculations, inflation/FX drift projections, extensive test suite (142 tests, 97.5% coverage) | — | Justice E. Chase |

### Standalone Extraction

| Date | Tag | Description | AI Tool | Human Review |
|------|-----|-------------|---------|--------------|
| 2026-03-21 | `ai-assisted` | Extracted from commercialRetirementProject into standalone repo | Claude Code | Architecture decisions, reviewed all code |
| 2026-03-21 | `ai-generated` | Package config, LICENSE | Claude Code | Reviewed and approved |
| 2026-03-21 | `ai-generated` | README documentation | Claude Code | Reviewed, edited |

### Improvements (2026-03-23)

| Date | Tag | Description | AI Tool | Human Review |
|------|-----|-------------|---------|--------------|
| 2026-03-23 | `ai-assisted` | TypeScript declarations for all modules and functions | Claude Code | Reviewed and approved |
| 2026-03-23 | `ai-assisted` | Module categorization and API documentation in README | Claude Code | Reviewed and edited |
| 2026-03-23 | `ai-generated` | Complementary test suite (77 new tests) to support standalone usage | Claude Code | Reviewed and approved |
| 2026-03-23 | `ai-assisted` | Verified generic bracket API works with various tax systems | Claude Code | Reviewed and approved |

---

## Commit Convention

Include `[ai:claude]` tag in commit messages for AI-assisted or AI-generated changes. Example:
```
Extract financial calculations with TypeScript types [ai:claude]
```

---

## Disclosure Summary

| Category | Approximate % |
|----------|---------------|
| Human-only code | 45% |
| AI-assisted code | 25% |
| AI-generated (reviewed) | 30% |
| Documentation | 75% AI-assisted |
| Tests | 60% AI-generated (many original tests were human-written) |

---

## Notes

- All AI-generated or AI-assisted code is reviewed by a human contributor before merging.
- AI tools do not have repository access or commit privileges.
- This file is maintained manually and may not capture every interaction.
- Original source code was embedded in commercialRetirementProject before extraction.
- Deep domain expertise: Financial calculations, tax systems, Social Security, retirement planning.
- Extensive test coverage inherited from source project (142 original tests) with 77 additional tests for standalone use.

---

## License Considerations

AI-generated content may have different copyright implications depending on jurisdiction. See [LICENSE](./LICENSE) for this project's licensing terms. Contributors are responsible for ensuring AI-assisted work complies with applicable policies.
