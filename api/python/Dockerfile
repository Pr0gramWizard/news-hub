FROM python:3.10-alpine

ADD . /app

WORKDIR /app

RUN apk add --update --no-cache g++ gcc libxslt-dev

RUN apk add build-base python3-dev py-pip jpeg-dev zlib-dev
ENV LIBRARY_PATH=/lib:/usr/lib

RUN pip install -r requirements.txt

RUN curl https://raw.githubusercontent.com/codelucas/newspaper/master/download_corpora.py | python3

EXPOSE 4000

CMD ["python", "app.py"]
