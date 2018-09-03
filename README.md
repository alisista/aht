## Get Started

Create firebase project

and enable database, storage

Install `direnv` to set project local environment

```
$ brew install direnv
$ direnv edit .
```

Edit local environment

```
export FIREBASE_API_KEY={Your Firebase API Key}
export FIREBASE_PROJECT_ID={Your Firebase Project ID}
export FIREBASE_DATABASE_NAME={Your Firebase Database Name}
export FIREBASE_BUCKET={Your Firebase Bucket Name}
export FIREBASE_SENDER_ID={Your Firebase Sender Id}
```

Package install

```
$ nodenv install 9.11.1
$ nodenv local 9.11.1
$ brew install yarn # or `npm i -g yarn` if you use macOS, it's better to use `brew install`
$ yarn
```

## Development

```
$ yarn develop
```
