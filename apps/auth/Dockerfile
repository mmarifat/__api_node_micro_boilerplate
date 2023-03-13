FROM node:18-alpine As base
RUN npm install -g pnpm

FROM base as development
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml .npmrc ./
RUN pnpm install

FROM base as build
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY . .
COPY --from=development /usr/src/app/node_modules ./node_modules
RUN pnpm build auth
RUN pnpm prune --prod

FROM base as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist/ ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

CMD ["node", "dist/apps/auth/main"]
