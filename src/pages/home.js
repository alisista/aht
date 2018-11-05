import React, { Component } from 'react'
import Helmet from '../components/helmet'
import url from 'url'
import querystring from 'querystring'

import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

import Layout from '../components/layout'
import Footer from '../components/footer'
import Modal from '../components/modal'
import Loading from '../components/loading'
import Header_Home from '../components/header_home'
import Subheader from '../components/subheader'
import Waves from '../components/waves'
import Articles from '../components/articles'
import Alert from '../components/alert'
import Social_Links from '../components/social_links'
import Missions from '../components/missions'
import History from '../components/history'
import Tip_History from '../components/tip_history'
import Payment from '../components/payment'
import Profile from '../components/profile'
import Admin from '../components/admin'
import auth from '../lib/auth'
import alerts from '../lib/alerts'

moment.locale('ja')

class Home extends Component {
  constructor(props) {
    super(props)
    let redirectedUrl = props.location.href || ''
    const parsedUrl = url.parse(redirectedUrl, true)
    let redirect = null
    let error = null
    if (
      parsedUrl.query.a != undefined &&
      parsedUrl.query.s != undefined &&
      parsedUrl.query.d != undefined &&
      parsedUrl.query.p != undefined
    ) {
      redirect = props.location.origin + '/home/' + props.location.search
    }
    if (parsedUrl.query.error != undefined) {
      error = parsedUrl.query.error
    }
    this.mission = {
      id: 'join',
      aht: 100,
      tasks: [
        { id: 'task-1' },
        { id: 'task-2' },
        { id: 'task-3', social: 'twitter' },
        { id: 'task-4', social: 'discord' },
        { id: 'task-5', social: 'github' },
      ],
    }
    this.state = {
      articles: [],
      tab: 'home',
      serverInfo: {},
      userInfo: {},
      history: [],
      tip_history: [],
      admin_history: [],
      payment: [],
      error: error,
      modal: {},
      oauth: redirect,
      alerts: [],
      social_links: {},
    }
    this.alerts = new alerts(this)
  }

  componentDidMount() {
    if (this.state.error != undefined) {
      if (this.state.error * 1 === 1) {
        this.alerts.pushAlert(
          'そのDiscordアカウントは既に他の人に使われているため登録できません。',
          'warning'
        )
      }
    }
    this.auth = new auth(this, {
      redirect: true,
      oauth: this.state.oauth,
      adminPayment: true,
    })
  }
  componentDidUpdate() {
    window
      .$('.waves-receiver')
      .tooltip({ boundary: 'window', placement: 'right' })
  }

  showModal = config => {
    this.setState({ modal: config }, () => {
      window.$('#pageModal').modal({})
    })
  }

  render() {
    let site_title = 'ALISハッカー部'
    if (process.env.WAVES_NETWORK === 'TESTNET') {
      site_title = 'AHT TESTNET'
    }
    let alerts = this.state.alerts || []
    let alert_html = []
    alerts.forEach((v, i) => {
      alert_html.push(
        <div
          role="alert"
          className={`alert alert-${v.type} ml-3 mr-3`}
          style={{ width: '100%' }}
        >
          <button
            type="button"
            className="close"
            onClick={() => {
              this.alerts.dissmissAlert(i)
            }}
          />
          {v.text}
        </div>
      )
    })
    let body =
      this.state.isUser === undefined ? <Loading /> : this.render_dashboard()
    let nav_links = [
      { name: 'トークン', href: '/token/supply/' },
      { name: 'whoami', href: '/whoami/' },
      { name: 'ランキング', href: '/rankings/alis/' },
      { name: '公式マガジン', href: '/magazines/' },
    ]

    const nav_links_sub = [
      { name: 'ホーム', key: 'home', icon: 'home' },
      { name: '入部', key: 'mission', icon: 'door-open' },
      { name: 'WAVESウォレット', key: 'waves', icon: 'wallet' },
    ]
    if (
      this.state.serverInfo != undefined &&
      this.state.serverInfo.alis != undefined
    ) {
      nav_links_sub.push({ name: 'ALIS記事', key: 'alis', icon: 'bookmark' })
    }

    return (
      <Layout>
        <Helmet title={`ALIS HackerToken | ${site_title}`} desc="" />
        <Header_Home
          payment={this.state.payment}
          links={nav_links}
          auth={this.auth}
          user={this.state.user}
          serverInfo={this.state.serverInfo}
        />
        <Subheader
          items={nav_links_sub}
          location={this.props.location}
          component={this}
        />
        <div className="my-3 my-md-5">
          <div className="container">
            <Alert items={this.state.alerts} alerts={this.alerts} />
            {body}
          </div>
        </div>
        <Modal modal={this.state.modal} />
        <Footer />
      </Layout>
    )
  }
  render_dashboard() {
    let tab = this.state.tab
    if (this.state.tab === 'waves') {
      return (
        <Waves
          showModal={this.showModal}
          user={this.state.user}
          userInfo={this.state.userInfo}
          auth={this.auth}
        />
      )
    } else {
      let right_column
      if (this.state.tab === 'mission') {
        right_column = (
          <div className="col-lg-8">
            <Missions
              component={this}
              history={this.state.history}
              auth={this.auth}
              showModal={this.showModal}
              user={this.state.user}
              userInfo={this.state.userInfo}
              serverInfo={this.state.serverInfo}
              social_links={this.state.social_links}
            />
          </div>
        )
      } else if (this.state.tab === 'home') {
        right_column = (
          <div className="col-lg-8">
            <History
              component={this}
              history={this.state.history}
              auth={this.auth}
              showModal={this.showModal}
              user={this.state.user}
              userInfo={this.state.userInfo}
              serverInfo={this.state.serverInfo}
            />
            <Payment
              component={this}
              payment={this.state.payment}
              auth={this.auth}
              showModal={this.showModal}
              user={this.state.user}
              userInfo={this.state.userInfo}
              serverInfo={this.state.serverInfo}
            />
            <Tip_History
              component={this}
              tip_history={this.state.tip_history}
              auth={this.auth}
              showModal={this.showModal}
              user={this.state.user}
              userInfo={this.state.userInfo}
              serverInfo={this.state.serverInfo}
            />

            <Admin
              user={this.state.user}
              history={this.state.admin_history}
              showModal={this.showModal}
              auth={this.auth}
            />
          </div>
        )
      } else if (this.state.tab == 'alis') {
        right_column = (
          <div className="col-lg-8">
            <History
              filter={['reward']}
              component={this}
              history={this.state.history}
              auth={this.auth}
              showModal={this.showModal}
              user={this.state.user}
              userInfo={this.state.userInfo}
              serverInfo={this.state.serverInfo}
            />
            <Articles
              userInfo={this.state.userInfo}
              serverInfo={this.state.serverInfo}
              showModal={this.showModal}
              articles={this.state.articles}
              magazinArticles={this.state.magazinArticles}
              userArticles={this.state.userArticles}
              auth={this.auth}
            />
          </div>
        )
      }
      return (
        <div className="row">
          <div className="col-lg-4">
            <Profile
              user={this.state.user}
              payment={this.state.payment}
              serverInfo={this.state.serverInfo}
              userInfo={this.state.userInfo}
              payment={this.state.payment}
              showModal={this.showModal}
              auth={this.auth}
            />
            <Social_Links
              auth={this.auth}
              user={this.state.user}
              social_links={this.state.social_links}
              serverInfo={this.state.serverInfo}
              showModal={this.showModal}
              userInfo={this.state.userInfo}
            />
          </div>
          {right_column}
        </div>
      )
    }
  }
}

export default Home
