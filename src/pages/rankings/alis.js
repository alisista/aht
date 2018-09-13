import React, { Component } from 'react'
import Helmet from 'react-helmet'

import url from 'url'
import querystring from 'querystring'

import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

import Layout from '../../components/layout'
import Footer from '../../components/footer'
import Loading from '../../components/loading'
import Header_Home from '../../components/header_home'
import image_404 from '../../assets/images/404.jpg'

moment.locale('ja')

class Home extends Component {
  constructor(props) {
    super(props)
    let redirectedUrl = props.location.href || ''
    const parsedUrl = url.parse(redirectedUrl, true) || { query: {} }
    let topic = null
    if (
      parsedUrl.query.topic != undefined &&
      ['crypto', 'gourmet', 'gosyuin'].includes(
        parsedUrl.query.topic.toLowerCase()
      )
    ) {
      topic = parsedUrl.query.topic.toLowerCase()
    }
    this.state = {
      topic: topic,
      date: parsedUrl.query.daily,
      existing_dates: [],
    }
  }
  getRanking(map) {
    let ranking_url = `https://dl.dropboxusercontent.com/s/${
      map[this.state.date]
    }/${this.state.date}.json`
    window.$.getJSON(ranking_url, json => {
      this.setState({ articles: json.a })
    })
  }
  getMap() {
    let map_url = `https://dl.dropboxusercontent.com/s/${
      process.env.MAP_ID_ALIS_DAILY
    }/alis_daily.json`
    window.$.getJSON(map_url, json => {
      if (this.state.date == undefined || json[this.state.date] == undefined) {
        const latest = _(json)
          .chain()
          .keys()
          .sortBy(v => {
            return v.split('-').join('') * -1
          })
          .value()[0]
        if (latest !== undefined) {
          window.location.href = `/rankings/alis/?daily=${latest}`
        }
      } else {
        this.setState({ existing_dates: _(json).keys() }, () => {
          this.getRanking(json)
        })
      }
    })
  }
  componentDidMount() {
    this.getMap()
  }
  componentDidUpdate() {}

  render() {
    let alerts = this.state.alerts || []
    let body =
      this.state.articles === undefined ? <Loading /> : this.render_rankings()
    const nav_links = [{ name: 'トークン', href: '/home/' }]
    const topics = [
      { key: null, name: '総合', icon: 'font' },
      { key: 'crypto', name: 'クリプト', icon: 'ethereum', fa_type: 'fab' },
      { key: 'gourmet', name: 'グルメ', icon: 'birthday-cake' },
      { key: 'gosyuin', name: '御朱印', icon: 'cannabis' },
    ]
    let topics_html = []
    for (let v of topics) {
      let active = ''
      if (this.state.topic == v.key) {
        active = 'active'
      }
      let href = `/rankings/alis/?daily=${this.state.date}`
      if (v.key != null) {
        href += '&topic=' + v.key
      }
      topics_html.push(
        <li className="nav-item">
          <a href={href} className={`nav-link ${active}`}>
            <i className={`${v.fa_type || 'fa'} fa-${v.icon}`} /> {v.name}
          </a>
        </li>
      )
    }
    const topic_names = {
      all: '総合',
      crypto: 'クリプト',
      gourmet: 'グルメ',
      gosyuin: '御朱印',
    }
    let navigation_btns = []
    const day_before = moment(this.state.date)
      .add(-1, 'day')
      .format('YYYY-MM-DD')
    const day_after = moment(this.state.date)
      .add(1, 'day')
      .format('YYYY-MM-DD')
    if (this.state.existing_dates.includes(day_before)) {
      navigation_btns.push(
        <a
          className="btn btn-primary text-light"
          href={`/rankings/alis/?daily=${day_before}`}
        >
          <i className="fa fa-arrow-circle-left mr-2" />
          {moment(this.state.date)
            .add(-1, 'day')
            .format('M月D日')}
        </a>
      )
    } else {
      navigation_btns.push(
        <a className="btn btn-gray" style={{ cursor: 'default' }}>
          <i className="fa fa-arrow-circle-left mr-2" />
          {moment(this.state.date)
            .add(-1, 'day')
            .format('M月D日')}
        </a>
      )
    }

    navigation_btns.push(
      <h1
        className="d-none d-md-inline-block page-title"
        style={{ fontSize: '18px' }}
      >
        ALISランキング
        <i className="fa fa-angle-double-right ml-3 mr-3" />
        {topic_names[this.state.topic || 'all']}
        部門
      </h1>
    )

    if (this.state.existing_dates.includes(day_after)) {
      navigation_btns.push(
        <a
          className="btn btn-primary text-light"
          href={`/rankings/alis/?daily=${day_after}`}
        >
          {moment(this.state.date)
            .add(1, 'day')
            .format('M月D日')}
          <i className="fa fa-arrow-circle-right ml-2" />
        </a>
      )
    } else {
      navigation_btns.push(
        <a className="btn btn-gray" style={{ cursor: 'default' }}>
          {moment(this.state.date)
            .add(1, 'day')
            .format('M月D日')}
          <i className="fa fa-arrow-circle-right ml-2" />
        </a>
      )
    }
    let meta = []
    const title = `ALISデイリーランキング ${moment(this.state.date).format(
      'M月D日（ddd）'
    )}| ALISハッカー部`
    const desc =
      moment(this.state.ndate).format('YYYY年 MM月DD日 （ddd）') +
      'にTwitterで話題になったALIS記事のランキングです。'
    if (this.state.img != undefined) {
      meta.push({ name: 'twitter:card', content: 'summary_large_image' })
      meta.push({ name: 'twitter:site', content: '@alishackers' })
      meta.push({
        name: 'twitter:image',
        content: image_404,
      })
      meta.push({ name: 'twitter:description', content: desc })
      meta.push({ name: 'twitter:title', content: title })
    }

    return (
      <Layout>
        <Helmet
          meta={meta}
          title={title}
          link={[
            {
              rel: 'stylesheet',
              type: 'text/css',
              href: '/tabler/css/tabler.min.css',
            },
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
        <Header_Home links={nav_links} />
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
            <div className="page-header">
              <div className="d-block d-md-none" style={{ width: '100%' }}>
                <h1 className="page-title" style={{ fontSize: '18px' }}>
                  ALISランキング
                  <i className="fa fa-angle-double-right ml-3 mr-3" />
                  {topic_names[this.state.topic || 'all']}
                  部門
                </h1>
              </div>
              <div
                className="d-flex justify-content-between mt-2"
                style={{ width: '100%' }}
              >
                {navigation_btns}
              </div>
            </div>
            {body}
            <div
              className="d-flex justify-content-between mt-2 mb-6"
              style={{ width: '100%' }}
            >
              {navigation_btns}
            </div>
          </div>
        </div>
        <Footer />
      </Layout>
    )
  }
  render_rankings() {
    let ranking_table = []
    let topics = {
      crypto: { name: 'クリプト', color: `success` },
      gourmet: { name: 'グルメ', color: `primary` },
      gosyuin: { name: '御朱印', color: `danger` },
    }
    let articles = this.state.articles
    if (this.state.topic != undefined) {
      articles = _(articles).filter(v => {
        return v.g == this.state.topic
      })
      let last_rank = null
      let pool = 0
      let rank = 0
      for (const article of articles) {
        if (last_rank == null || last_rank != article.r) {
          rank += 1 + pool
          pool = 0
        } else {
          pool += 1
        }
        last_rank = article.r
        article.r = rank
      }
    }
    for (let article of articles) {
      let points_color = 'blue'
      if (article.cp === 0) {
        points_color = 'gray'
      } else if (article.cp >= 100) {
        points_color = 'red'
      } else if (article.cp >= 100) {
        points_color = 'orange'
      } else if (article.cp >= 10) {
        points_color = 'green'
      }
      let rank_color = `dark`
      if (article.r == 1) {
        rank_color = `green`
      } else if (article.r == 2) {
        rank_color = `pink`
      } else if (article.r == 3) {
        rank_color = `orange`
      } else if (article.r <= 5) {
        rank_color = `azure`
      }

      ranking_table.push(
        <tr>
          <td className="text-center">
            <a
              href={`https:/alis.to/users/${article.u}`}
              target="_blank"
              className="avatar d-md-none d-inline-block"
              title={article.n}
              style={{
                backgroundImage: `url(https://alis.to/d/api/info_icon/${
                  article.u
                }/icon/${article.p}.jpeg)`,
              }}
            />

            <span
              className={`d-none d-md-inline-block text-center avatar avatar-${rank_color}`}
            >
              {article.r}
            </span>
            <div className="d-block d-md-none mt-2">
              <span className={`badge badge-${topics[article.g].color}`}>
                {topics[article.g].name}
              </span>
            </div>
          </td>
          <td>
            <div className="mb-1">
              <b className="text-warning d-inline-block d-md-none mr-2">
                {article.r}.
              </b>
              <a
                href={`https://alis.to/${article.u}/articles/${article.i}`}
                className="text-info font-weight-bold"
                target="_blank"
              >
                {article.t}
              </a>
            </div>
            <div className="small text-muted">
              <div
                className="d-none d-md-inline-block"
                style={{ width: '60px' }}
              >
                <span className={`badge badge-${topics[article.g].color}`}>
                  {topics[article.g].name}
                </span>
              </div>
              <div className="d-inline-block" style={{ width: '200px' }}>
                <span className="d-inline-block mr-2">
                  <i className="fa fa-comment mr-1 text-primary" />
                  {article.ct}
                </span>
                <span className="d-inline-block mr-2">
                  <i className="fa fa-retweet mr-1 text-success" />
                  {article.cr}
                </span>
                <span className="d-inline-block mr-2">
                  <i className="fa fa-heart mr-1 text-danger" />
                  {article.cl}
                </span>
                <span className="d-inline-block d-md-none ml-5">
                  <i className="fa fa-fire mr-1 text-warning" />
                  {article.cp}
                </span>
              </div>
            </div>
          </td>
          <td className="d-none d-md-table-cell text-center">
            <a
              href={`https:/alis.to/users/${article.u}`}
              target="_blank"
              className="avatar d-block"
              title={article.n}
              style={{
                backgroundImage: `url(https://alis.to/d/api/info_icon/${
                  article.u
                }/icon/${article.p})`,
              }}
            />
          </td>
          <td className="d-none d-md-table-cell">
            <div>
              <a
                href={`https:/alis.to/users/${article.u}`}
                target="_blank"
                className="text-dark"
              >
                {article.n}
              </a>
            </div>
            <div className="small text-muted">
              <a
                href={`https:/alis.to/users/${article.u}`}
                target="_blank"
                className="text-muted"
              >
                {article.u}
              </a>
            </div>
          </td>
          <td className="d-none d-md-table-cell">
            <div>
              <span
                className={`stamp stamp-sm bg-${points_color}`}
                style={{ width: '60px' }}
              >
                {article.cp}
              </span>
            </div>
          </td>
        </tr>
      )
    }
    return (
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover table-outline table-vcenter card-table">
            <thead>
              <th className="text-center" style={{ paddingLeft: '1.5rem' }} />
              <th className="text-danger">
                {moment(this.state.date).format('M月D日 （ddd）')}{' '}
                <span className="ml-2">{articles.length} 記事</span>
              </th>
              <th className="d-none d-md-table-cell" />
              <th className="d-none d-md-table-cell">ユーザー</th>
              <th
                className="d-none d-md-table-cell text-center"
                style={{ paddingRight: '1.5rem' }}
              >
                ポイント
              </th>
            </thead>
            <tbody>{ranking_table}</tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Home
