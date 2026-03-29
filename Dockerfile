FROM nginx:1.27-alpine

COPY build /usr/share/nginx/html

EXPOSE 80
