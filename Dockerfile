FROM node:latest

MAINTAINER Yuta Yamate <yyamate@bio.titech.ac.jp>

COPY . /tmp/functree-cli

RUN cd /tmp/functree-cli && \
    npm install -g

RUN rm -rf /tmp/functree-cli