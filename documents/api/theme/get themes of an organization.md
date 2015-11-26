# get themes of an organization

## url

`GET` `/api/organizations/:organization_id/themes`

### [headers](../request/headers.html)

key name | value type | required | default value
--- | --- | --- | ---
page | number | false | 1
limit | number | false | 10
q | string | false | ''
isOpen | boolean | false | true
isClosed | boolean | false | false
order | [ThemeOrder](./theme order.html) | false | "newest"

### [cookies](../request/cookies.html)

### [response body](../response.html)

key name | value type
--- | ---
themes | [Theme](../theme.html)[]
totalCount | number
