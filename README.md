# replace-env-file-action

# Replace env vars in file

## Usage
#### Inputs
- `path` File path
- `add_if_not_exist` Add if there is no key
- `map` Key value list

## Example
```yaml
uses: qgxpagamentos/replace-env-file-actionn@v1
with:
  path: /path/to/file.txt
  add_if_not_exist: true
  map: |
    KEY = VALUE
    KEY2=VALUE2
```
