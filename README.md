# OpenID Connect Sample Application

This is a sample application showing how to use [Passport.js](https://www.passportjs.org) with
[openid-client](https://github.com/panva/node-openid-client/) to provide authentication for an Express application.

## Auth2/OIDC Client Setup

To use this application you will need to register an OAuth2/OIDC client with your authorization server with the
following settings:

- Client type: web/confidential client (uses a client secret)
- Grant types: must include `Authorization Code` grant
- Token Endpoint Authentication Method: `client_secret_basic`
- Sign-in redirect URL: `<BASE_REDIRECT_URL>/login/callback`
- Sign-out redirect URL: `<BASE_REDIRECT_URL>/logout/callback`
- Scopes: must include `openid`

## Running the Application

The following environment variables need to be set to run the application:
```properties
CLIENT_ID=oidc-app
CLIENT_SECRET=oidc-app-secret
BASE_OIDC_DISCOVERY_URL=https://myauthorizationserver.example.com/
BASE_REDIRECT_URL=http://localhost:3000
```

`BASE_OIDC_DISCOVERY_URL` should be the URL to the well known endpoint for your authorization server sans
`/.well-known/openid-configuration`, e.g. [https://myauthorizationserver.example.com/](https://myauthorizationserver.example.com/).

`BASE_REDIRECT_URL` should be the URL to where you have deployed the application, without a trailing `/` in the path.

The only scope required for the application to work is `openid`. If you would like additional claims in the tokens, you
can request the corresponding scopes by specifying them with `ADDITIONAL_SCOPES`:

```properties
ADDITIONAL_SCOPES=email profile
```

Note: You can create a `.env` file in the root of the project to specify these environment variables.

Run `npm ci` to install the dependencies.

Run `npm start` to start the server.
