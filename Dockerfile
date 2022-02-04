FROM node:14 AS development

WORKDIR /srv/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# Production
FROM node:14 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /srv/app

COPY --from=development /srv/app .

EXPOSE 8080

CMD [ "node", "dist/main" ]
