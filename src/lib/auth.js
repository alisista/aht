import firebase from 'firebase'
const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${process.env.FIREBASE_DATABASE_NAME}.firebaseio.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_BUCKET}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
}
firebase.initializeApp(config)

class Auth {
  constructor(component) {
    this.component = component
    this.provider = new firebase.auth.TwitterAuthProvider()
    firebase.auth().useDeviceLanguage()
    firebase.auth().onAuthStateChanged((user, obj) => {
      if (user) {
        let twitter_user = {
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
          id: user.providerData[0].uid,
        }
        this.component.setState({ user: twitter_user })
      } else {
        this.component.setState({ user: null })
      }
    })
  }
  login() {
    firebase
      .auth()
      .signInWithPopup(this.provider)
      .then()
      .catch(error => {
        alert('ログインに失敗しました！もう一度お試し下さい。')
      })
  }
  logout() {
    firebase
      .auth()
      .signOut()
      .then()
      .catch(error => {
        alert('ログアウトに失敗しました。もう一度お試し下さい。')
      })
  }
}

export default Auth
