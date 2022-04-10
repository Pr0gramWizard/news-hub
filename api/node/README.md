# News Hub
<hr>

## Introduction
<hr>

This repository is part of the code for my master thesis "Development of a framework to access, collect, and study news shared on social media".
It contains the code for the News Hub, which is a backend that collects and stores tweets a user has seen while using the [browser extension]("https://google.com").


## Getting started
<hr>

As the application runs inside a docker container you will need the following dependencies:

* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/install/)
* [Node.js with version > 14.x](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)

## Configuration
<hr>

To run the application you need to provide a dotenv file (see [.env.example](.env.example)) with the following variables:

* Database related credentials and configuration
* Twitter API credentials
* JWT configuration

Copy the [.env.example](.env.example) to a file named `.env` inside the root directory of the repository and edit the variables to your needs

## Installation

1. Clone the repository
```
$ git clone https://github.com/Pr0gramWizard/news-hub.git
```
2. Run the following command in the root directory of the repository:
```
$ yarn install
```
4. Once that is done you can start the application by running the following command:
```
$ yarn run docker
``` 