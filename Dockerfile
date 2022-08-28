FROM docker.io/library/node:16-alpine AS base-image
RUN apk update && apk upgrade

# Build vue app into /src/dist
FROM base-image AS vue-builder
WORKDIR /src
COPY public/ /src/public
COPY src/ /src/src
COPY views/ /src/views
COPY .eslintrc.js .postcssrc.js babel.config.js package.json vue.config.js yarn.lock /src/

RUN yarn install --frozen-lockfile

RUN --mount=type=secret,id=GOOGLE_SITE_VERIFICATION_CODE \
    GOOGLE_SITE_VERIFICATION_CODE="$(cat /run/secrets/GOOGLE_SITE_VERIFICATION_CODE)" yarn build

# Download runtime node_modules
FROM base-image AS runtime-node-modules
WORKDIR /src
COPY package.json yarn.lock /src/
RUN yarn install --production=true --frozen-lockfile

# Final image
FROM base-image AS muc-app
LABEL Author="Anirban Mukhopadhyay"

ARG USER=ruby-user

# Create a non-root user
RUN addgroup -S ${USER} && adduser -D -H -S -G ${USER} ${USER}

WORKDIR /src

# Copy server.js, src/ & node_modules
COPY --chown=${USER}:${USER} server.js /src/
COPY --chown=${USER}:${USER} src/lib/ /src/src/lib/
COPY --chown=${USER}:${USER} --from=runtime-node-modules /src/package.json /src/yarn.lock /src/
COPY --chown=${USER}:${USER} --from=runtime-node-modules /src/node_modules/ /src/node_modules/

# Copy built dist
COPY --chown=${USER}:${USER} --from=vue-builder /src/dist/ /src/dist/

USER ${USER}

# Move templates out of dist so that it is servable outright
RUN mkdir /src/ejs_templates && mv /src/dist/templates/* /src/ejs_templates && rm -rf /src/dist/templates

ENV EJS_TEMPLATE_DIR "/src/ejs_templates"
ENV PORT 8080
ENTRYPOINT ["node", "server.js"]
