# Advocate

[![npm](https://img.shields.io/npm/v/advocate.svg)](https://www.npmjs.com/package/advocate)
[![Build Status](https://travis-ci.org/actano/advocate.svg?branch=master)](https://travis-ci.org/actano/advocate)
[![Coverage Status](https://coveralls.io/repos/github/actano/advocate/badge.svg?branch=master)](https://coveralls.io/github/actano/advocate?branch=master)
[![Dependency Status](https://david-dm.org/actano/advocate.svg)](https://david-dm.org/actano/advocate)
[![devDependency Status](https://david-dm.org/actano/advocate/dev-status.svg)](https://david-dm.org/actano/advocate#info=devDependencies)
[![License MIT](https://img.shields.io/github/license/actano/advocate.svg)](https://github.com/actano/advocate/blob/master/LICENSE)

Your advocate doesn't let you down. He checks the licenses of all npm modules of your project and their transitive dependencies and compares them to a given whitelist.

## Installation

```bash
npm install advocate --save-dev
```

## Usage

Advocate can be used as part of your project's automated tests. That way, you ensure to only use modules with whitelisted licenses.

```javascript
advocate({licenses: ['MIT']})
    .then(function(moduleInformation) {
        for (module of moduleInformation.violatingModules) {
            console.log(`
                I advise you to not use ${module.explicitName}
                because of the license ${module.licenseDescriptor}.
            `);
        }
    });
```

Output:
```
I advise you to not use spdx-exceptions@1.0.4
because of the license CC-BY-3.0.
```

## API

### advocate(whitelist?: Whitelist, options?: Options): Promise&lt;ModuleInformation&gt;

Determines modules whose license descriptions do not satisfy the given whitelist. In order to determine the license of a module, `advocate` respects the `package.json` but also tries to guess the license using text files such as `README` or `LICENSE`.

### type ModuleInformation

```javascript
{
    allModules: Map<ExplicitName, Module>
    violatingModules: Map<ExplicitName, Module>
}
```

### type ExplicitName

string. module@version

### type Module

Example:
```javascript
"module1@1.0.0": {
  "name": "module1",
  "explicitName": "module1@1.0.0",
  "version": "1.0.0",
  "licenseDescriptor": "MIT",
  "isLicenseGuessed": false,
  "installPaths": [
    "path/to/my/node/project/node_modules/module2/node_modules/module1"
  ],
  "dependencyPaths": [
    [
      "module2@1.3.0"
    ]
  ],
  "otherUsedVersions": {
    "1.5.2":
      "explicitName": "module1@1.5.2"
      "name": "module1"
      "version": "1.5.2"
      "licenseDescriptor": "JSON"
  }
}
```
### type Whitelist
```javascript
{
    licenses: Array<LicenseString>,
    licenseExceptions: Array<LicenseException>,
    modules: Array<WhitelistedModule>
}

```
### type WhitelistedModule
```javascript
{
    name: string
    licenseDescriptor: LicenseString
    version: string
}
```

### type LicenseString

Either a [SPDX expression](https://spdx.org) or a simple license identifier

### type LicenseException

string

### type Options

```javascript
{
    dev?: boolean, // default: false
    path?: string // default: cwd
}
```
By default, `dev` is set to `false`. This means `advocate` only respects your production dependencies and their transitive ones.

If `dev` is set to `true`, `advocate` will only respect your `devDependencies` and their transitive production dependencies.

`advocate` will _never_ respect transitive development dependencies.

