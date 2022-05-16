FROM node:16-alpine

RUN apk update \
  && apk add make g++ python3

WORKDIR /srv/app

COPY package.json ./

COPY yarn.lock ./

RUN yarn install 

COPY . .

RUN yarn run build

EXPOSE 3000

CMD [ "node", "dist/main" ]
