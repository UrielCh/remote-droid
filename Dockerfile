FROM --platform=$BUILDPLATFORM node:18-alpine As build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json tsconfig.* src pnpm-lock.yaml ./
COPY .android /root/.android
RUN npm install -g @nestjs/cli rimraf pnpm
RUN pnpm install --frozen-lockfile
RUN npm run build
# RUN npm audit fix --force
RUN rm -rf src
RUN rimraf node_modules/**/*.{md,ts,map,h,c,cc,cpp,gyp,yml,so,txt}
RUN rimraf node_modules/{types,@eslint}
RUN rimraf node_modules/**/{LICENSE,.github,.npmignore,LICENSE.txt,.travis.yml,.eslintrc,sponsors}
RUN rimraf node_modules/*/{test,binding.gyp}
RUN find . -type f -empty -print -delete
RUN find . -type d -empty -print -delete

FROM node:18-alpine As production

WORKDIR /usr/src/app
RUN apk add --no-cache android-tools
COPY --from=build /usr/src/app /usr/src/app
COPY .android /root/.android

CMD ["node", "dist/main"]
