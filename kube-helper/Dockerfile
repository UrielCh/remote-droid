FROM node:18-alpine As build

WORKDIR /usr/src/app
COPY webpack.config.ts package.json tsconfig.json ./
COPY src/*.ts ./src/
RUN npm install -g rimraf
RUN npm install --no-fund
RUN npm audit fix --force
RUN npm run build

FROM node:18-alpine As production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/bundle.js /usr/src/app
CMD ["node", "bundle.js"]
