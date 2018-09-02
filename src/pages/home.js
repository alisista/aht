import React, { Component } from 'react'
import Helmet from 'react-helmet'
import _ from 'underscore'
import url from 'url'
import querystring from 'querystring'

import Layout from '../components/layout'
import Footer from '../components/footer'

import auth from '../lib/auth'
import alerts from '../lib/alerts'

import waves_icon from '../assets/images/waves.png'

import moment from 'moment-timezone'
import 'moment/locale/ja'
moment.locale('ja')

class HTML extends Component {
  constructor(props) {
    super(props)
    let redirectedUrl = props.location.href || ''
    const parsedUrl = url.parse(redirectedUrl, true)
    let redirect = null
    if (
      parsedUrl.query.a != undefined &&
      parsedUrl.query.s != undefined &&
      parsedUrl.query.d != undefined &&
      parsedUrl.query.p != undefined
    ) {
      redirect = props.location.origin + '/home/' + props.location.search
    }
    this.state = {
      oauth: redirect,
      alerts: [],
      tobeRemoved: null,
    }
    this.alerts = new alerts(this)
  }
  componentDidMount() {
    this.auth = new auth(this, { redirect: true, oauth: this.state.oauth })
  }
  componentDidUpdate() {
    window
      .$('.waves-receiver')
      .tooltip({ boundary: 'window', placement: 'right' })
  }
  render() {
    let user
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
      this.state.isUser === undefined
        ? this.render_loading()
        : this.render_dashboard()
    let footer_links = [
      { key: 'twitter', href: 'https://twitter.com/alishackers' },
      { key: 'github', href: 'https://github.com/alisista' },
      { key: 'discord', href: 'https://discord.gg/TyKbbrT' },
    ]
    if (this.state.user != undefined) {
      user = (
        <a
          href="#"
          className="nav-link pr-0 leading-none"
          data-toggle="dropdown"
        >
          <span
            className="avatar"
            style={{
              backgroundImage: `url(${this.state.user.photoURL})`,
            }}
          />
          <span className="ml-2 d-none d-lg-block">
            <span className="text-default">{this.state.user.displayName}</span>
            <small className="text-muted d-block mt-1">0.00000000 AHT</small>
          </span>
        </a>
      )
    }
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
        <div className="page">
          <div className="flax-fill">
            <div className="header py-4">
              <div className="container">
                <div className="d-flex">
                  <a className="header-brand" href="/">
                    ALIS HackerToken
                  </a>
                  <div className="d-flex order-lg-2 ml-auto">
                    <div className="dropdown">
                      {user}
                      <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            this.auth.logout()
                          }}
                        >
                          <i className="dropdown-icon fe fe-log-out" />{' '}
                          ログアウト
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="my-3 my-md-5">
          <div className="container">
            <div className="row">
              {alert_html}
              {body}
            </div>
          </div>
        </div>
        <Footer items={footer_links} />
      </Layout>
    )
  }
  addWaves() {
    this.auth.genRandomValue(random_value => {
      let waves_url = `https://client.wavesplatform.com#gateway/auth?r=https://${
        process.env.WAVES_REDIRECT
      }/&n=ALIS HackerToken&i=/img/alis_hackers.png&s=//oauth&d=${random_value}_${
        this.state.user.uid
      }&debug=false`
      window.clearInterval(this.interval)
      let popup = window.open(waves_url)
      let current_url = url.parse(window.location.href)
      if (popup == null) {
        window.location.href = waves_url
      } else {
        popup.parentWindow = window
        this.interval = window.setInterval(() => {
          let err, redirect_url, popup_url
          try {
            popup_url = popup.location.href
            redirect_url = url.parse(popup_url)
            popup.close()
          } catch (e) {
            err = e
          }
          if (err == null && current_url.host === redirect_url.host) {
            window.clearInterval(this.interval)
            this.auth.validateWavesAddress(popup_url)
          }
        }, 1000)
      }
    })
  }
  render_loading() {
    return (
      <div className="page" style={{ width: '100%' }}>
        <div className="page-content">
          <div className="container text-center">
            <div className="display-1 text-muted mb-5">
              <i className="si si-exclamation" /> データ取得中
            </div>

            <h1 className="h2 mb-3">少々お待ち下さい...</h1>
            <p className="h4 text-muted font-weight-normal mb-7">
              法定通貨に依存しない完全独自経済圏で好きなことを追求して生きていこう！
            </p>

            <a className="btn btn-primary" href="/">
              <i className="fe fe-arrow-left mr-2" />
              トップページへ戻る
            </a>
          </div>
        </div>
      </div>
    )
  }
  removeWavesAddress(k) {
    this.setState({ tobeRemoved: k }, () => {
      window.$('#pageModal').modal({})
    })
  }
  confirmRemoval(k) {
    window.$('#pageModal').modal('hide')
    this.auth.removeWavesAddress(k)
  }
  render_dashboard() {
    let userInfo = this.state.userInfo
    let waves_addresses = (userInfo || {}).waves_addresses || {}
    let waves_html
    if (_.isEmpty(waves_addresses)) {
      waves_html = (
        <div className="card-body">Wavesアドレスは登録されていません。</div>
      )
    } else {
      let addresses_html = []
      let index = 0
      let receiver_address
      let waves_addresses_ordered = []
      for (let k in waves_addresses) {
        if (waves_addresses[k].receiver === true) {
          receiver_address = waves_addresses[k]
        } else {
          waves_addresses_ordered.push(waves_addresses[k])
        }
      }
      if (receiver_address != undefined) {
        waves_addresses_ordered.unshift(receiver_address)
      }
      waves_addresses_ordered.forEach((v, index) => {
        let receiver
        if (
          (receiver_address == undefined && index == 0) ||
          (receiver_address != undefined &&
            receiver_address.address == v.address)
        ) {
          receiver = <img src={waves_icon} />
        } else {
          receiver = (
            <img
              data-toggle="tooltip"
              className="waves-receiver"
              title="受け取りアドレスに設定する"
              src={waves_icon}
              onClick={() => {
                this.auth.setAsReceiver(v.address)
              }}
            />
          )
        }
        addresses_html.push(
          <tr>
            <td>{receiver}</td>
            <td style={{ wordBreak: 'break-all' }}>
              <b>{v.address}</b>
            </td>
            <td>
              <span style={{ whiteSpace: 'nowrap' }}>
                {moment(waves_addresses[v.address].added_at).format('YYYY年')}
              </span>{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                {moment(waves_addresses[v.address].added_at).format('M月D日')}
              </span>
            </td>
            <td>
              <a
                className="icon"
                onClick={() => {
                  this.removeWavesAddress(v.address)
                }}
              >
                <i className="fe fe-trash text-danger" />
              </a>
            </td>
          </tr>
        )
      })
      waves_html = (
        <table className="table card-table table-striped table-vcenter">
          <thead>
            <tr>
              <th>受取</th>
              <th>Wavesアドレス</th>
              <th>追加日</th>
              <th>削除</th>
            </tr>
          </thead>
          <tbody>{addresses_html}</tbody>
        </table>
      )
    }
    return (
      <div className="col-12">
        <div className="card">
          <div className="table-responsible">{waves_html}</div>
          <div className="card-footer text-right">
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => {
                this.addWaves()
              }}
            >
              Wavesアドレスを追加
            </button>
          </div>
        </div>

        <div
          className="modal fade"
          id="pageModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Wavesアドレス削除確認
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                />
              </div>
              <div className="modal-body" style={{ wordBreak: 'break-all' }}>
                {`本当に`} <b>{this.state.tobeRemoved}</b>{' '}
                {`を削除してよろしいですか？`}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  取り消し
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    this.confirmRemoval(this.state.tobeRemoved)
                  }}
                >
                  実行
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default HTML
