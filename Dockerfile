FROM node:16

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --frozen-lockfile

CMD [ "node", "build/service.mjs" ]