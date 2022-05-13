import json
import logging
import os
import sys
from urllib.parse import urlparse

import newspaper
import nltk
from dotenv import find_dotenv, load_dotenv
from flask import Flask, request
from newspaper import Article

nltk.download('punkt')

load_dotenv(find_dotenv())

app = Flask(__name__)


@app.route('/parse', methods=['POST'])
def parse_tweet():
    data = request.get_json()
    if data is None:
        return json.dumps({'error': 'No data provided'}), 400
    if 'url' not in data:
        return json.dumps({'error': 'No url provided'}), 400

    url = data['url']

    logging.info(f"Parsing url: {url}")

    try:
        article_info = extract_article(url)
        return json.dumps(article_info)
    except Exception as e:
        return json.dumps({'error': str(e)}), 400


def extract_article(url):
    article = Article(url)
    article.build()
    return {
        "authors": list(article.authors),
        "html": article.html,
        "images": list(article.images),
        "keywords": list(article.keywords),
        "meta_data": article.meta_data,
        "publish_date": article.publish_date,
        "summary": article.summary,
        "tags": list(article.tags),
        "text": article.text,
        "title": article.title,
        "top_image": article.top_image,
        "videos": list(article.movies),
    }

if __name__ == "__main__":
    app_port = os.environ.get('APP_PORT')

    app.run(host='0.0.0.0',debug=True, port=app_port)
