FROM node:18-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
RUN apk add --no-cache android-tools
COPY package*.json tsconfig.* src ./
COPY .android /root/.android
RUN npm install -g @nestjs/cli && npm install --no-fund && npm run build && npm audit fix --force
RUN rm -rf src

CMD ["node", "dist/main"]