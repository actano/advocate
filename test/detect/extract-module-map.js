/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {expect} = require('chai')
    .use(require('chai-subset'));
import memo from 'memo-is';

describe('getting modules with violating license', function() {

    let extractModules = null;

    before('require', () => extractModules = require('../../src/detect/extract-module-map'));

    it('excludes root module from result', function() {
        const npmModuleMap = {
            name: 'A',
            version: '1',
            dependencies: {}
        };

        const moduleMap = extractModules([npmModuleMap]);

        return expect(moduleMap).to.not.have.property('A@1');
    });

    describe('guessing license', () =>

        context('via readmy property', () =>

            it('guesses an array of licenses', function() {
                const npmModuleMap = {
                    name: 'A',
                    version: '1',
                    dependencies: {
                        B: {
                            name: 'B',
                            version: 1,
                            readme: '... MIT License ... Apache License Version 2.0 ...'
                        }
                    }
                };

                const moduleMap = extractModules([npmModuleMap]);

                return expect(moduleMap).containSubset({
                    'B@1': {
                        licenseDescriptor: ['MIT*', 'Apache-2.0*'],
                        isLicenseGuessed: true
                    }
                });
            })
        )
    );

    describe('licenseDescriptor', function() {

        let npmModuleMap = null;
        const licenseProperty = memo().is(() => ({}));

        beforeEach(function() {
            npmModuleMap = {
                name: 'A',
                version: '1',
                dependencies: {
                    B: {
                        name: 'B',
                        version: 1
                    }
                }
            };

            return Object.assign(npmModuleMap.dependencies.B, licenseProperty());
        });

        context('with simple \'license\' property containing string', function() {

            licenseProperty.is(() => ({license: 'BSD'}));

            return it('detects as string', function() {
                const moduleMap = extractModules([npmModuleMap]);

                return expect(moduleMap['B@1'].licenseDescriptor).to.deep.equal('BSD');
            });
        });

        context('with simple \'licenses\' property containing string', function() {

            licenseProperty.is(() => ({licenses: 'BSD'}));

            return it('detects as string', function() {
                const moduleMap = extractModules([npmModuleMap]);

                return expect(moduleMap['B@1'].licenseDescriptor).to.deep.equal('BSD');
            });
        });

        context('with array of license strings', function() {

            licenseProperty.is(() => ({license: [ 'MIT', 'BSD' ]}));

            return it('detects as array of strings', function() {
                const moduleMap = extractModules([npmModuleMap]);

                return expect(moduleMap['B@1'].licenseDescriptor).to.have.members(['BSD', 'MIT']);
        });
    });

        return context('with array of license objects', function() {

            licenseProperty.is(() =>
                ({
                    license: [
                        {type: 'MIT'}
                    ,
                        {name: 'BSD'}
                    ]
                }));

            return it('detects as array of strings', function() {
                const moduleMap = extractModules([npmModuleMap]);

                return expect(moduleMap['B@1'].licenseDescriptor).to.have.members(['BSD', 'MIT']);
        });
    });
});

    describe('dependencyPaths', function() {

        it('collect all dependecy paths', function() {
            const npmModuleMap = {
                name: 'A',
                version: '1',
                dependencies: {
                    A_1: {
                        name: 'A_1',
                        version: 1,
                        dependencies: {
                            A_1_1: {
                                name: 'A_1_1',
                                version: 1
                            }
                        }
                    },
                    A_1_1: {
                        name: 'A_1_1',
                        version: 1
                    }
                }
            };

            const moduleMap = extractModules([npmModuleMap]);

            return expect(moduleMap['A_1_1@1'].dependencyPaths).to.have.deep.members([
                ['A@1'],
                ['A@1', 'A_1@1']
            ]);
    });

        return it('truncates cyclic dependencies', function() {
            const npmModuleMap = {
                name: 'A',
                version: '1',
                dependencies: {
                    A_1: {
                        name: 'A_1',
                        version: 1,
                        dependencies: {
                            A_1_1: {
                                name: 'A_1_1',
                                version: 1,
                                dependencies: {
                                    A_1: {
                                        name: 'A_1',
                                        version: 1
                                    }
                                }
                            }
                        }
                    }
                }
            };

            const moduleMap = extractModules([npmModuleMap]);

            return expect(moduleMap['A_1_1@1'].dependencyPaths).to.have.deep.members([
                ['A@1', 'A_1@1']
            ]);
    });
});

    describe('installPaths', function() {

        const module1 = memo().is(() =>
            ({
                name: 'A_1',
                version: 1
            })
        );

        const module2 = memo().is(() =>
            ({
                name: 'A_1',
                version: 1
            })
        );

        let moduleMap = null;

        beforeEach(function() {
            const npmModuleMap = {
                name: 'A',
                version: '1',
                dependencies: {
                    A_1: module1(),
                    A_2: {
                        name: 'A_2',
                        version: 1,
                        path: '/path-to/a_2',
                        dependencies: {
                            A_1: module2()
                        }
                    }
                }
            };

            return moduleMap = extractModules([npmModuleMap]);});

        context('same module and version with different paths', function() {
            module1.is(() =>
                ({
                    name: 'A_1',
                    version: 1,
                    path: '/path-to/a_1/1'
                })
            );

            module2.is(() =>
                ({
                    name: 'A_1',
                    version: 1,
                    path: '/path-to/a_1/2'
                })
            );

            return it('includes all paths', () =>
                expect(moduleMap['A_1@1'].installPaths).to.have.deep.members([
                    '/path-to/a_1/1',
                    '/path-to/a_1/2'
                ])
        );
    });

        context('same module and version with same paths', function() {

            module1.is(() =>
                ({
                    name: 'A_1',
                    version: 1,
                    path: '/path-to/a_1'
                })
            );

            module2.is(() =>
                ({
                    name: 'A_1',
                    version: 1,
                    path: '/path-to/a_1'
                })
            );

            return it('includes the same path only once', function() {
                expect(moduleMap['A_1@1'].installPaths).to.have.length(1);
                return expect(moduleMap['A_1@1'].installPaths).to.have.deep.members([
                    '/path-to/a_1'
                ]);
        });
    });

        return context('same module and different versions', function() {
            module1.is(() =>
                ({
                    name: 'A_1',
                    version: 1,
                    path: '/path-to/a_1/1'
                })
            );

            module2.is(() =>
                ({
                    name: 'A_1',
                    version: 2,
                    path: '/path-to/a_1/2'
                })
            );

            return it('only includes paths of same module version', function() {
                expect(moduleMap['A_1@1'].installPaths).to.have.deep.members([
                    '/path-to/a_1/1'
                ]);

                return expect(moduleMap['A_1@2'].installPaths).to.have.deep.members([
                    '/path-to/a_1/2'
                ]);
        });
    });
});

    describe('private', () =>

        it('ignore private modules but not their dependencies', function() {
            const npmModuleMap = {
                name: 'A',
                version: '1',
                dependencies: {
                    A_1: {
                        name: 'A_1',
                        version: 1,
                        private: true,
                        dependencies: {
                            A_1_1: {
                                name: 'A_1_1',
                                version: 1
                            }
                        }
                    }
                }
            };

            const moduleMap = extractModules([npmModuleMap]);

            expect(moduleMap).to.not.have.property('A_1@1');
            return expect(moduleMap).to.have.property('A_1_1@1');
        })
    );


    return describe('explicitName', () =>

        it('should have correct explicitName property', function() {
            const npmModuleMap = {
                name: 'A',
                version: '1',
                dependencies: {
                    A_1: {
                        name: 'A_1',
                        version: 1
                    }
                }
            };

            const moduleMap = extractModules([npmModuleMap]);

            return expect(moduleMap['A_1@1']).to.have.property('explicitName', 'A_1@1');
        })
    );
});
