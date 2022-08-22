FROM node:18-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
RUN apk add --no-cache android-tools
COPY package*.json ./
COPY tsconfig.* ./
COPY src ./src
COPY .android /root/.android
RUN npm install -g @nestjs/cli
RUN npm install --no-fund
RUN npm run build
RUN npm audit fix --force

CMD ["node", "dist/main"]