FROM node:16.17.1-alpine3.16 as build
WORKDIR /usr/app
COPY . /usr/app
RUN npm install
RUN npm run build

# FROM nginx:1.23.1-alpine
# EXPOSE 80
# RUN ls
# COPY --from=build /usr/app/nginx-conf.d /etc/nginx/conf.d/default.conf
# COPY --from=build /usr/app/build /usr/share/nginx/html