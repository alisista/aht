import React, { Component } from 'react'
import Helmet from 'react-helmet'
import image_404 from '../assets/images/404.jpg'

class COMMON_HELMET extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let metas = []
    let title = this.props.title || `404ページ | ALISハッカー部`
    let desc =
      this.props.desc ||
      '史上初！マミぃさんに300AHTお支払いで描いていただいたハッカー部のイラストです。'
    metas.push({ name: 'twitter:card', content: 'summary_large_image' })
    metas.push({ name: 'twitter:site', content: '@alishackers' })
    metas.push({
      name: 'twitter:image',
      content: 'https://alishackers.club' + image_404,
    })
    metas.push({ name: 'twitter:description', content: desc })
    metas.push({ name: 'twitter:title', content: title })
    metas.push({ name: 'og:title', content: title })
    metas.push({
      name: 'og:image',
      content: 'https://alishackers.club' + image_404,
    })
    metas.push({ name: 'og:description', content: desc })
    metas.push({ name: 'description', content: desc })
    metas.push({
      name: 'keywords',
      content:
        'ALIS, ALISハッカー部, ハッカー部, ALIS HackerToken, 独自経済圏, トークンエコノミー, 暗号通貨, cryptocurrency, ハッカー部トークン, WAVES, 仮想通貨',
    })
    let links = []
    if (this.props.links != undefined) {
      for (let link of this.props.links) {
        links.push({
          rel: 'stylesheet',
          type: 'text/css',
          href: link,
        })
      }
    } else {
      links = [
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
      ]
    }
    return <Helmet title={title} link={links} meta={metas} />
  }
}

export default COMMON_HELMET
