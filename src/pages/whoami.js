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
import Alert from '../components/alert'
import Search_User from '../components/search_user'
import Admin from '../components/admin'
import auth from '../lib/auth'
import alerts from '../lib/alerts'
import fa_alis from '../assets/images/alis.png'

moment.locale('ja')

class Who extends Component {
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
      reports: {},
      tab: 'confirmed',
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
    this.auth = new auth(this, { adminReport: true })
    this.getMap(() => {
      this.getConfirmedTweeple(1)
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
  getConfirmedTweeple(page) {
    let map_url = `https://dl.dropboxusercontent.com/s/${
      this.state.map[page]
    }/${page}.json`
    window.$.getJSON(map_url, json => {
      this.setState({ tweeple: json, page: page }, () => {
        window.$(window).scrollTop(0)
      })
    })
  }
  getMap(cb) {
    if (this.state.map != undefined) {
      cb()
    } else {
      let map_url = `https://dl.dropboxusercontent.com/s/${
        process.env.MAP_ID_ALIS_TWEEPLE
      }/alis_tweeple.json`
      window.$.getJSON(map_url, json => {
        this.setState({ map: json }, () => {
          cb()
        })
      })
    }
  }
  changeTab(tab) {
    this.setState({ page: 1, tab: tab }, () => {
      if (tab === 'confirmed') {
        this.getMap(() => {
          this.getConfirmedTweeple(1)
        })
      } else if (tab === 'candidates') {
        this.auth.getAllCandidates(() => {})
      }
    })
  }
  render() {
    let site_title = 'ALISハッカー部'
    if (process.env.WAVES_NETWORK === 'TESTNET') {
      site_title = 'AHT TESTNET'
    }

    let topics = [
      { key: 'confirmed', name: 'リスト', icon: 'twitter', fa_type: 'fab' },
      { key: 'search', name: '検索', icon: 'search' },
    ]
    if (
      this.state.user != undefined &&
      this.state.user.id == process.env.ADMIN_TWITTER_ID
    ) {
      topics.push({ key: `candidates`, name: `候補`, icon: `cog` })
    }
    let topics_html = []
    for (let v of topics) {
      let active = ''
      if (this.state.tab == v.key) {
        active = 'active'
      }
      let topic_icon
      if (v.icon != undefined) {
        topic_icon = <i className={`${v.fa_type || 'fa'} fa-${v.icon}`} />
      }
      topics_html.push(
        <li className="nav-item">
          <a
            onClick={() => {
              this.changeTab(v.key)
            }}
            className={`nav-link ${active}`}
          >
            {topic_icon} {v.name}
          </a>
        </li>
      )
    }
    let body = this[`render_${this.state.tab}`]()
    let nav_links = [
      { name: 'ホーム', href: '/home/' },
      { name: 'トークン', href: '/token/supply/' },
      { name: 'ランキング', href: '/rankings/alis/' },
      { name: '公式マガジン', href: '/magazines/' },
    ]

    return (
      <Layout>
        <Helmet title={`ALIS HackerToken || ${site_title}`} desc="" />
        <Header_Home
          links={nav_links}
          auth={this.auth}
          user={this.state.user}
          serverInfo={this.state.serverInfo}
        />
        <div className="header collapse d-lg-flex p-0" id="headerMenuCollapse">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg order-lg-first">
                <ul className="nav nav-tabs border-0 flex-column flex-lg-row">
                  {topics_html}
                </ul>
              </div>
            </div>
          </div>
        </div>

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
  render_search() {
    return (
      <div className="row">
        <Search_User
          showModal={this.showModal}
          auth={this.auth}
          user={this.state.user}
        />
      </div>
    )
  }
  reportError(user) {
    this.auth.reportError(user)
  }
  render_confirmed() {
    let tweeple = this.state.tweeple || []
    let tweeple_html = []
    let rank = (this.state.page - 1) * 100
    let revoke_th

    if (
      this.state.user != undefined &&
      this.state.user.id == process.env.ADMIN_TWITTER_ID
    ) {
      revoke_th = <th />
    }
    for (let v of tweeple) {
      let revoke_btn

      if (
        this.state.user != undefined &&
        this.state.user.id == process.env.ADMIN_TWITTER_ID
      ) {
        if (this.state.reports[v.user_id] != undefined) {
          revoke_btn = <td />
        } else {
          revoke_btn = (
            <td>
              <a
                className="icon"
                onClick={() => {
                  this.reportError(v)
                }}
              >
                <i className="fe fe-trash text-danger" />
              </a>
            </td>
          )
        }
      }
      let tr_style = {}
      if (this.state.reports[v.user_id] != undefined) {
        tr_style = { backgroundColor: '#f8d7da' }
      }
      rank += 1
      tweeple_html.push(
        <tr style={tr_style}>
          <td className="text-center w-1 d-none d-md-table-cell">
            <span className="text-center avatar avatar-blue">{rank}</span>
          </td>
          <td className="d-none d-md-table-cell">
            <div>
              <a
                className="text-dark font-weight-bold"
                href={`https://alis.to/users/${v.user_id}`}
                target="_blank"
              >
                {v.user_id}
              </a>
            </div>
          </td>
          <td className="d-none d-lg-table-cell">
            <div className="text-muted">
              <i className="fa fa-angle-double-right" />
            </div>
          </td>
          <td className="w-1">
            <a
              href={`https://twitter.com/${v.screen_name}`}
              target="_blank"
              className="text-muted"
            >
              <span
                className="avatar"
                style={{ backgroundImage: `url(${v.profile_image_url})` }}
              />
            </a>
            <div className="text-orange d-inline-block d-md-none mt-2">
              <span className="badge badge-success" style={{ width: '32px' }}>
                {rank}
              </span>
            </div>
          </td>

          <td>
            <div className="text-default">
              <a
                href={`https://twitter.com/${v.screen_name}`}
                target="_blank"
                className="text-dark"
              >
                {v.name}
              </a>
            </div>
            <div className="d-none d-md-block small text-muted">
              <a
                href={`https://twitter.com/${v.screen_name}`}
                target="_blank"
                className="text-muted"
              >
                {v.screen_name}
              </a>
            </div>

            <div className="d-block d-md-none small text-muted">
              {v.followers_count} フォロワー
            </div>
            <div className="d-block d-md-none small text-muted mt-1">
              <span>
                <img
                  className="mr-1"
                  src={fa_alis}
                  style={{
                    verticalAlign: 'middle',
                    height: '14px',
                    width: '14px',
                    border: 'none',
                  }}
                />
                <a
                  className="text-muted"
                  href={`https://alis.to/users/${v.user_id}`}
                  target="_blank"
                >
                  {v.user_id}
                </a>
              </span>
              <i className="ml-3 text-muted fa fa-angle-double-right" />
              <span className="ml-3">
                <i className="fab fa-twitter mr-1 text-blue" />
                <a
                  href={`https://twitter.com/${v.screen_name}`}
                  target="_blank"
                  className="text-muted"
                >
                  {v.screen_name}
                </a>
              </span>
            </div>
          </td>
          <td className="d-none d-md-table-cell">
            <div className="text-default">{v.statuses_count}</div>
            <div className="small text-muted">ツイート</div>
          </td>
          <td className="d-none d-md-table-cell">
            <div className="text-default">{v.friends_count}</div>
            <div className="small text-muted">フォロー</div>
          </td>

          <td className="d-none d-md-table-cell">
            <div className="text-blue">
              <b>{v.followers_count}</b>
            </div>
            <div className="small text-muted">フォロワー</div>
          </td>
          {revoke_btn}
        </tr>
      )
    }
    let pages = []
    for (let k in this.state.map || {}) {
      let active = ''
      if (k * 1 == this.state.page) {
        active = 'active'
      }
      pages.push(
        <li className={`page-item ${active}`}>
          <a
            className="page-link"
            onClick={() => {
              this.getConfirmedTweeple(k * 1)
            }}
          >
            {k}
          </a>
        </li>
      )
    }
    let pages_html = (
      <div className="pt-2" style={{ width: '100%', textAlign: 'center' }}>
        <nav className="d-inline-block">
          <ul className="pagination">
            <li className="page-item">
              <a className="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
                <span className="sr-only">Previous</span>
              </a>
            </li>
            {pages}
            <li className="page-item">
              <a className="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
                <span className="sr-only">Next</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    )
    return (
      <div className="row">
        <div className="card">
          <div className="table-responsive">
            <table className="table card-table table-striped table-vcenter">
              <thead>
                <tr className="d-none d-md-table-row">
                  <th className="d-none d-md-table-cell text-center">#</th>
                  <th className=" d-none d-md-table-cell">
                    <img
                      className="mr-2"
                      src={fa_alis}
                      style={{
                        marginBottom: '2px',
                        verticalAlign: 'middle',
                        height: '14px',
                        width: '14px',
                        border: 'none',
                      }}
                    />
                    ALISユーザーID
                  </th>
                  <th className="d-none d-md-table-cell" />
                  <th colSpan="5">
                    <i className="mr-2 fab fa-twitter text-blue" />
                    Twitterアカウント
                  </th>
                  {revoke_th}
                </tr>
              </thead>
              <tbody>{tweeple_html}</tbody>
            </table>
          </div>
        </div>
        {pages_html}
      </div>
    )
  }
  render_candidates() {
    let candidates_html = []
    for (let v of this.state.allCandidates || []) {
      let candidates = []
      for (let screen_name in v.candidates) {
        if (screen_name !== '$profile') {
          let checked = ''
          let candidate_color = 'dark'
          if (v.candidates[screen_name].checked) {
            checked = 'checked'
            candidate_color = 'red'
          }
          candidates.push(
            <div className="form-check form-check-inline">
              <input
                checked={checked}
                className="form-check-input"
                type="radio"
                name={`candidates_${v.alis}`}
                value={screen_name}
                onClick={() => {
                  this.auth.chooseCandidate(v.alis, screen_name, this)
                }}
              />
              <label className="form-check-label">
                {' '}
                <a
                  className={`text-${candidate_color}`}
                  target="_blank"
                  href={`https://twitter.com/${screen_name}`}
                >
                  {screen_name}
                </a>
              </label>
            </div>
          )
        }
      }
      candidates_html.push(
        <tr>
          <td className="w-1">
            <a
              href={`https://alis.to/users/${v.alis}`}
              target="_blank"
              className="text-muted"
            >
              <span
                className="avatar"
                style={{
                  backgroundImage: `url(${
                    v.candidates['$profile'].icon_image_url
                  })`,
                }}
              />
            </a>
          </td>
          <td>
            <div>
              <a href={`https://alis.to/users/${v.alis}`} target="_blank">
                {v.alis}
              </a>
            </div>
            <div className="small text-muted">
              {v.candidates['$profile'].user_display_name}
            </div>
          </td>
          <td>
            <div className="custom-controls-stacked">{candidates}</div>
          </td>
        </tr>
      )
    }
    return (
      <div className="row">
        <div className="card">
          <div className="table-responsive">
            <table className="table card-table table-striped table-vcenter">
              <tbody>{candidates_html}</tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

export default Who
