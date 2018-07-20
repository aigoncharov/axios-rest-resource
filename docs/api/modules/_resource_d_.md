[axios-resource](../README.md) > ["resource"](../modules/_resource_d_.md)

# External module: "resource"

## Index

### Classes

- [ResourceBuilder](../classes/_resource_d_.resourcebuilder.md)

### Interfaces

- [IAPIMethodSchema](../interfaces/_resource_d_.iapimethodschema.md)
- [IActionMeta](../interfaces/_resource_d_.iactionmeta.md)
- [IBuildParams](../interfaces/_resource_d_.ibuildparams.md)
- [IBuildParamsExtended](../interfaces/_resource_d_.ibuildparamsextended.md)
- [IResource](../interfaces/_resource_d_.iresource.md)
- [IResourceDefault](../interfaces/_resource_d_.iresourcedefault.md)

### Type aliases

- [IAPIMethod](_resource_d_.md#iapimethod)
- [IBuildParamsExtendedRes](_resource_d_.md#ibuildparamsextendedres)

### Variables

- [resourceSchemaDefault](_resource_d_.md#resourceschemadefault)

---

## Type aliases

<a id="iapimethod"></a>

### IAPIMethod

**ΤIAPIMethod**: _`function`_

#### Type declaration

▸(action: _[IActionMeta](../interfaces/\_resource_d_.iactionmeta.md)<`any`, `any`>_, requestConfig?: _`Partial`<`AxiosRequestConfig`>\_): `AxiosPromise`

**Parameters:**

| Param                    | Type                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| action                   | [IActionMeta](../interfaces/_resource_d_.iactionmeta.md)<`any`, `any`> |
| `Optional` requestConfig | `Partial`<`AxiosRequestConfig`>                                        |

**Returns:** `AxiosPromise`

---

<a id="ibuildparamsextendedres"></a>

### IBuildParamsExtendedRes

**ΤIBuildParamsExtendedRes**: _`object`_

#### Type declaration

---

## Variables

<a id="resourceschemadefault"></a>

### `<Const>` resourceSchemaDefault

**● resourceSchemaDefault**: _`object`_

_**description**_: Default resource schema used by ResourceBuilder.prototype.build

#### Type declaration

create: `object`

method: `string`

read: `object`

method: `string`

readOne: `object`

method: `string`

url: `string`

remove: `object`

method: `string`

url: `string`

update: `object`

method: `string`

url: `string`

---
