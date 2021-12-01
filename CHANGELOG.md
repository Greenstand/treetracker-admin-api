# [2.23.0](https://github.com/Greenstand/treetracker-admin/compare/v2.22.2...v2.23.0) (2021-12-01)


### Features

* add join clause for trees with any tagid ([#608](https://github.com/Greenstand/treetracker-admin/issues/608)) ([c436501](https://github.com/Greenstand/treetracker-admin/commit/c4365016924783fdee1b92939bd0c7a2f05a2adb))

## [2.22.2](https://github.com/Greenstand/treetracker-admin/compare/v2.22.1...v2.22.2) (2021-11-23)


### Bug Fixes

* **planter-registration-repo:** change selector back to * so that country info would be retrieved ([#605](https://github.com/Greenstand/treetracker-admin/issues/605)) ([2d612a9](https://github.com/Greenstand/treetracker-admin/commit/2d612a9813ef4e0dc08c59f67afca13361b4181a))

## [2.22.1](https://github.com/Greenstand/treetracker-admin/compare/v2.22.0...v2.22.1) (2021-11-22)


### Bug Fixes

* update database sealed secret for production with ssl=no-verify ([3a6958c](https://github.com/Greenstand/treetracker-admin/commit/3a6958c023aaf59d5f72c3d45e9e320b85bedcfa))

# [2.22.0](https://github.com/Greenstand/treetracker-admin/compare/v2.21.1...v2.22.0) (2021-11-13)


### Features

* **grower-detail:** display device manufacturer with device id ([#600](https://github.com/Greenstand/treetracker-admin/issues/600)) ([7136c9a](https://github.com/Greenstand/treetracker-admin/commit/7136c9ad1335596b778c8a4ad26638b3da695ae3))

## [2.21.1](https://github.com/Greenstand/treetracker-admin/compare/v2.21.0...v2.21.1) (2021-11-10)


### Bug Fixes

* bugs when filtering by device identifier and org ([a1cd7d6](https://github.com/Greenstand/treetracker-admin/commit/a1cd7d6492be2be41b9c272734296d93c83b96d3))

# [2.21.0](https://github.com/Greenstand/treetracker-admin/compare/v2.20.3...v2.21.0) (2021-11-06)


### Features

* **growers:** filter growers by deviceIdentifier ([#598](https://github.com/Greenstand/treetracker-admin/issues/598)) ([cea9d24](https://github.com/Greenstand/treetracker-admin/commit/cea9d240a9cf9b6b29d325172870a1f3fb399554))

## [2.20.3](https://github.com/Greenstand/treetracker-admin/compare/v2.20.2...v2.20.3) (2021-10-27)


### Bug Fixes

* add ssl=no-verify to test and prod secrets for node 16 compatibility ([f1b2c53](https://github.com/Greenstand/treetracker-admin/commit/f1b2c53e5c5bf73e5592790961959de8c4605d21))

## [2.20.2](https://github.com/Greenstand/treetracker-admin/compare/v2.20.1...v2.20.2) (2021-10-27)


### Bug Fixes

* update sealed secret ([abff2b8](https://github.com/Greenstand/treetracker-admin/commit/abff2b8bb80a8e168b5104853d94f80f5f618ce2))

## [2.20.1](https://github.com/Greenstand/treetracker-admin/compare/v2.20.0...v2.20.1) (2021-10-05)


### Bug Fixes

* convert planter attributes to camel case ([#594](https://github.com/Greenstand/treetracker-admin/issues/594)) ([27d67c4](https://github.com/Greenstand/treetracker-admin/commit/27d67c40a3b947e1a950d9de56130c09d173f8fb))

# [2.20.0](https://github.com/Greenstand/treetracker-admin/compare/v2.19.2...v2.20.0) (2021-09-25)


### Features

* add device_identifier to planter_registration model ([#592](https://github.com/Greenstand/treetracker-admin/issues/592)) ([e886bfd](https://github.com/Greenstand/treetracker-admin/commit/e886bfdb5853eff9fdf6df1ca0515605f6743aee))

## [2.19.2](https://github.com/Greenstand/treetracker-admin/compare/v2.19.1...v2.19.2) (2021-09-24)


### Bug Fixes

* planter filter to allow filtering parent orgs by name and all orgs by id ([#589](https://github.com/Greenstand/treetracker-admin/issues/589)) ([692fdec](https://github.com/Greenstand/treetracker-admin/commit/692fdeca3583e489d62adbbfd6939917780b562f))

## [2.19.1](https://github.com/Greenstand/treetracker-admin/compare/v2.19.0...v2.19.1) (2021-08-09)


### Bug Fixes

* make imageRotation optional ([#587](https://github.com/Greenstand/treetracker-admin/issues/587)) ([256a5d6](https://github.com/Greenstand/treetracker-admin/commit/256a5d6644d05b57ddc28a4c063fc2c6e8b811e4))

# [2.19.0](https://github.com/Greenstand/treetracker-admin/compare/v2.18.0...v2.19.0) (2021-07-31)


### Features

* add image_rotation field in planter model ([#584](https://github.com/Greenstand/treetracker-admin/issues/584)) ([851ecd0](https://github.com/Greenstand/treetracker-admin/commit/851ecd0743215976918e88a531f5ec3f6e87bbd6))

# [2.18.0](https://github.com/Greenstand/treetracker-admin/compare/v2.17.4...v2.18.0) (2021-07-31)


### Features

* fix missing create-at field of user login ([#585](https://github.com/Greenstand/treetracker-admin/issues/585)) ([b610044](https://github.com/Greenstand/treetracker-admin/commit/b6100441986aea538c98fd954e6f6ec6b410282b))

## [2.17.4](https://github.com/Greenstand/treetracker-admin/compare/v2.17.3...v2.17.4) (2021-07-11)


### Bug Fixes

* give disabled account a clear response ([#579](https://github.com/Greenstand/treetracker-admin/issues/579)) ([9d34d2f](https://github.com/Greenstand/treetracker-admin/commit/9d34d2fa6623f983c1546f0f0ce6b97539976725))

## [2.17.3](https://github.com/Greenstand/treetracker-admin/compare/v2.17.2...v2.17.3) (2021-06-24)


### Bug Fixes

* allow all users to change their own passwords ([#576](https://github.com/Greenstand/treetracker-admin/issues/576)) ([e4e5692](https://github.com/Greenstand/treetracker-admin/commit/e4e5692d6af098a3f11fc1a64e45b8c66324f759))

## [2.17.2](https://github.com/Greenstand/treetracker-admin/compare/v2.17.1...v2.17.2) (2021-06-24)


### Bug Fixes

* include capture count in species results ([#577](https://github.com/Greenstand/treetracker-admin/issues/577)) ([ee458b5](https://github.com/Greenstand/treetracker-admin/commit/ee458b575eeda428299accbfaf4004ba0f7804e4))

## [2.17.1](https://github.com/Greenstand/treetracker-admin/compare/v2.17.0...v2.17.1) (2021-06-05)


### Bug Fixes

* add org id to planter endpoints ([#570](https://github.com/Greenstand/treetracker-admin/issues/570)) ([ed4b303](https://github.com/Greenstand/treetracker-admin/commit/ed4b3035b791705ee0e9dc6f687f4c36115570cc))

# [2.17.0](https://github.com/Greenstand/treetracker-admin/compare/v2.16.3...v2.17.0) (2021-05-31)


### Features

* add token_id to trees model ([#572](https://github.com/Greenstand/treetracker-admin/issues/572)) ([ec61bd9](https://github.com/Greenstand/treetracker-admin/commit/ec61bd949bd0855910bf004318706d719b32ed32))

## [2.16.3](https://github.com/Greenstand/treetracker-admin/compare/v2.16.2...v2.16.3) (2021-05-21)


### Bug Fixes

* use dns name for rabbitmq in k8 ([80ecbeb](https://github.com/Greenstand/treetracker-admin/commit/80ecbeb1cb60228c534c18c774bd51617654a7c7))
* use dns name for rabbitmq in k8 ([1f419d7](https://github.com/Greenstand/treetracker-admin/commit/1f419d70acc978d47438557a7dc11d16f0ff3d2b))

## [2.16.2](https://github.com/Greenstand/treetracker-admin/compare/v2.16.1...v2.16.2) (2021-05-21)


### Bug Fixes

* enable DELETE on API deployment ([#561](https://github.com/Greenstand/treetracker-admin/issues/561)) ([1758517](https://github.com/Greenstand/treetracker-admin/commit/17585176b957dd6054f1fd71a9fb367d9835468c))

## [2.16.1](https://github.com/Greenstand/treetracker-admin/compare/v2.16.0...v2.16.1) (2021-05-17)


### Bug Fixes

* organization user unauthorized error for verify filter ([#562](https://github.com/Greenstand/treetracker-admin/issues/562)) ([39cda32](https://github.com/Greenstand/treetracker-admin/commit/39cda32ef32716bcb9e24adf5964d483f936d243))

# [2.16.0](https://github.com/Greenstand/treetracker-admin/compare/v2.15.5...v2.16.0) (2021-05-10)


### Features

* make new api route for planter to get selfies from tree ([#558](https://github.com/Greenstand/treetracker-admin/issues/558)) ([0f118d0](https://github.com/Greenstand/treetracker-admin/commit/0f118d086bd55b07c355fc14d54aaacce10c9ec6))

## [2.15.5](https://github.com/Greenstand/treetracker-admin/compare/v2.15.4...v2.15.5) (2021-04-30)


### Bug Fixes

* use local dns name for rabbitmq messaging system in k8 cluster ([#547](https://github.com/Greenstand/treetracker-admin/issues/547)) ([0239dff](https://github.com/Greenstand/treetracker-admin/commit/0239dff1b90d2a378b146d77f71e4edb98b87408))

## [2.15.4](https://github.com/Greenstand/treetracker-admin/compare/v2.15.3...v2.15.4) (2021-04-30)


### Bug Fixes

* setting organizationID to null ([#557](https://github.com/Greenstand/treetracker-admin/issues/557)) ([74af2d5](https://github.com/Greenstand/treetracker-admin/commit/74af2d580ea73bd5cc979cb7de19b98da4754235))

## [2.15.3](https://github.com/Greenstand/treetracker-admin/compare/v2.15.2...v2.15.3) (2021-04-26)


### Bug Fixes

* apply pagination to Verify tree query when filtering by tag ([#555](https://github.com/Greenstand/treetracker-admin/issues/555)) ([ca75dbd](https://github.com/Greenstand/treetracker-admin/commit/ca75dbd99b0326247af237fcba754110c080f93e))

## [2.15.2](https://github.com/Greenstand/treetracker-admin/compare/v2.15.1...v2.15.2) (2021-04-24)


### Bug Fixes

* organization and tree tag filters  ([#549](https://github.com/Greenstand/treetracker-admin/issues/549)) ([72a9ced](https://github.com/Greenstand/treetracker-admin/commit/72a9ced0f4f2fc90816fc58c31b00188d7dc0b79))

## [2.15.1](https://github.com/Greenstand/treetracker-admin/compare/v2.15.0...v2.15.1) (2021-04-11)


### Bug Fixes

* force build for new mapping ([9eaf547](https://github.com/Greenstand/treetracker-admin/commit/9eaf547b0e35a152605163da427a23478dac3267))

# [2.15.0](https://github.com/Greenstand/treetracker-admin/compare/v2.14.9...v2.15.0) (2021-04-08)


### Features

* add deviceIdentifier to trees model ([#546](https://github.com/Greenstand/treetracker-admin/issues/546)) ([4be4845](https://github.com/Greenstand/treetracker-admin/commit/4be48452c679d4c0aa22f0a5577706c136de564c))

## [2.14.9](https://github.com/Greenstand/treetracker-admin/compare/v2.14.8...v2.14.9) (2021-03-30)


### Bug Fixes

* disable verify publishing ([35b6c01](https://github.com/Greenstand/treetracker-admin/commit/35b6c0103cd9e5d7a4e5489f13c15e34f9de741f))

## [2.14.8](https://github.com/Greenstand/treetracker-admin/compare/v2.14.7...v2.14.8) (2021-03-29)


### Bug Fixes

* update database-connection sealed secret ([ca20b8e](https://github.com/Greenstand/treetracker-admin/commit/ca20b8ef323227774fdb32f9c28fe18568eec13a))

## [2.14.7](https://github.com/Greenstand/treetracker-admin/compare/v2.14.6...v2.14.7) (2021-03-29)


### Bug Fixes

* user roles and policies ([#543](https://github.com/Greenstand/treetracker-admin/issues/543)) ([6e257a0](https://github.com/Greenstand/treetracker-admin/commit/6e257a0fe55d46d2d8a6529fbd7669709cf76869))

## [2.14.6](https://github.com/Greenstand/treetracker-admin/compare/v2.14.5...v2.14.6) (2021-03-25)


### Bug Fixes

* fix up sealed secret overlay to match base ([8c2b102](https://github.com/Greenstand/treetracker-admin/commit/8c2b102fa58cd79dde9301d1065d5841f9977ba6))

## [2.14.5](https://github.com/Greenstand/treetracker-admin/compare/v2.14.4...v2.14.5) (2021-03-25)


### Bug Fixes

* fix rabbitmq sealed secret ([07a507e](https://github.com/Greenstand/treetracker-admin/commit/07a507e8dfe746fc8211f2f9730260c44b1d269f))

## [2.14.4](https://github.com/Greenstand/treetracker-admin/compare/v2.14.3...v2.14.4) (2021-03-25)


### Bug Fixes

* remove namespace from sealed secret ([35b06d0](https://github.com/Greenstand/treetracker-admin/commit/35b06d01edbe05cfeeee93cb0a376e08ebc6a32c))

## [2.14.3](https://github.com/Greenstand/treetracker-admin/compare/v2.14.2...v2.14.3) (2021-03-25)


### Bug Fixes

* force a release ([60b9dcb](https://github.com/Greenstand/treetracker-admin/commit/60b9dcb15eff9a6a5cb15d43974f4cc42b4d6fb2))

## [2.14.2](https://github.com/Greenstand/treetracker-admin/compare/v2.14.1...v2.14.2) (2021-03-14)


### Bug Fixes

* exclude inactive species ([#541](https://github.com/Greenstand/treetracker-admin/issues/541)) ([dd51baa](https://github.com/Greenstand/treetracker-admin/commit/dd51baa7c5041dfc21bb88bf319583438efac7ca))

## [2.14.1](https://github.com/Greenstand/treetracker-admin/compare/v2.14.0...v2.14.1) (2021-03-14)


### Bug Fixes

* make 'active' a bool in species model ([#539](https://github.com/Greenstand/treetracker-admin/issues/539)) ([4664716](https://github.com/Greenstand/treetracker-admin/commit/46647166f8d4c2dc9215c9d008046ebe4874e9d3))

# [2.14.0](https://github.com/Greenstand/treetracker-admin/compare/v2.13.4...v2.14.0) (2021-03-12)


### Features

* Add country ([#537](https://github.com/Greenstand/treetracker-admin/issues/537)) ([22a2900](https://github.com/Greenstand/treetracker-admin/commit/22a29000c9ae31eae83c77933925449b14373503))

## [2.13.4](https://github.com/Greenstand/treetracker-admin/compare/v2.13.3...v2.13.4) (2021-03-04)


### Bug Fixes

* use admin-api namespace ([ce2b66d](https://github.com/Greenstand/treetracker-admin/commit/ce2b66d835961e2f0fd310d201e57c14e604dc0e))

## [2.13.3](https://github.com/Greenstand/treetracker-admin/compare/v2.13.2...v2.13.3) (2021-03-04)


### Bug Fixes

* fix GVK path to sealed secret ([740bf86](https://github.com/Greenstand/treetracker-admin/commit/740bf86e4733922f4ea6a2b3661c25322d1640af))

## [2.13.2](https://github.com/Greenstand/treetracker-admin/compare/v2.13.1...v2.13.2) (2021-03-04)


### Bug Fixes

* call kustomize the right way for overlays ([c8cfa7c](https://github.com/Greenstand/treetracker-admin/commit/c8cfa7c955bdecd538b40aef019de8e62945703d))

## [2.13.1](https://github.com/Greenstand/treetracker-admin/compare/v2.13.0...v2.13.1) (2021-03-04)


### Bug Fixes

* base sealed secrets should be empty ([bb50255](https://github.com/Greenstand/treetracker-admin/commit/bb5025568c32f3cb51c213640dbb1a202c4d182d))
* use kustomize to generate resource definitions from overlays ([9f5e801](https://github.com/Greenstand/treetracker-admin/commit/9f5e8016ee3dfabd289fca682028dd320dd96c8d))

# [2.13.0](https://github.com/Greenstand/treetracker-admin/compare/v2.12.3...v2.13.0) (2021-02-28)


### Features

* add /species/combine controller ([#530](https://github.com/Greenstand/treetracker-admin/issues/530)) ([c5a589d](https://github.com/Greenstand/treetracker-admin/commit/c5a589d7930c947f0a7ada2a7959eed41e9da387))

## [2.12.3](https://github.com/Greenstand/treetracker-admin/compare/v2.12.2...v2.12.3) (2021-02-22)


### Bug Fixes

* don't look for host ip from request headers while auditing ([2dd0af2](https://github.com/Greenstand/treetracker-admin/commit/2dd0af2def7e74efebaf3f4599d785dd2925b368))

## [2.12.2](https://github.com/Greenstand/treetracker-admin/compare/v2.12.1...v2.12.2) (2021-02-18)


### Bug Fixes

* prettier config files for client/server ([#519](https://github.com/Greenstand/treetracker-admin/issues/519)) ([9f233dd](https://github.com/Greenstand/treetracker-admin/commit/9f233dd976a432fb6852f4cf5ee2c2903fe2d533))

## [2.12.1](https://github.com/Greenstand/treetracker-admin/compare/v2.12.0...v2.12.1) (2021-02-17)


### Bug Fixes

* allow users to list organizations ([#511](https://github.com/Greenstand/treetracker-admin/issues/511)) ([f54f992](https://github.com/Greenstand/treetracker-admin/commit/f54f99293386b26e4156dac90754ffe96eafe9d0))

# [2.12.0](https://github.com/Greenstand/treetracker-admin/compare/v2.11.6...v2.12.0) (2021-02-16)


### Features

* fixes based on PR feedback ([1b18a27](https://github.com/Greenstand/treetracker-admin/commit/1b18a27752e458f0d2a1a4efebbc1bad3cd421f1))
* make error handling robust when publishing messages ([df80411](https://github.com/Greenstand/treetracker-admin/commit/df80411be1161fc15840f64c902de157301a14a4))
* propagate rejection reason as part of verificaton event ([9fb6790](https://github.com/Greenstand/treetracker-admin/commit/9fb67904235c146b6df2e4dcaf0562354467e87d))
* raise and publish domainevent on verification ([8f89f3e](https://github.com/Greenstand/treetracker-admin/commit/8f89f3eed285a6a14ba42bb9cd66f90076a5b259))
* remove unused variable ([19b93ab](https://github.com/Greenstand/treetracker-admin/commit/19b93abd4cddb2a04f0d0ee90603bfbd95bbd0b6))
* Use env variable for a config property ([ebc8339](https://github.com/Greenstand/treetracker-admin/commit/ebc8339f3e7649742c4571dc25e5616ba2b069d6))
* use loopback connector transaction using import instead of require ([b213dd9](https://github.com/Greenstand/treetracker-admin/commit/b213dd91b65b9581d07129b073e61ef7efd5470d))
* WIP - publishing verification messages on verify action ([85d0bec](https://github.com/Greenstand/treetracker-admin/commit/85d0becf24cf1a669d3cb53191ea07333c6e17ed))

## [2.11.6](https://github.com/Greenstand/treetracker-admin/compare/v2.11.5...v2.11.6) (2021-02-15)


### Bug Fixes

* correct import syntax for config ([#516](https://github.com/Greenstand/treetracker-admin/issues/516)) ([e713a71](https://github.com/Greenstand/treetracker-admin/commit/e713a71d5370d83fad3841a6cf5fb898513f71b8))

## [2.11.5](https://github.com/Greenstand/treetracker-admin/compare/v2.11.4...v2.11.5) (2021-02-15)


### Bug Fixes

* audit logging ([#501](https://github.com/Greenstand/treetracker-admin/issues/501)) ([de5840a](https://github.com/Greenstand/treetracker-admin/commit/de5840ab0204a4099dde0b2afdca3d8e646fb99e))

## [2.11.4](https://github.com/Greenstand/treetracker-admin/compare/v2.11.3...v2.11.4) (2021-02-15)


### Bug Fixes

* timestamptz datatype spelling mistake ([#513](https://github.com/Greenstand/treetracker-admin/issues/513)) ([09413b2](https://github.com/Greenstand/treetracker-admin/commit/09413b24cab83dc8f7e82cdd6f7de1660541db1c))

## [2.11.3](https://github.com/Greenstand/treetracker-admin/compare/v2.11.2...v2.11.3) (2021-02-13)


### Bug Fixes

* 404 error at /check_session ([#506](https://github.com/Greenstand/treetracker-admin/issues/506)) ([f025de0](https://github.com/Greenstand/treetracker-admin/commit/f025de00d8916c2cd4c68518a330af9d3772b3f0))

## [2.11.2](https://github.com/Greenstand/treetracker-admin/compare/v2.11.1...v2.11.2) (2021-02-13)


### Bug Fixes

* reinstate dev webmap domain ([8915ceb](https://github.com/Greenstand/treetracker-admin/commit/8915ceb2d070a0836c0cf3a6e23f7d9393de31f9))

## [2.11.1](https://github.com/Greenstand/treetracker-admin/compare/v2.11.0...v2.11.1) (2021-02-10)


### Bug Fixes

* point dev client at deployed dev API by default ([#505](https://github.com/Greenstand/treetracker-admin/issues/505)) ([97968a8](https://github.com/Greenstand/treetracker-admin/commit/97968a8a8fff2cca3ad92cfd3317c6ab191fa7fb))

# [2.11.0](https://github.com/Greenstand/treetracker-admin/compare/v2.10.0...v2.11.0) (2021-02-08)


### Features

* add species on /species ([#497](https://github.com/Greenstand/treetracker-admin/issues/497)) ([bbb20a0](https://github.com/Greenstand/treetracker-admin/commit/bbb20a06aafa6f49ce6799d5e45e7a7f9108c1e2))

# [2.10.0](https://github.com/Greenstand/treetracker-admin/compare/v2.9.0...v2.10.0) (2021-02-04)


### Features

* filter by not tagged on /verify ([#496](https://github.com/Greenstand/treetracker-admin/issues/496)) ([2369718](https://github.com/Greenstand/treetracker-admin/commit/236971823232a40c64b2332603d1b6272c62dbe5))

# [2.9.0](https://github.com/Greenstand/treetracker-admin/compare/v2.8.0...v2.9.0) (2021-02-04)


### Features

* edit planter ([#495](https://github.com/Greenstand/treetracker-admin/issues/495)) ([6b03509](https://github.com/Greenstand/treetracker-admin/commit/6b03509027cd126901641d2016e6c589ab56009e))

# [2.8.0](https://github.com/Greenstand/treetracker-admin/compare/v2.7.0...v2.8.0) (2021-02-03)


### Features

* add note to tree dialog on /verify ([#494](https://github.com/Greenstand/treetracker-admin/issues/494)) ([b13d4f3](https://github.com/Greenstand/treetracker-admin/commit/b13d4f3b162435bc14462f7ee6392926bec4e05b))

# [2.7.0](https://github.com/Greenstand/treetracker-admin/compare/v2.6.1...v2.7.0) (2021-02-02)


### Features

* add planter org name ([#493](https://github.com/Greenstand/treetracker-admin/issues/493)) ([0217e48](https://github.com/Greenstand/treetracker-admin/commit/0217e48a1646e0379eb435798fc1a6abf5747250))

## [2.6.1](https://github.com/Greenstand/treetracker-admin/compare/v2.6.0...v2.6.1) (2021-01-17)


### Bug Fixes

* trees page ([#487](https://github.com/Greenstand/treetracker-admin/issues/487)) ([cdf2de5](https://github.com/Greenstand/treetracker-admin/commit/cdf2de5f42c6ca9590a30706ebde96193f822ef8))

# [2.6.0](https://github.com/Greenstand/treetracker-admin/compare/v2.5.0...v2.6.0) (2021-01-09)


### Features

* trying to fix tests on server ([#479](https://github.com/Greenstand/treetracker-admin/issues/479)) ([4b9c8ed](https://github.com/Greenstand/treetracker-admin/commit/4b9c8edfd916664cf6065cc620360daa223acfe4))

# [2.5.0](https://github.com/Greenstand/treetracker-admin/compare/v2.4.4...v2.5.0) (2020-12-22)


### Bug Fixes

* reinstate patch number in version ([aaede69](https://github.com/Greenstand/treetracker-admin/commit/aaede6972e5004256e2fcffc625f99c9e36a5e4a))


### Features

* bump release ([480bec5](https://github.com/Greenstand/treetracker-admin/commit/480bec538eb9ba98765753470d670f72082fa797))
* bump release ([8f9d4e9](https://github.com/Greenstand/treetracker-admin/commit/8f9d4e9688432daba0573fa72dc90dbecd771e61))

## [2.4.4](https://github.com/Greenstand/treetracker-admin/compare/v2.4.3...v2.4.4) (2020-12-10)


### Bug Fixes

* remove duplicate github plugin ([#475](https://github.com/Greenstand/treetracker-admin/issues/475)) ([542f3ea](https://github.com/Greenstand/treetracker-admin/commit/542f3ea7dfda61143a7a5fe06431a5cc29f392ac))

## [2.4.3](https://github.com/Greenstand/treetracker-admin/compare/v2.4.2...v2.4.3) (2020-12-10)


### Bug Fixes

* refactoring to trigger build ([9f6c514](https://github.com/Greenstand/treetracker-admin/commit/9f6c5140c44cdff9d2c5c8a0a4f39857e9ea51a2))
* Set options on github plugin ([7f8bb42](https://github.com/Greenstand/treetracker-admin/commit/7f8bb42e71d7f05a483fec93e55dd28384b31b9d))

## [2.4.2](https://github.com/Greenstand/treetracker-admin/compare/v2.4.1...v2.4.2) (2020-12-10)


### Bug Fixes

* export bumped version as env variable and disable a few semantic-release bot features ([2ecd7ce](https://github.com/Greenstand/treetracker-admin/commit/2ecd7ce2153d843fa83b0f7c02ba96d73b99400f))

## [2.4.1](https://github.com/Greenstand/treetracker-admin/compare/v2.4.0...v2.4.1) (2020-12-10)


### Bug Fixes

* read the root package.json ([8306304](https://github.com/Greenstand/treetracker-admin/commit/8306304ff40b76305e03f37b271e7e1b1b281390))

# [2.4.0](https://github.com/Greenstand/treetracker-admin/compare/v2.3.0...v2.4.0) (2020-12-10)


### Bug Fixes

* Add semver ([#465](https://github.com/Greenstand/treetracker-admin/issues/465)) ([47758e5](https://github.com/Greenstand/treetracker-admin/commit/47758e543dab28c99b79dd42b3b04033a2116dba))
* bug ([#421](https://github.com/Greenstand/treetracker-admin/issues/421)) ([61791ca](https://github.com/Greenstand/treetracker-admin/commit/61791cae0d9f4cfeff4bfbfdc9999170e87bd958))
* error when validate user password ([ad00dd8](https://github.com/Greenstand/treetracker-admin/commit/ad00dd8a426680fdbf0df98a22bd155da2d262f1))
* init ([51106cb](https://github.com/Greenstand/treetracker-admin/commit/51106cb94640b7d6fb82ef6abf0198a71039ea3b))
* merging error ([c6d19b3](https://github.com/Greenstand/treetracker-admin/commit/c6d19b3d13ec27a0fb5e60115db2695c68574039))
* move config to rootDir ([6525e91](https://github.com/Greenstand/treetracker-admin/commit/6525e91527bd68b1f49f4f68de184bea1b65f9fc))
* remove type in url on readme for local dev ([3b6f28e](https://github.com/Greenstand/treetracker-admin/commit/3b6f28e733e7ada5594ae5bf7169f52db7297d19))
* typo ([7e87a50](https://github.com/Greenstand/treetracker-admin/commit/7e87a505d3efc0c312780d214336ca9e013f0a39))
* uncomment ([25a54ae](https://github.com/Greenstand/treetracker-admin/commit/25a54ae77fa5919faae6da17369984a4c6c5487b))


### Features

* add copy ui ([cb042c9](https://github.com/Greenstand/treetracker-admin/commit/cb042c9757b144f418d43f5b31effcee3df234fb))
* add dependency ([9779948](https://github.com/Greenstand/treetracker-admin/commit/9779948925fcb0f8d6485993058cfda10ebba5de))
* add dependency ([c2996db](https://github.com/Greenstand/treetracker-admin/commit/c2996dbf2a62d34b442f2db6c4221eb20c942e7c))
* add env file temporily ([70285a2](https://github.com/Greenstand/treetracker-admin/commit/70285a2f64678cfd2d0612e52406be7d2dd7937e))
* add functionality ([54012fa](https://github.com/Greenstand/treetracker-admin/commit/54012faa9fc8dc295611dd212bbb36d796b564e5))
* add input onChange event ([d9c56a5](https://github.com/Greenstand/treetracker-admin/commit/d9c56a5149962726073c202ea6eef4ddec13ed06))
* add jwt into dotenv ([14870c3](https://github.com/Greenstand/treetracker-admin/commit/14870c3b7bc8c62ef7199ea6c7f39d33106ee370))
* add loading spinner and prevent user click ([ca749cb](https://github.com/Greenstand/treetracker-admin/commit/ca749cb95d892e8573c7b69d18725607cd42c5b9))
* add password strength indicator UI ([715e81d](https://github.com/Greenstand/treetracker-admin/commit/715e81d54c7f01f2fd2e2dbd6c13b04ccdd9913b))
* add radio group for active status ([4212eef](https://github.com/Greenstand/treetracker-admin/commit/4212eeffde5ebd9b066c952642dad6f59c97372a))
* add the UI in place ([d814722](https://github.com/Greenstand/treetracker-admin/commit/d814722ca458d9b1ce1ebf3ac15b124ac338bd3c))
* add user login validation ([1fe644c](https://github.com/Greenstand/treetracker-admin/commit/1fe644c5a2275d0216bbf278171cf776d1beb912))
* added delete user. Auth error persisting on delete user ([9bbd86c](https://github.com/Greenstand/treetracker-admin/commit/9bbd86ca2bebd5302f804ffade8148f4372846ac))
* auto generate pwd ([ceac49f](https://github.com/Greenstand/treetracker-admin/commit/ceac49f8ddc59c6b444cbe8cb0f4a99e1b5c9692))
* check localStorage before painting ([ac207f6](https://github.com/Greenstand/treetracker-admin/commit/ac207f657bcf64290f746e675bf700b2db58e08a))
* empty right selected before close Dialog ([c3abe94](https://github.com/Greenstand/treetracker-admin/commit/c3abe946db97cc674ec0ab086fb351c32ea8a71e))
* empty right selected before close Dialog ([d0b721f](https://github.com/Greenstand/treetracker-admin/commit/d0b721f1a5c7b4e8f3592bec3b211e7b6d748b27))
* exclude sensitave info from login return ([eece41e](https://github.com/Greenstand/treetracker-admin/commit/eece41e56a2a30028949ac7958faa83a6c69df81))
* exclude sensitave info from login return ([f01f25f](https://github.com/Greenstand/treetracker-admin/commit/f01f25f7dba9e8bb4ca338662d6854cc7a6085ed))
* fix node version to 12 in server/client ([#386](https://github.com/Greenstand/treetracker-admin/issues/386)) ([2ac67e9](https://github.com/Greenstand/treetracker-admin/commit/2ac67e9d534fc365348458e265327c227fa66326))
* get policy sent back to client ([4d5939b](https://github.com/Greenstand/treetracker-admin/commit/4d5939be08e3bc7b41f294b3513507237348d7cf))
* get tree count by species ([#391](https://github.com/Greenstand/treetracker-admin/issues/391)) ([a50cd16](https://github.com/Greenstand/treetracker-admin/commit/a50cd169575758a569c7d594fea0e3387af24fbe))
* hash password and add salt into database ([d1ef07e](https://github.com/Greenstand/treetracker-admin/commit/d1ef07ebf3331f21d04a8b8e2724e41ed540b774))
* no space in username allowed ([#348](https://github.com/Greenstand/treetracker-admin/issues/348)) ([4258a3a](https://github.com/Greenstand/treetracker-admin/commit/4258a3a132cc92d52014e585a8db1e130415c388))
* only show error when focus ([21a4180](https://github.com/Greenstand/treetracker-admin/commit/21a418088c21a06c4445c77c10841784fda69386))
* replace role with policu(comments kept) ([73b2f9e](https://github.com/Greenstand/treetracker-admin/commit/73b2f9e2810daf3bd1b4f8eb32e75bb9b199f72c))
* sort users by created time ([991e012](https://github.com/Greenstand/treetracker-admin/commit/991e012bcfebc3bea5097f8e62a0a44fccae9315))
* update login password check to use hashed_pwd instead of raw pwd ([c6ecef4](https://github.com/Greenstand/treetracker-admin/commit/c6ecef4ec595df638ef8f2c0a24e1ca251586070))
* validate 3 input fields and request BE to update pwd ([e366c0f](https://github.com/Greenstand/treetracker-admin/commit/e366c0f1a632ef336e3dd134ab4d5e5af830cfaa))
* validate pwd the same ([5b8314a](https://github.com/Greenstand/treetracker-admin/commit/5b8314a7770396e7be36cd79d85610f1bccc7539))
* write policy into sql db ([ab7c9e5](https://github.com/Greenstand/treetracker-admin/commit/ab7c9e5c8811825b1786649d02ea58ed64076da1))
