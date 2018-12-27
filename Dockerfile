# git clone https://github.com/jhthorsen/app-timekeeper
# cd app-timekeeper
# docker build --no-cache -t timekeeper .
# docker run -d --restart always --name timekeeper -p 5555:8080 timekeeper
# http://localhost:5555

FROM alpine:3.5
MAINTAINER jhthorsen@cpan.org

RUN apk add -U perl perl-io-socket-ssl \
  && apk add -t builddeps build-base curl perl-dev wget \
  && curl -L https://github.com/jhthorsen/app-timekeeper/archive/master.tar.gz | tar xvz \
  && curl -L https://cpanmin.us | perl - App::cpanminus \
  && cpanm -M https://cpan.metacpan.org --installdeps ./app-timekeeper-master \
  && apk del builddeps curl \
  && rm -rf /root/.cpanm /var/cache/apk/*

ENV MOJO_MODE production
EXPOSE 8080

ENTRYPOINT ["/app-timekeeper-master/script/timekeeper", "prefork", "-l", "http://*:8080"]
