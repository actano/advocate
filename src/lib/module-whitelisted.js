import { satisfies, valid } from 'semver'

export default (modules = [], { name, version }) =>
  modules.some(module =>
    module.name === name &&
    (version === module.version ||
      (valid(version) && satisfies(version, module.version))))
