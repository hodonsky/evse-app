# prod.Dockerfile
FROM node:22.13.1

ARG EXPOSE_PORT

WORKDIR /usr/src/app
COPY . .

RUN npm install && npm run build

ENV NODE_ENV=production
EXPOSE ${EXPOSE_PORT}

CMD ["npm", "run", "start"]