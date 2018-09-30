import React, { Component } from 'react'
import ComponentP from '../../components/component_promise'
import url from 'url'
import querystring from 'querystring'

import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

import Layout from '../../components/layout'
import Footer from '../../components/footer'
import Loading from '../../components/loading'
import Header_Home from '../../components/header_home'
import Subheader from '../../components/subheader'
import Helmet from '../../components/helmet'
import image_404 from '../../assets/images/404.jpg'
import alis_hackers from '../../assets/images/alis_hackers.png'
moment.locale('ja')

class Supply extends ComponentP {
  constructor(props) {
    super(props)
    this.state = { page: (this.params.page || 1) * 1 }
  }
  async componentDidMount() {
    let map = await this.getJSOND(process.env.MAP_ID_AHT, 'aht')
    let pages = _(_(map.history).keys())
      .chain()
      .map(v => {
        return v * 1
      })
      .sortBy(v => {
        return v
      })
      .value()
    if (map.history[this.state.page] != undefined) {
      let history = await this.getJSOND(
        map.history[this.state.page],
        `history_${this.state.page}`
      )
      this.set({ ...history, pages: pages })
    }
  }

  componentDidUpdate() {}
  render() {
    const nav_links = [
      { name: 'ホーム', href: '/home/' },
      { name: 'whoami', href: '/whoami/' },
      { name: 'ランキング', href: '/rankings/alis/' },
      { name: '企画', href: '/rankings/note/?tag=alis' },
      { name: '公式マガジン', href: '/magazines/' },
    ]

    const nav_links_sub = [
      { name: '供給履歴', href: '/token/supply/', icon: 'coins' },
      { name: 'トークン獲得者', href: '/token/winners/', icon: 'users' },
    ]

    let history = this.state.history
    let users = this.state.holders
    let body
    if (history == undefined) {
      body = <Loading />
    } else {
      let pages_html
      let pages = []
      for (let p of this.state.pages || []) {
        let active = ''
        if (this.state.page === p) {
          pages.push(
            <li className={`page-item active`} style={{ cursor: 'default' }}>
              <span className="page-link" style={{ cursor: 'default' }}>
                {p}
              </span>
            </li>
          )
        } else {
          pages.push(
            <li className={`page-item`}>
              <a className="page-link" href={`/token/supply/?page=${p}`}>
                {p}
              </a>
            </li>
          )
        }
      }
      pages_html = (
        <div className="pt-2 text-center">
          <div className="d-inline-block">
            <ul className="pagination">{pages}</ul>
          </div>
        </div>
      )
      let records_html = []
      for (let record of history) {
        let user = users[record.uid]
        const reasons = {
          join: 'ハッカー部入部',
        }
        let reason
        if (record.type == 'mission') {
          reason = reasons[record.mission_id]
        } else {
          reason = record.reason
        }
        records_html.push(
          <tr>
            <td className="text-muted d-none d-md-table-cell">
              {moment(record.date).format('YYYY MM/DD')}
            </td>
            <td className="d-table-cell d-md-none text-center">
              <div>
                <b className="text-primary">{record.amount}</b>
              </div>
              <div className="text-muted small">
                {moment(record.date).format('M/D')}
              </div>
            </td>

            <td className="w-1">
              <a
                href={`https://twitter.com/${user.screen_name}`}
                target="_blank"
              >
                <span
                  className="avatar"
                  style={{
                    backgroundImage: `url(${user.photoURL.replace(
                      /_normal/,
                      ''
                    )})`,
                  }}
                />
              </a>
            </td>
            <td className="d-none d-md-table-cell">
              <div>
                <a
                  className="text-dark"
                  href={`https://twitter.com/${user.screen_name}`}
                  target="_blank"
                >
                  {user.displayName}
                </a>
              </div>
              <div>
                <a
                  className="text-muted small"
                  href={`https://twitter.com/${user.screen_name}`}
                  target="_blank"
                >
                  @{user.screen_name}
                </a>
              </div>
            </td>
            <td className="d-none d-md-table-cell text-center">
              <b className="text-primary">{record.amount}</b>{' '}
              <span className="text-muted" style={{ fontSize: '12px' }}>
                AHT
              </span>
            </td>
            <td className="d-none d-md-table-cell">{reason}</td>
            <td className="d-md-none d-table-cell">
              <div>{reason}</div>
              <div>
                <a
                  className="text-muted small"
                  href={`https://twitter.com/${user.screen_name}`}
                  target="_blank"
                >
                  {user.displayName}
                </a>
              </div>
            </td>
          </tr>
        )
      }
      body = (
        <div>
          <div className="card">
            <div className="table-responsive">
              <table className="table card-table table-striped table-vcenter">
                <tbody>
                  <tr>
                    <td
                      className="text-center d-none d-md-table-cell"
                      style={{ whiteSpace: 'nowrap', width: '250px' }}
                    >
                      <a
                        href="https://wavesexplorer.com/tx/4PHPY8YjFKzRTfMtiMYGLL4VBdUGMhF45VxZNnT6K7fL"
                        target="_blank"
                      >
                        <img
                          src={alis_hackers}
                          className="mr-2"
                          style={{ width: '30px' }}
                        />
                        <b>ALIS HackerToken</b>
                      </a>
                    </td>
                    <td
                      className="text-center d-table-cell d-md-none"
                      style={{}}
                    >
                      <a
                        href="https://wavesexplorer.com/tx/4PHPY8YjFKzRTfMtiMYGLL4VBdUGMhF45VxZNnT6K7fL"
                        target="_blank"
                      >
                        <b>ALIS HackerToken</b>
                      </a>
                    </td>
                    <td
                      className="w-1 text-center"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <div>{this.state.amount}</div>
                      <div className="text-muted small">供給数</div>
                    </td>
                    <td
                      className="w-1 text-center"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <div>75209200</div>
                      <div className="text-muted small">総発行数</div>
                    </td>
                    <td
                      className="w-1 text-center d-none d-md-table-cell"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <div>WAVES</div>
                      <div className="text-muted small">プラットフォーム</div>
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="table-responsive">
              <table className="table card-table table-striped table-vcenter">
                <thead>
                  <tr className="d-none d-md-table-row">
                    <th>供給日</th>
                    <th colSpan="2">獲得者</th>
                    <th
                      className="text-center"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      供給額
                    </th>
                    <th>供給事由</th>
                  </tr>
                  <tr className="d-md-none d-table-row">
                    <th style={{ paddingLeft: '12px' }}>AHT</th>
                    <th colSpan="2">獲得者 / 事由</th>
                  </tr>
                </thead>
                <tbody>{records_html}</tbody>
              </table>
            </div>
          </div>
          {pages_html}
        </div>
      )
    }

    return (
      <Layout>
        <Helmet title="AHT供給ログ | ALISハッカー部" desc="AHTの供給履歴です" />
        <Header_Home links={nav_links} />
        <Subheader items={nav_links_sub} location={this.props.location} />
        <div className="my-3 my-md-5">
          <div className="container">{body}</div>
        </div>
        <Footer />
      </Layout>
    )
  }
}

export default Supply
