# local.Dockerfile
FROM node:22.13.1

ARG EXPOSE_PORT

RUN apt-get update && \
    apt-get install -y --no-install-recommends net-tools curl openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY ./nginx/certs/server.crt /usr/local/share/ca-certificates/nginx.crt
#COPY ./orchestrator/server.crt /usr/local/share/ca-certificates/orchestrator.crt
RUN chmod 644 /usr/local/share/ca-certificates/*.crt && \
    update-ca-certificates

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

ADD ./evse/node-app /usr/src/app
RUN npm i

ENV NODE_ENV=local

EXPOSE ${EXPOSE_PORT}

CMD npm run start