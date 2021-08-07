FROM ubuntu:bionic

RUN apt-get update

RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs build-essential

COPY backend /home/backend
COPY build /home/build
COPY custom /home/custom
COPY moveFiles.js /home/moveFiles.js
COPY startup.sh /home/startup.sh

RUN mkdir /home/logs
RUN cd /home/backend && npm install --production
RUN node /home/moveFiles.js

EXPOSE 8080
WORKDIR /home

ENTRYPOINT [ "sh", "/home/startup.sh" ]