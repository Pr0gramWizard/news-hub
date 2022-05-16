FROM node:16-alpine

WORKDIR /srv/app

COPY package.json ./

COPY yarn.lock ./

RUN yarn install

COPY . .

CMD [ "yarn", "run", "build:watch" ]
