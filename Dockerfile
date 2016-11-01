FROM node:latest

RUN mkdir -p /usr/src/mip02_frontend
WORKDIR /usr/src/mip02_frontend

COPY package.json /usr/src/mip02_frontend/
RUN npm install

COPY . /usr/src/mip02_frontend

RUN npm run build


EXPOSE 80
CMD [ "npm", "start" ]
