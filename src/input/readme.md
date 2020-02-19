# fcb-input



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute       | Description                                                                              | Type                 | Default     |
| ------------- | --------------- | ---------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `autoselect`  | `autoselect`    | If `true`, it will select the value of the input if focus. It is default to select/true. | `boolean`            | `true`      |
| `clearOnEdit` | `clear-on-edit` | If `true`, the value will be cleared after focus upon edit.                              | `boolean`            | `undefined` |
| `disabled`    | `disabled`      | If `true`, the user cannot intercat with the input.                                      | `boolean`            | `false`     |
| `displayType` | `display-type`  |                                                                                          | `"dollar" \| "time"` | `"dollar"`  |
| `readonly`    | `readonly`      | If `true`, the user cannot modify the value.                                             | `boolean`            | `false`     |
| `value`       | `value`         |                                                                                          | `string`             | `""`        |


## Events

| Event      | Description                                                          | Type                         |
| ---------- | -------------------------------------------------------------------- | ---------------------------- |
| `fcbBlur`  | Emitted when the input loses focus.                                  | `CustomEvent<void>`          |
| `fcbEnter` | Emitted when ENTER or TAB key is pressed, returns the current value. | `CustomEvent<any>`           |
| `fcbFocus` | Emitted when the input as focus.                                     | `CustomEvent<void>`          |
| `fcbInput` | Event emitted on keyboard input.                                     | `CustomEvent<KeyboardEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
