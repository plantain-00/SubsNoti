# send token via email

will send a link with it to the given email.

## url

`POST` `/api/tokens`

### [headers](../request/headers.html)

### request body

key name | value type | required
--- | --- | ---
email | string | true
name | string | false
guid | string | true
code | string | true

### [response body](../response.html)
