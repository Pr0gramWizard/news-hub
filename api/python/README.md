# NewsHub Python API

This is the Python API of the NewsHub application.
It contains a simple flask web server and one python package.
The packages used to crawl the news is called [Newspaper3k](https://newspaper.readthedocs.io/en/latest/).

## Prerequisites

1. Create dotenv file with the following content:

```
APP_PORT=4000
```

## Installation (Docker)

1. Done. Go [back](/README.md) to the root of the project and follow the instructions.

## Installation (local)

1. Create a new virtual environment and activate it.

```bash
$ virtualenv venv
$ source venv/bin/activate
```

2. Install the dependencies.

```bash
$ pip install -r requirements.txt
```

3. Install additional dependencies for the python package.

```bash
$ curl https://raw.githubusercontent.com/codelucas/newspaper/master download_corpora.py | python3
```

4. Run the server.

```bash
$ python app.py
```
