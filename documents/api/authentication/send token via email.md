# send token via email

will send a link with it to the given email.

## url

+ `POST` `/api/tokens`
+ `POST` `/api/token_sent`(version < 0.12.7 && date < 2015-11-26)

### [headers](../request/headers.html)

### request body

key name | value type | required
--- | --- | ---
email | string | true
name | string | false
guid | string | true
code | string | true

### [response body](../response.html)
