FROM ubuntu:bionic

RUN apt-get update

RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs build-essential

COPY backend /home/backend
COPY build /home/build
RUN mkdir /home/logs
COPY startup.sh /home/startup.sh
RUN cd /home/backend && npm install --production
EXPOSE 8080