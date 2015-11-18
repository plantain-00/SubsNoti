# Get themes of an organization

## Url

`get` `/api/organizations/:organization_id/themes`

## version >=0.10.2

### Expiration Date

no

### [Parameters](./Parameters.html)

key name | value type | required | default value
--- | --- | --- | ---
page | number | false | 1
limit | number | false | 10
q | string | false | ''
isOpen | boolean | false | true
isClosed | boolean | false | false
order | [ThemeOrder](./Theme order.html) | false | "newest"

### [Cookies](./Cookies.html)

### [Response Body](./Response.html)

key name | value type
--- | ---
themes | [Theme](./Theme.html)[]
totalCount | number

## version >=0.10.0

### Expiration Date

2015-11-22

### [Parameters](./Parameters.html)

key name | value type | required | default value
--- | --- | --- | ---
page | number | false | 1
limit | number | false | 10
q | string | false | ''
isOpen | boolean | false | true
isClosed | boolean | false | false
order | [ThemeOrder](./Theme order.html) | false | 0

### [Cookies](./Cookies.html)

### [Response Body](./Response.html)

key name | value type
--- | ---
themes | [Theme](./Theme.html)[]
totalCount | number
