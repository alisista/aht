import React, { Component } from 'react'
import Helmet from 'react-helmet'

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
import Waves from '../components/waves'
import Alert from '../components/alert'
import Social_Links from '../components/social_links'
import Missions from '../components/missions'
import History from '../components/history'
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
      serverInfo: {},
      userInfo: {},
      history: [],
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
    this.auth = new auth(this, { redirect: true, oauth: this.state.oauth })
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
    let nav_links = [{ name: 'ランキング', href: '/rankings/alis/' }]

    return (
      <Layout>
        <Helmet
          link={[
            {
              rel: 'stylesheet',
              type: 'text/css',
              href: '/tabler/css/tabler.min.css',
            },
            {
              rel: 'stylesheet',
              type: 'text/css',
              href: '/css/common.css',
            },
          ]}
        />
        <Header_Home
          links={nav_links}
          auth={this.auth}
          user={this.state.user}
          serverInfo={this.state.serverInfo}
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
    return [
      <Waves
        showModal={this.showModal}
        user={this.state.user}
        userInfo={this.state.userInfo}
        auth={this.auth}
      />,
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
          <Admin
            user={this.state.user}
            history={this.state.admin_history}
            showModal={this.showModal}
            auth={this.auth}
          />
        </div>
      </div>,
    ]
  }
}

export default Home
