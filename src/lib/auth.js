import firebase from 'firebase'
import uuidv4 from 'uuid/v4'
import url from 'url'
import _ from 'underscore'

// firestore
require('firebase/firestore')
const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${process.env.FIREBASE_DATABASE_NAME}.firebaseio.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_BUCKET}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  timestampsInSnapshots: true,
}
firebase.initializeApp(config)

class Auth {
  constructor(component, opts = {}) {
    this.opts = opts
    this.component = component
    if (typeof window !== 'undefined') {
      const WavesAPI = require('@waves/waves-api')
      this.Waves = WavesAPI.create(WavesAPI.MAINNET_CONFIG)
      this.db = firebase.firestore()
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
          this.component.setState({ user: twitter_user, isUser: true }, () => {
            this.getUserInfo(twitter_user)
          })
        } else {
          if (this.opts.redirect === true) {
            window.location.href = '/'
          } else {
            this.component.setState({ user: null, isUser: false })
          }
        }
      })
    }
  }

  // users
  setData(value, cb, err) {
    if (err == undefined) {
      err = e => {
        console.log(e)
        this.component.alerts.pushAlert(
          `エラーが発生しました。時間をおいてもう一度お試し下さい！`
        )
      }
    }
    this.db
      .collection('users')
      .doc(this.component.state.user.uid)
      .set(value, { merge: true })
      .then(ss => {
        cb()
      })
      .catch(e => {
        err(e)
      })
  }
  updateData(value, cb, err) {
    if (err == undefined) {
      err = e => {
        console.log(e)
        if (e.toString().match(/no document to update/i) !== null) {
          this.setData(value, cb, err)
        } else {
          this.component.alerts.pushAlert(
            `エラーが発生しました。時間をおいてもう一度お試し下さい！`
          )
        }
      }
    }

    this.db
      .collection('users')
      .doc(this.component.state.user.uid)
      .update(value)
      .then(ss => {
        cb()
      })
      .catch(e => {
        err(e)
      })
  }

  getUserInfo(user) {
    this.db
      .collection('users')
      .doc(user.uid)
      .get()
      .then(ss => {
        let userInfo = ss.data() || {}
        this.component.setState({ userInfo: userInfo }, () => {
          if (this.opts.oauth != undefined) {
            this.validateWavesAddress(this.opts.oauth)
          }
        })
      })
      .catch(e => {
        console.log(e)
      })
  }

  login() {
    firebase
      .auth()
      .signInWithPopup(this.provider)
      .then(() => {
        window.location.href = '/home/'
      })
      .catch(error => {
        alert('ログインに失敗しました！もう一度お試し下さい。')
      })
  }
  logout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        window.location.href = '/'
      })
      .catch(error => {
        alert('ログアウトに失敗しました。もう一度お試し下さい。')
      })
  }

  // waves
  validateWavesAddress(popup_url) {
    const redirectedUrl = popup_url
    const parsedUrl = url.parse(redirectedUrl, true)
    const signedData = parsedUrl.query.d

    /* 
       todo: need to verify signature, but the current code on the demo page is not working!!
       https://demo.wavesplatform.com/
    */
    const signature = parsedUrl.query.s
    const publicKey = parsedUrl.query.p
    const address = parsedUrl.query.a
    const [random_value, uid] = signedData.split('_')
    if (
      uid != this.component.state.user.uid ||
      random_value != this.component.state.userInfo.random_value ||
      this.Waves.crypto.isValidAddress(address) == false
    ) {
      this.component.alerts.pushAlert(
        `認証に失敗しました。時間を置いて再度お試し下さい。`
      )
    } else {
      this.addWavesAddress({
        publickKey: publicKey,
        address: address,
        added_at: Date.now(),
      })
    }
  }
  setAsReceiver(address) {
    let waves_addresses = this.component.state.userInfo.waves_addresses || {}
    for (let k in waves_addresses) {
      if (k == address) {
        waves_addresses[k].receiver = true
      } else {
        delete waves_addresses[k].receiver
      }
    }
    this.setWavesAddress(waves_addresses, () => {
      this.component.alerts.pushAlert(
        `受け取りアドレスを${address} に変更しました！`,
        `success`
      )
    })
  }
  checkAddressInPool(address, cb) {
    this.db
      .collection('addresses')
      .doc(address)
      .get()
      .then(ss => {
        if (ss.exists) {
          this.component.alerts.pushAlert(
            `${address}は既に他の人に登録されているため使えません。`
          )
        } else {
          cb()
        }
      })
      .catch(e => {
        console.log(e)
        this.component.alerts.pushAlert(
          `エラーが発生しました。時間をおいてもう一度お試し下さい！`
        )
      })
  }
  addWavesAddress(address) {
    let waves_addresses = this.component.state.userInfo.waves_addresses || {}
    if (waves_addresses[address.address] != undefined) {
      this.component.alerts.pushAlert(
        `${address.address} は既に登録されています！`,
        `warning`
      )
    } else {
      this.checkAddressInPool(address.address, () => {
        if (_.isEmpty(waves_addresses)) {
          address.receiver = true
        }
        waves_addresses[address.address] = address
        this.setWavesAddress(waves_addresses, () => {
          this.addAddressToPool(address.address, () => {
            this.component.alerts.pushAlert(
              `${address.address} を追加しました！`,
              `success`
            )
          })
        })
      })
    }
  }
  setWavesAddress(waves_addresses, cb) {
    this.updateData({ waves_addresses: waves_addresses }, () => {
      let userInfo = this.component.state.userInfo || {}
      userInfo.waves_addresses = waves_addresses
      this.component.setState({ userInfo: userInfo }, () => {})
      cb()
    })
  }
  removeAddressFromPool(address, cb) {
    this.db
      .collection('addresses')
      .doc(address)
      .delete()
      .then(ss => {
        cb()
      })
      .catch(e => {
        cb()
      })
  }
  addAddressToPool(address, cb) {
    this.db
      .collection('addresses')
      .doc(address)
      .set({ uid: this.component.state.user.uid })
      .then(ss => {
        cb()
      })
      .catch(e => {
        cb()
      })
  }
  genRandomValue(cb) {
    let uuid = uuidv4()
    this.setData({ random_value: uuid }, () => {
      let userInfo = this.component.state.userInfo || {}
      userInfo.random_value = uuid
      this.component.setState({ userInfo: userInfo }, () => {
        cb(uuid)
      })
    })
  }
  removeWavesAddress(address) {
    let waves_addresses = this.component.state.userInfo.waves_addresses || {}
    delete waves_addresses[address]
    this.setWavesAddress(waves_addresses, () => {
      this.removeAddressFromPool(address, () => {
        this.component.alerts.pushAlert(`${address} を削除しました！`)
      })
    })
  }
}

export default Auth
