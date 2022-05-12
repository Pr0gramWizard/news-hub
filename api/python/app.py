import json
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

    print(f"Parsing url: {url}")

    try:
        article_source_domain = parse_url(url)
        source_info = extract_source(article_source_domain)
        article_info = extract_article(url)
        return json.dumps({'article': article_info, 'source': source_info})
        # return json.dumps({'article': article_info})
        
    except Exception as e:
        return json.dumps({'error': str(e)}), 400



def parse_url(url):
    parsed_uri = urlparse(url)
    domain = '{uri.scheme}://{uri.netloc}/'.format(uri=parsed_uri)
    return domain

def extract_source(url):
    news_source = newspaper.build(url)
    return {
        "brand": news_source.brand,
        "description": news_source.description,
    }

def extract_article(url):
    article = Article(url)
    article.build()
    return {
        "authors": list(article.authors),
        # "html": article.html,
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
