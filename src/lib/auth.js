import React, { Component } from 'react'
import firebase from 'firebase'
import uuidv4 from 'uuid/v4'
import url from 'url'
import _ from 'underscore'

// firestore
require('firebase/firestore')
const modals = {
  error_account_removal: {
    title: (
      <div>
        <i className="text-danger fas fa-ban" /> エラー！
      </div>
    ),
    body:
      'アカウント取り消しに失敗しました。時間を置いてもう一度お試し下さい。',
    cancel_text: '確認',
  },
}
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
      this.provider_github = new firebase.auth.GithubAuthProvider()
      firebase.auth().useDeviceLanguage()
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.setUser(user, twitter_user => {
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
  completeTask(mission_id, task_id) {
    let userInfo = this.component.state.userInfo || {}
    if (userInfo.missions == undefined) {
      userInfo.missions = {}
    }
    if (userInfo.missions[mission_id] == undefined) {
      userInfo.missions[mission_id] = { tasks: {} }
    }
    userInfo.missions[mission_id].tasks[task_id] = Date.now()
    this.setUserInfo('missions', userInfo.missions, () => {})
  }

  getUserInfo(user) {
    this.db
      .collection('users')
      .doc(user.uid)
      .get()
      .then(ss => {
        let userInfo = ss.data() || {}
        this.component.setState({ userInfo: userInfo }, () => {
          this.getServerInfo(user)
          if (this.opts.oauth != undefined) {
            this.validateWavesAddress(this.opts.oauth)
          }
        })
      })
      .catch(e => {
        console.log(e)
      })
  }
  getServerInfo(user) {
    this.db
      .collection('users_server')
      .doc(user.uid)
      .get()
      .then(ss => {
        let serverInfo = ss.data() || {}
        this.component.setState({ serverInfo: serverInfo }, () => {})
      })
      .catch(e => {
        console.log(e)
      })
  }

  setUser(user, cb) {
    let twitter_user = {
      created_at: user.metadata.creationTime,
      displayName: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid,
      id: user.providerData[0].uid,
    }
    let social_links = {}
    user.providerData.forEach(v => {
      social_links[v.providerId] = v
    })
    this.component.setState(
      { user: twitter_user, isUser: true, social_links: social_links },
      () => {
        if (cb != undefined) {
          cb(twitter_user)
        }
      }
    )
  }
  link_discord() {
    this.genRandomValue(random_value => {
      let oauth_url = `https://discordapp.com/api/oauth2/authorize?client_id=486270221825474562&redirect_uri=${encodeURIComponent(
        process.env.BACKEND_SERVER_ORIGIN
      )}%2Foauth%2Fdiscord&response_type=code&scope=guilds%20identify%20messages.read&state=${random_value}_${
        this.component.state.user.uid
      }`
      window.open(oauth_url, 'firebaseAuth', 'height=315,width=400')
      window.location.href = oauth_url
    })
  }
  link_github() {
    firebase
      .auth()
      .currentUser.linkWithPopup(this.provider_github)
      .then(result => {
        this.setUser(result.user)
      })
      .catch(error => {
        this.component.showModal({
          title: (
            <div>
              <i className="text-danger fas fa-ban" /> 認証エラー！
            </div>
          ),
          body: 'そのアカウントは既に他のユーザーに使われています。',
          cancel_text: '確認',
        })
      })
  }
  unlink_github() {
    firebase
      .auth()
      .currentUser.unlink('github.com')
      .then(result => {
        this.setUser(result)
      })
      .catch(error => {
        this.component.showModal(modals.error_account_removal)
      })
  }
  unlink_discord() {
    this.genRandomValue(random_value => {
      fetch(
        `${process.env.BACKEND_SERVER_ORIGIN}/alishackers/remove/discord/${
          this.component.state.user.uid
        }/${random_value}/`,
        {
          method: 'POST',
        }
      )
        .then(res => res.json())
        .then(json => {
          if (json.error == undefined) {
            console.log(json)
            this.getServerInfo(this.component.state.user)
          } else {
            this.component.showModal(modals.error_account_removal)
          }
        })
        .catch(() => {
          this.component.showModal(modals.error_account_removal)
        })
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
    this.setUserInfo('waves_addresses', waves_addresses, () => {
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
        this.setUserInfo('waves_addresses', waves_addresses, () => {
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
  setUserInfo(field, value, cb) {
    this.updateData({ [field]: value }, () => {
      let userInfo = this.component.state.userInfo || {}
      userInfo[field] = value
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
    this.setUserInfo('waves_addresses', waves_addresses, () => {
      this.removeAddressFromPool(address, () => {
        this.component.alerts.pushAlert(`${address} を削除しました！`)
      })
    })
  }
}

export default Auth
