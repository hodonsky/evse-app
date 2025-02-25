# dev.Dockerfile
FROM node:22.13.1

ARG EXPOSE_PORT

WORKDIR /usr/src/app
COPY . .

RUN npm install

ENV NODE_ENV=development
EXPOSE ${EXPOSE_PORT}

CMD ["npm", "run", "start"]