FROM node:21-alpine3.17 as builder

RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app

COPY . ./

RUN npm install -g @angular/cli
RUN npm install
RUN node node_modules/.bin/ng build -c production

FROM nginx:stable

# Set environment vars
ENV BASE_URL /
ENV API_HOST http://gateway:5000/api

COPY --from=builder /home/node/app/dist /home/node/app

COPY nginx/sites-enabled.conf /etc/nginx/conf.d/default.conf

WORKDIR /home/node/app

CMD sed -i 's|<base href="/">|<base href="'$BASE_URL'">|g' /home/node/app/index.html && \
    sed -i 's|^\(\s*\)rewrite ^/(.*)$ /$1 last;|\1rewrite ^'$BASE_URL'(.*)$ /$1 last;|g' /etc/nginx/conf.d/default.conf && \
    sed -i 's|http://gateway:5000/api|'$API_HOST'|g' /etc/nginx/conf.d/default.conf && \
    nginx -g "daemon off;"

EXPOSE 80