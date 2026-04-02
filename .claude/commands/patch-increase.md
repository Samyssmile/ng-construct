Bump the **patch** version of the library `@neuravision/ng-construct`.

Steps:
1. Read `projects/angular/package.json`
2. Parse the current `version` field (semver: MAJOR.MINOR.PATCH)
3. Increment PATCH by 1 (e.g. `0.1.0` → `0.1.1`)
4. Update the `version` field in `projects/angular/package.json`
5. Read `CHANGELOG.md` and add a new section `## [NEW_VERSION] - YYYY-MM-DD` at the top (below the header). Move any unreleased entries into this section, or create an empty section if none exist.
6. Print the old and new version to confirm
