# Get themes of an organization

## Url

`GET` `/api/organizations/:organization_id/themes`

### [Headers](./Headers.html)

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
