import React, { Component } from 'react'
import firebase from 'firebase'
import uuidv4 from 'uuid/v4'
import url from 'url'
import _ from 'underscore'
let prefix = process.env.FIREBASE_PROJECT_NAME

// firestore
require('firebase/firestore')
const modals = {
  error_exists: {
    title: (
      <div>
        <i className="text-danger fas fa-ban" /> 認証エラー！
      </div>
    ),
    body: 'そのアカウントは既に他のユーザーに使われています。',
    cancel_text: '確認',
  },
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
  error_general: {
    title: (
      <div>
        <i className="text-danger fas fa-ban" /> エラーが発生しました！
      </div>
    ),
    body: '時間を置いてからもう一度申請して下さい。',
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
console.log(config)
class Auth {
  constructor(component, opts = {}) {
    this.opts = opts
    this.component = component
    if (typeof window !== 'undefined') {
      const WavesAPI = require('@waves/waves-api')
      let network = WavesAPI.MAINNET_CONFIG
      if (process.env.WAVES_NETWORK === 'TESTNET') {
        network = WavesAPI.TESTNET_CONFIG
      }
      this.Waves = WavesAPI.create(network)
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
  searchTweeple(user_id, cb, err) {
    this.db
      .collection('tweeple')
      .doc(user_id)
      .get()
      .then(ss => {
        cb(ss)
      })
      .catch(e => {
        err(e)
      })
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
  confirmMission(mission_id) {
    let userInfo = this.component.state.userInfo || {}
    if (userInfo.missions == undefined) {
      userInfo.missions = {}
    }
    if (userInfo.missions[mission_id] == undefined) {
      userInfo.missions[mission_id] = { tasks: {} }
    }
    if (userInfo.missions[mission_id].confirmed == undefined) {
      userInfo.missions[mission_id].confirmed = Date.now()
    }
    let tasks = []
    let isError = false
    for (let v of this.component.mission.tasks) {
      if (v.social != undefined) {
        if (
          (this.component.state.social_links || {})[`${v.social}.com`] !=
          undefined
        ) {
          tasks.push({
            task_id: v.id,
            social: v.social,
            id: this.component.state.social_links[`${v.social}.com`].uid,
          })
        } else if (
          (this.component.state.serverInfo || {})[v.social] != undefined
        ) {
          tasks.push({
            task_id: v.id,
            social: v.social,
            id: this.component.state.serverInfo[v.social].id,
          })
        } else {
          isError = true
        }
      } else {
        tasks.push(false)
      }
    }
    if (isError == true) {
      this.component.showModal({
        title: (
          <div>
            <i className="text-danger fas fa-ban" /> 認証エラー！
          </div>
        ),
        body: 'エラーが発生しました！時間を置いてもう一度お試し下さい。',
        cancel_text: '確認',
      })
      return
    }
    let mission_confirmed = {
      uid: this.component.state.user.uid,
      mission_id: 'join',
      date: Date.now(),
      tasks: tasks,
      confirmed: false,
    }
    let confirmation_id = `join_${mission_confirmed.uid}`
    this.db
      .collection('mission_pool')
      .doc(confirmation_id)
      .set(mission_confirmed)
      .then(ss => {
        this.setUserInfo('missions', userInfo.missions, () => {
          this.component.showModal({
            title: (
              <div>
                <i className="text-success fas fa-check" /> ミッション確定！
              </div>
            ),
            body:
              'ミッションを確定しました。２４時間以内に認証されます。しばらくお待ち下さい。',
            cancel_text: '確認',
          })
        })
      })
      .catch(e => {
        console.log(e)
        this.component.showModal({
          title: (
            <div>
              <i className="text-danger fas fa-ban" /> 認証エラー！
            </div>
          ),
          body: 'エラーが発生しました！時間を置いてもう一度お試し下さい。',
          cancel_text: '確認',
        })
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
          this.getUserTip(user)
          if (this.opts.magazine !== true) {
            this.getUserHistory(user)
            this.getUserPayment(user)
            this.getUserArticles(user)
          }
          if (this.opts.oauth != undefined) {
            this.validateWavesAddress(this.opts.oauth)
          }
          if (
            this.component.state.user.id === process.env.ADMIN_TWITTER_ID &&
            this.opts.adminPayment === true
          ) {
            this.getAdminPayment()
          }
          if (
            this.component.state.user.id === process.env.ADMIN_TWITTER_ID &&
            this.opts.adminReport === true
          ) {
            this.getAdminReport()
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
  getUserHistory(user) {
    this.db
      .collection('users')
      .doc(user.uid)
      .collection('history')
      .get()
      .then(ss => {
        let history = []
        ss.forEach(doc => {
          history.push(doc.data())
        })
        history = _(history).sortBy(v => {
          return v.date * -1
        })
        this.component.setState({ history: history }, () => {})
      })
      .catch(e => {
        console.log(e)
      })
  }
  getUserTip(user) {
    this.db
      .collection('users')
      .doc(user.uid)
      .collection('tip')
      .get()
      .then(ss => {
        let tip = []
        ss.forEach(doc => {
          tip.push(doc.data())
        })
        tip = _(tip).sortBy(v => {
          return v.date * -1
        })
        this.component.setState({ tip_history: tip }, () => {})
      })
      .catch(e => {
        console.log(e)
      })
  }

  listArticles() {
    let uid = this.component.state.user.uid
    window.$.get(
      `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/list/articles/${uid}/${
        this.component.state.serverInfo.alis.user_id
      }`,
      json => {
        if (json.error != null) {
          this.component.showModal(modals.error_general)
        } else {
          this.component.setState({ magazinArticles: json.articles }, () => {
            console.log('lets go fuckin get..' + uid)
            this.getUserMagazineArticles()
          })
        }
      }
    )
  }
  getUserMagazineArticles() {
    this.db
      .collection('users_server')
      .doc(this.component.state.user.uid)
      .collection('magazine_articles')
      .get()
      .then(ss => {
        let articles = {}
        ss.forEach(doc => {
          console.log(doc.data())
          articles[doc.id] = doc.data()
        })
        this.component.setState({ userArticles: articles }, () => {})
      })
      .catch(e => {
        console.log(e)
      })
  }
  publishArticle(article) {
    this.genRandomValue(random_value => {
      window.$.post(
        `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/upload/article/`,
        {
          random_value: random_value,
          article: JSON.stringify(article),
          uid: this.component.state.user.uid,
          mid: 'admin',
        },
        json => {
          console.log(json)
          if (json.error != null) {
            this.component.showModal(modals.error_general)
          } else {
            this.component.showModal({
              title: (
                <div>
                  <i className="text-green fas fa-check" /> 投稿しました！
                </div>
              ),
              body: `${article.title}をハッカーマガジンに投稿しました！`,
              cancel_text: '確認',
            })
            this.getUserMagazineArticles()
          }
        }
      )
    })
  }
  unpublishArticle(article) {
    this.genRandomValue(random_value => {
      window.$.post(
        `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/unpublish/article/`,
        {
          random_value: random_value,
          article: JSON.stringify(article),
          uid: this.component.state.user.uid,
          mid: 'admin',
        },
        json => {
          if (json.error != null) {
            this.component.showModal(modals.error_general)
          } else {
            console.log(json)
            this.component.showModal({
              title: (
                <div>
                  <i className="text-green fas fa-check" />{' '}
                  投稿を取り下げしました！
                </div>
              ),
              body: `${article.title}をハッカーマガジンから取り下げました！`,
              cancel_text: '確認',
            })
            this.getUserMagazineArticles()
          }
        }
      )
    })
  }
  tip(amount, article) {
    this.genRandomValue(random_value => {
      window.$.post(
        `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/tip/`,
        {
          random_value: random_value,
          article: JSON.stringify(article),
          uid: this.component.state.user.uid,
          amount: amount,
        },
        json => {
          if (json.error != null) {
            this.component.showModal(modals.error_general)
          } else {
            this.component.showModal({
              title: (
                <div>
                  <i className="text-green fas fa-check" /> 投げ銭完了！
                </div>
              ),
              body: (
                <div>
                  『{article.title}
                  』に <b className="text-primary">{amount}</b>
                  AHT投げ銭しました！
                </div>
              ),
              cancel_text: '確認',
            })
            this.getServerInfo(this.component.state.user)
            this.getUserTip(this.component.state.user)
          }
        }
      )
    })
  }
  getUserArticles(user) {
    this.db
      .collection('users')
      .doc(user.uid)
      .collection('articles')
      .get()
      .then(ss => {
        let articles = []
        ss.forEach(doc => {
          articles.push(doc.data())
        })
        articles = _(articles).sortBy(v => {
          return v.published_at * -1
        })
        this.component.setState({ articles: articles }, () => {})
      })
      .catch(e => {
        console.log(e)
      })
  }

  getAdminPayment() {
    this.db
      .collection('history')
      .where('payment_from', '==', 'admin')
      .get()
      .then(ss => {
        let history = []
        ss.forEach(doc => {
          history.push(doc.data())
        })
        history = _(history).sortBy(v => {
          return v.date * -1
        })
        this.component.setState({ admin_history: history }, () => {})
      })
      .catch(e => {
        console.log(e)
      })
  }
  getAdminReport() {
    this.db
      .collection('report')
      .get()
      .then(ss => {
        let reports = {}
        ss.forEach(doc => {
          let report = doc.data()
          reports[report.alis] = report.twitter
        })
        this.component.setState({ reports: reports }, () => {})
      })
      .catch(e => {
        console.log(e)
      })
  }

  getUserPayment(user) {
    this.db
      .collection('users')
      .doc(user.uid)
      .collection('payment')
      .get()
      .then(ss => {
        let payment = []
        ss.forEach(doc => {
          payment.push(doc.data())
        })
        payment = _(payment).sortBy(v => {
          return v.date * -1
        })
        this.component.setState({ payment: payment }, () => {})
      })
      .catch(e => {
        console.log(e)
      })
  }
  authenticateAlisUser(token) {
    this.genRandomValue(random_value => {
      window.$.post(
        `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/auth/alis/`,
        {
          random_value: random_value,
          token: token,
          uid: this.component.state.user.uid,
        },
        json => {
          if (json.error != null) {
            if (json.error === 4) {
              this.component.showModal(modals.error_exists)
            } else {
              this.component.showModal(modals.error_general)
            }
          } else {
            this.getUserInfo(this.component.state.user)
          }
        }
      )
    })
  }
  retry() {
    let missions = this.component.state.userInfo.missions
    let revoke = missions.join.revoke
    for (let k in missions.join.tasks) {
      if (revoke.includes('task-' + k)) {
        delete missions.join.tasks[k]
      }
    }
    delete missions.join.revoke
    this.setUserInfo('missions', missions, () => {
      this.component.alerts.pushAlert(
        `重複アカウントによるタスクを取り消しました。別アカウントで再トライして下さい！`,
        `success`
      )
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
  makePayment(to, amount, what_for, type) {
    this.genRandomValue(random_value => {
      window.$.post(
        `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/payment/`,
        {
          type: type,
          random_value: random_value,
          uid: this.component.state.user.uid,
          twitter_id: this.component.state.user.id,
          amount: amount,
          to: to.uid,
          what_for: what_for,
          photoURL: to.photoURL,
          displayName: to.displayName,
        },
        json => {
          if (json.error != null) {
            console.log(json)
            this.component.showModal(modals.error_general)
          } else {
            this.getUserInfo(this.component.state.user)
            this.component.showModal({
              title: (
                <div>
                  <i className="text-green fas fa-check" />{' '}
                  支払いが完了しました！
                </div>
              ),
              body: `${
                to.displayName
              }さんにハッカー部から${amount}AHTの支払いをしました！`,
              cancel_text: '確認',
            })
          }
        }
      )
    })
  }
  link_discord() {
    this.genRandomValue(random_value => {
      let oauth_url = `https://discordapp.com/api/oauth2/authorize?client_id=486270221825474562&redirect_uri=${encodeURIComponent(
        process.env.BACKEND_SERVER_ORIGIN
      )}%2F${prefix}%2Foauth%2Fdiscord&response_type=code&scope=guilds%20identify%20messages.read&state=${random_value}_${
        this.component.state.user.uid
      }`
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
        console.log(error)
        this.component.showModal(modals.error_exists)
      })
  }
  registerPayment(amount, address) {
    let uid = this.component.state.user.uid
    let payment = this.component.state.payment
    let date = Date.now()
    let transaction = {
      amount: amount,
      address: address,
      date: date,
      status: 'requested',
    }
    let transaction_pool = {
      uid: uid,
      amount: amount,
      address: address,
      date: date,
      status: 'requested',
    }
    payment.unshift(transaction)
    this.db
      .collection('users')
      .doc(uid)
      .collection('payment')
      .doc(`${date}_${amount}`)
      .set(transaction)
      .then(() => {
        this.component.setState({ payment: payment })
      })
    this.db
      .collection('payment_pool')
      .doc(uid + '_' + date)
      .set(transaction_pool)
      .then(() => {
        this.component.showModal({
          title: (
            <div>
              <i className="text-warning fas fa-exclamation-triangle" />{' '}
              支払い手続き開始！
            </div>
          ),
          body: (
            <p>
              トークンの送信リストに登録しました。数分～数十分以内に指定のアドレスにトークンが送信されます。手続きの進行状況は支払い履歴から確認できます。
            </p>
          ),
          cancel_text: '確認',
        })
      })
  }
  getAllCandidates() {
    this.db
      .collection('twitter_candidates')
      .get()
      .then(res => {
        let candidates = []
        res.forEach(ss => {
          let obj = ss.data()
          candidates.push({ alis: ss.id, candidates: obj })
        })
        this.component.setState({ allCandidates: candidates })
      })
  }
  chooseCandidate(alis, screen_name, search_component) {
    let candidates
    let allCandidates = search_component.state.allCandidates
    for (let v of allCandidates) {
      if (v.alis == alis) {
        for (let k in v.candidates || {}) {
          if (k.toLowerCase() == screen_name.toLowerCase()) {
            v.candidates[k].checked = true
          } else {
            delete v.candidates[k].checked
          }
        }
        candidates = v.candidates
        break
      }
    }

    this.db
      .collection('twitter_candidates')
      .doc(alis)
      .set(candidates)
      .then(() => {
        search_component.setState({ allCandidates: allCandidates })
      })
  }
  existsTweeple(screen_name, cb) {
    this.db
      .collection('tweeple')
      .where('screen_name_lower', '==', screen_name.toLowerCase())
      .limit(1)
      .get()
      .then(ss => {
        let exists = false
        ss.forEach(() => {
          exists = true
        })
        cb(exists)
      })
      .catch(e => {
        cb(false)
      })
  }
  addCandidate(screen_name, alis_user, search_component) {
    let candidates = search_component.state.candidates || []
    this.db
      .collection('twitter_candidates')
      .doc(alis_user.user_id)
      .set(
        {
          [`$profile`]: alis_user,
          [`${screen_name}`]: {
            date: Date.now(),
            uid: this.component.state.user.uid,
          },
        },
        { merge: true }
      )
      .then(() => {
        candidates.push(screen_name)
        search_component.setState({ candidates: candidates })
        this.component.alerts.pushAlert(
          `登録しました！確認後リストに追加されますのでしばしお待ち下さい。`,
          'success'
        )
      })
      .catch(error => {
        this.component.showModal(modals.error_general)
      })
  }
  getCandidates(alis_user, search_component) {
    this.db
      .collection('twitter_candidates')
      .doc(alis_user)
      .get()
      .then(ss => {
        let accounts = []
        if (ss.exists) {
          let candidates = ss.data()
          for (let k in candidates) {
            if (k !== '$profile') {
              accounts.push(k)
            }
          }
          search_component.setState({ candidates: accounts })
        }
      })
  }
  reportError(user) {
    const doc_id = `${this.component.state.user.uid}_${Date.now()}`
    this.db
      .collection('report')
      .doc(doc_id)
      .set({ twitter: user.id_str, alis: user.user_id })
      .then(() => {
        let reports = this.component.state.reports || {}
        reports[user.user_id] = user.id_str
        this.component.setState({ reports: reports })
      })
      .catch(error => {
        this.component.showModal(modals.error_general)
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
        `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/remove/discord/${
          this.component.state.user.uid
        }/${random_value}/`,
        {
          method: 'POST',
        }
      )
        .then(res => res.json())
        .then(json => {
          if (json.error == undefined) {
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
  unlink_alis() {
    this.genRandomValue(random_value => {
      fetch(
        `${process.env.BACKEND_SERVER_ORIGIN}/${prefix}/remove/alis/${
          this.component.state.user.uid
        }/${random_value}/`,
        {
          method: 'POST',
        }
      )
        .then(res => res.json())
        .then(json => {
          if (json.error == undefined) {
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
    /* WAVES is not returning d parameter at the moment */
    const signedData = parsedUrl.query.d
    console.log(signedData)
    /* 
       todo: need to verify signature, but the current code on the demo page is not working!!
       https://demo.wavesplatform.com/
    */
    const signature = parsedUrl.query.s
    const publicKey = parsedUrl.query.p
    const address = parsedUrl.query.a
    let random_value, uid
    if (parsedUrl.query.d != undefined) {
      ;[random_value, uid] = signedData.split('_')
    }
    console.log(address)
    console.log(this.Waves.crypto.isValidAddress(address))
    if (
      (signedData != undefined && uid != this.component.state.user.uid) ||
      (signedData != undefined &&
        random_value != this.component.state.userInfo.random_value) ||
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
