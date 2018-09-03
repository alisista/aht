## Get Started

Create firebase project

Enable following firebase service 

- Database
- Storage
- Authentication Sign-in method => twitter

Don't forget to add firebase callback url to `Callback URLs` at [Twitter App Settings](https://apps.twitter.com/app)

Add `.env.development` file and edit

```
FIREBASE_API_KEY={Your Firebase API Key}
FIREBASE_PROJECT_ID={Your Firebase Project ID}
FIREBASE_DATABASE_NAME={Your Firebase Database Name}
FIREBASE_BUCKET={Your Firebase Bucket Name}
FIREBASE_SENDER_ID={Your Firebase Sender Id}
WAVES_REDIRECT={development server host}
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
