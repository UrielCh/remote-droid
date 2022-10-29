# FROM --platform=$BUILDPLATFORM node:18-alpine As build
FROM node:18-alpine As build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
RUN npm install -g @nestjs/cli rimraf
COPY .android /root/.android
COPY package*.json tsconfig.* pnpm-lock.yaml ./
RUN npm install --force
COPY src ./
RUN npm run build
# RUN npm audit fix --force
RUN rm -rf src
RUN rimraf node_modules/**/*.{md,ts,yml,txt}
RUN rimraf node_modules/{@eslint}
RUN rimraf node_modules/**/{LICENSE,.github,.npmignore,LICENSE.txt,.travis.yml,.eslintrc,sponsors}
RUN rimraf node_modules/*/{test}
RUN rimraf node_modules/typescript
# sharp is Arch dependent
#RUN npm remove sharp
#RUN npm remove argon2
RUN find . -type f -empty -print -delete
RUN find . -type d -empty -print -delete
#RUN npm install --force sharp 

FROM node:18-alpine As production
WORKDIR /usr/src/app
RUN apk add --no-cache android-tools
COPY --from=build /usr/src/app /usr/src/app
COPY .android /root/.android
RUN cd node_modules/argon2/ && rm lib/binding/napi-v3/argon2.node && npm run install
RUN cd node_modules/sharp/ && npm run install
ARG VERSION
CMD ["node", "dist/main"] 
# docker run -it --rm urielch/remote-droid:latest /bin/ash