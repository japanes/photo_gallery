FROM node:24-alpine

WORKDIR /app

EXPOSE 4200

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
