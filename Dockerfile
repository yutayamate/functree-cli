FROM node:6.6.0

MAINTAINER Yuta Yamate <yyamate@bio.titech.ac.jp>

WORKDIR /root

RUN git clone http://tsubaki.bio.titech.ac.jp/yyamate/functree-cli.git && \
    cd functree-cli && \
    npm install -g