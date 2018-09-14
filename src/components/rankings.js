import React, { Component } from 'react'
import Helmet from 'react-helmet'

import url from 'url'
import querystring from 'querystring'

import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

import Layout from './layout'
import Footer from './footer'
import Loading from './loading'
import Header_Home from './header_home'
import image_404 from '../assets/images/404.jpg'

moment.locale('ja')

class Home extends Component {
  constructor(props) {
    super(props)
    let tag
    let map_id = process.env.MAP_ID_ALIS_DAILY
    let map_name = 'alis_daily'
    let target = props.location.pathname.toLowerCase().split('/')[2]
    let redirectedUrl = props.location.href || ''
    const parsedUrl = url.parse(redirectedUrl, true) || { query: {} }
    let conf = {
      name: 'ALIS',
    }
    if (target === 'note') {
      map_id = process.env.MAP_ID_NOTE_TAGS
      if (parsedUrl.query.tag != undefined) {
        tag = parsedUrl.query.tag.toLowerCase()
        map_name = tag
      }
      conf = {
        name: 'note',
      }
    }
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
      conf: conf,
      map_id: map_id,
      map_name: map_name,
      target: target,
      tag: tag,
      topic: topic,
      date: parsedUrl.query.daily,
      existing_dates: [],
    }
  }
  getRanking(map) {
    let tag = this.state.date || this.state.tag
    let ranking_url = `https://dl.dropboxusercontent.com/s/${
      map[tag]
    }/${tag}.json`
    window.$.getJSON(ranking_url, json => {
      this.setState({ articles: json.a })
    })
  }
  getMap() {
    let map_url = `https://dl.dropboxusercontent.com/s/${this.state.map_id}/${
      this.state.map_name
    }.json`
    window.$.getJSON(map_url, json => {
      let tag = this.state.date || this.state.tag
      if (tag == undefined || json[tag] == undefined) {
        if (this.state.target === 'note') {
          window.location.href = `/rankings/note/?tag=alis`
        } else {
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
  makeSectionName() {
    if (this.state.target === 'note') {
      return (
        <span>
          <a href="https://note.mu/hashtag/alis">#ALIS</a>{' '}
          <a href="https://alis.to/wine/articles/3k9JOmRnPNE6" target="_blank">
            企画
          </a>{' '}
          <a href="https://alis.to/mammy/articles/a1ZpmeJ1p6gV" target="_blank">
            賞品 <b>1000ALIS+</b>
          </a>
        </span>
      )
    } else {
      const topic_names = {
        all: '総合',
        crypto: 'クリプト',
        gourmet: 'グルメ',
        gosyuin: '御朱印',
      }

      return `${topic_names[this.state.topic || 'all']}部門`
    }
  }
  render() {
    let conf = this.state.conf || {}
    let alerts = this.state.alerts || []
    const date = this.state.date
    let body =
      this.state.articles === undefined ? <Loading /> : this.render_rankings()
    const nav_links = [
      { name: 'トークン', href: '/home/' },
      { name: 'ALISランキング', href: '/rankings/alis/' },
      { name: 'note企画', href: '/rankings/note/' },
    ]
    const topics = [
      { key: null, name: '総合', icon: 'font' },
      { key: 'crypto', name: 'クリプト', icon: 'ethereum', fa_type: 'fab' },
      { key: 'gourmet', name: 'グルメ', icon: 'birthday-cake' },
      { key: 'gosyuin', name: '御朱印', icon: 'cannabis' },
    ]
    let topics_html = []
    if (this.state.date != undefined) {
      for (let v of topics) {
        let active = ''
        if (this.state.topic == v.key) {
          active = 'active'
        }
        let href = '/rankings/alis/'
        let topic = ''
        if (this.state.date != undefined) {
          href += `?daily=${date}`
          if (v.key != null) {
            href += '&topic=' + v.key
            topic = '&topic=' + v.key
          }
        }
        topics_html.push(
          <li className="nav-item" key={`topic-${v.key || 'all'}`}>
            <a
              href={`/rankings/alis/?daily=${this.state.date}${topic}`}
              className={`nav-link ${active}`}
            >
              <i className={`${v.fa_type || 'fa'} fa-${v.icon}`} /> {v.name}
            </a>
          </li>
        )
      }
    }
    let navigation_btns = []
    const day_before = moment(this.state.date)
      .add(-1, 'day')
      .format('YYYY-MM-DD')
    const day_after = moment(this.state.date)
      .add(1, 'day')
      .format('YYYY-MM-DD')
    if (this.state.target === 'note') {
      navigation_btns.push(<div />)
    } else if (this.state.existing_dates.includes(day_before)) {
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
        {conf.name}
        ランキング
        <i className="fa fa-angle-double-right ml-3 mr-3" />
        {this.makeSectionName()}
      </h1>
    )
    if (this.state.target === 'note') {
      navigation_btns.push(<div />)
    } else if (this.state.existing_dates.includes(day_after)) {
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
    const title = `${conf.name}デイリーランキング ${moment(
      this.state.date
    ).format('M月D日（ddd）')}| ALISハッカー部`
    const desc = `${moment(this.state.ndate).format(
      'YYYY年 MM月DD日 （ddd）'
    )}にTwitterで話題になった${conf.name}記事のランキングです。`

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
                  {conf.name}
                  ランキング
                  <i className="fa fa-angle-double-right ml-3 mr-3" />
                  {this.makeSectionName()}
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
  makeProfileImageURL(article) {
    if (this.state.target === 'note') {
      return article.p
    } else {
      return `https://alis.to/d/api/info_icon/${article.u}/icon/${article.p}`
    }
  }
  makeArticleURL(article) {
    if (this.state.target === 'note') {
      return `https:/note.mu/${article.u}/n/${article.i}`
    } else {
      return `https:/alis.to/users/${article.u}/articles/${article.i}`
    }
  }
  makeUserURL(article) {
    if (this.state.target === 'note') {
      return `https:/note.mu/${article.u}`
    } else {
      return `https:/alis.to/users/${article.u}`
    }
  }
  makePeriod() {
    if (this.state.target === 'note') {
      return `9/8 19:00 - 9/18 24:00`
    } else {
      return moment(this.state.date).format('M月D日 （ddd）')
    }
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
      let topic, topic_small
      if (this.state.target === 'aiis') {
        topic = (
          <div className="d-block d-md-none mt-2">
            <span className={`badge badge-${topics[article.g].color}`}>
              {topics[article.g].name}
            </span>
          </div>
        )
        topic_small = (
          <div className="d-none d-md-inline-block" style={{ width: '60px' }}>
            <span className={`badge badge-${topics[article.g].color}`}>
              {topics[article.g].name}
            </span>
          </div>
        )
      }
      ranking_table.push(
        <tr>
          <td className="text-center">
            <a
              href={this.makeArticleURL(article)}
              target="_blank"
              className="avatar d-md-none d-inline-block"
              title={this.makeArticleURL(article)}
              style={{
                backgroundImage: `url(${this.makeProfileImageURL(article)})`,
              }}
            />

            <span
              className={`d-none d-md-inline-block text-center avatar avatar-${rank_color}`}
            >
              {article.r}
            </span>
            {topic}
          </td>
          <td>
            <div className="mb-1">
              <b className="text-warning d-inline-block d-md-none mr-2">
                {article.r}.
              </b>
              <a
                href={this.makeArticleURL(article)}
                className="text-info font-weight-bold"
                target="_blank"
              >
                {article.t}
              </a>
            </div>
            <div className="small text-muted">
              {topic_small}
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
              href={this.makeUserURL(article)}
              target="_blank"
              className="avatar d-block"
              title={article.n}
              style={{
                backgroundImage: `url(${this.makeProfileImageURL(article)})`,
              }}
            />
          </td>
          <td className="d-none d-md-table-cell">
            <div>
              <a
                href={this.makeUserURL(article)}
                target="_blank"
                className="text-dark"
              >
                {article.n}
              </a>
            </div>
            <div className="small text-muted">
              <a
                href={this.makeUserURL(article)}
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
                {this.makePeriod()}{' '}
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
