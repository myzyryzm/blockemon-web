FROM ubuntu:bionic

RUN apt-get update

RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs build-essential

COPY backend /home/backend
COPY build /home/build
# ADD webGL /home/build/static
COPY credentials /home/credentials
COPY moveFiles.js /home/moveFiles.js
COPY startup.sh /home/startup.sh

RUN mkdir /home/logs
RUN cd /home/backend && npm install --production
RUN node /home/moveFiles.js

EXPOSE 8080
WORKDIR /home

ENTRYPOINT [ "sh", "/home/startup.sh" ]