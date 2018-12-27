# git clone https://github.com/jhthorsen/app-timekeeper
# cd app-timekeeper
# docker build --no-cache -t timekeeper .
# docker run -d --restart always --name timekeeper -p 5555:8080 timekeeper
# http://localhost:5555

FROM alpine:3.5
MAINTAINER jhthorsen@cpan.org

RUN apk add -U perl perl-io-socket-ssl \
  && apk add -t builddeps build-base curl perl-dev wget \
  && curl -L https://cpanmin.us | perl - App::cpanminus

ADD https://github.com/jhthorsen/app-timekeeper/archive/master.tar.gz /app-timekeeper.tar.gz

RUN tar xvzf /app-timekeeper.tar.gz \
  && cd /app-timekeeper-master \
  && cpanm -M https://cpan.metacpan.org https://github.com/jhthorsen/mojolicious-plugin-webpack/archive/master.tar.gz \
  && cpanm -M https://cpan.metacpan.org --installdeps .

RUN apk del builddeps && rm -rf /root/.cpanm /var/cache/apk/* /app-timekeeper.tar.gz

ENV MOJO_MODE production
EXPOSE 8080

ENTRYPOINT ["/app-timekeeper-master/timekeeper", "prefork", "-l", "http://*:8080"]
