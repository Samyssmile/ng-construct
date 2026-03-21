Bump the **patch** version of the library `@neuravision/ng-construct`.

Steps:
1. Read `projects/angular/package.json`
2. Parse the current `version` field (semver: MAJOR.MINOR.PATCH)
3. Increment PATCH by 1 (e.g. `0.1.0` → `0.1.1`)
4. Update the `version` field in `projects/angular/package.json`
5. Print the old and new version to confirm
