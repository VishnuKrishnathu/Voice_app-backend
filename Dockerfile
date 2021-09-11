FROM node:latest
WORKDIR /app
COPY dist/ .
RUN npm install 
CMD ["node", "app"]
EXPOSE 5000