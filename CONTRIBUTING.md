*THIS DOCUMENT REQUIRES UPDATING/REWORKING INTO MULTIPLE DOCS*

## Pipelines/development environment deployment (to be expanded)
...

If you need to log in on your deployed test branch, your branch name needs to be "auth-test".  This has been included in the AAAI setup to allow logging in and on any other branch name logging in will not be allowed.


## Git Branching Guide

#### Commit Message:

Adding [skip ci] will skip all ci processes.
 
#### Tagging:

Tag released versions. This creates an immutable marker (tag) for specific versions e.g.
```
1.1.4
```

#### Release Branches:

If you then need to make bug fixes to a release you would create a branch at the minor tag. e.g.
```
1.1.x
```
**They should be treated like master as deployments may be created from this branch. So do not commit directly to this branch, use a merge request!**

This allows quick bugfixes to a release without the need to release all new code present in the master branch.

Bugfixes should also be merged into master if they are still relevant.


#### Branches:

```
bug    - Code changes linked to a known issue.
feat   - New feature.
hotfix - Quick fixes to the codebase.
docs   - changes just to documentation
1.1.x - maintenance/release branches (deployments may be based on these so they should be protected like the master)
```

If the branch is primairly being worked on by one person, consider adding your name initials (e.g. ws) to the branch name. If its intended to be a shared branch don't add your initials

Adding 'runall' to the branch name will run as much of the ci pipeline as possible (everything but the external deploy).

e.g.
```
bug-ws-map-not-working
feat-ws-make-map-awesome
hotfix-ci-build-error-runall
1.1.x
```

## For contibuting to issues and merge requests please use the templates located in .gitlab directory 

#### Docs:


