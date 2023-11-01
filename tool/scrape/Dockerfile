FROM node:alpine
COPY . /app
COPY ../../package.json /app
WORKDIR /app
RUN npm i -g nodemon typescript 
RUN npm i
RUN tsc 
RUN apk --update add git 
RUN git clone https://github.com/tencentcloudstack/terraform-provider-tencentcloud.git
CMD node index.js