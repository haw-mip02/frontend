FROM node:latest

RUN mkdir -p /usr/src/mip02_frontend
WORKDIR /usr/src/mip02_frontend

COPY package.json /usr/src/mip02_frontend/
RUN npm install
RUN npm run build

COPY . /usr/src/mip02_frontend

EXPOSE 80
CMD [ "npm", "start" ]
