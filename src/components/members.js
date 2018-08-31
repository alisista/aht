import React, { Component } from 'react'
import { withPrefix } from 'gatsby-link'
import _ from 'underscore'
import fa_alis from '../assets/images/fa-alis.png'
class Members extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let member_items = []
    let members = this.props.items
    members.forEach((v, i) => {
      let links = []
      for (let v2 of v.links || []) {
        let img
        let href
        if (v2.type == 'alis') {
          href = `https://alis.to/users/${v2.id}`
          img = (
            <img
              src={fa_alis}
              style={{
                height: '30px',
                width: '30px',
                border: 'none',
                marginBottom: '5px',
              }}
            />
          )
        } else {
          let fa_type = v2.fa_type || 'fab'
          img = <i className={`${fa_type} fa-${v2.type}`} />
          if (v2.type == 'twitter') {
            href = `https://twitter.com/${v2.id}`
          } else if (v2.type == 'github') {
            href = `https://github.com/${v2.id}`
          } else if (v2.type == 'youtube') {
            href = `https://youtube.com/channel/${v2.id}`
          } else {
            href = v2.id
          }
        }
        links.push(
          <li className="list-inline-item">
            <a href={href} target="_blank">
              {img}
            </a>
          </li>
        )
      }
      member_items.push(
        <div key={`member-` + (i + 1)} className="col-md-4 col-sm-6">
          <div className="team-member">
            <img className="mx-auto rounded-circle" src={v.icon} alt="" />
            <h4>{v.name}</h4>
            <p className="text-muted">{v.subheading}</p>
            <ul className="list-inline social-buttons">{links}</ul>
          </div>
        </div>
      )
    })
    return (
      <section className="bg-light" id="members">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h2 className="section-heading text-uppercase">ALISハッカー部</h2>
              <h3 className="section-subheading text-muted">
                ALISコミュニティから生まれた分散型グローバルハッカーグループ
              </h3>
            </div>
          </div>
          <div className="row text-center">{member_items}</div>
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <p className="large text-muted">
                初心者から世界を股に掛けるエンジニアまで、各自が自分の好きなことを追求する開発者コミュニティです。学習を助け合うコミュニティなのでプログラミング知識ゼロの方、大歓迎です！
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default Members
