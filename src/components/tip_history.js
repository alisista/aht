import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

class Tip_History extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    if ((this.props.tip_history || []).length == 0) {
      return null
    } else {
      let history_html = []
      this.props.tip_history.forEach(v => {
        let reason = v.reason || `ALISハッカー部に入部`
        if (v.type === 'tip') {
          reason = (
            <div>
              投げ錢 『
              <a
                target="_blank"
                href={`https://alis.to/${v.article.user_id}/articles/${
                  v.article.article_id
                }`}
              >
                {v.article.title}
              </a>
              』
            </div>
          )
        }
        history_html.push(
          <tr>
            <td>{moment(v.date).format('M/D')}</td>
            <td style={{ whiteSpace: 'nowrap' }}>
              <b className="text-primary">{v.amount}</b>{' '}
              <span className="text-muted" style={{ fontSize: '12px' }}>
                AHT
              </span>
            </td>
            <td>
              <a
                href={`https://alis.to/${v.article.user_id}/articles/${
                  v.article.article_id
                }`}
                target="_blank"
              >
                {v.article.title}
              </a>
            </td>
            <td style={{ width: '60px', paddingRight: '0px' }}>
              <span
                title={v.article.user_display_name}
                className="avatar"
                style={{ backgroundImage: `url(${v.article.icon_image_url})` }}
              />
            </td>
          </tr>
        )
      })
      return (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <span className={`stamp stamp-sm bg-success mr-3`}>
                <i className="fa fa-donate" />
              </span>
              投げ銭履歴
            </h4>
          </div>
          <div className="table-responsive">
            <table className="table card-table table-striped table-vcenter">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>投錢日</th>
                  <th style={{ whiteSpace: 'nowrap' }}>トークン額</th>
                  <th style={{ whiteSpace: 'nowrap' }}>対象記事</th>
                  <th />
                </tr>
              </thead>
              <tbody>{history_html}</tbody>
            </table>
          </div>
        </div>
      )
    }
  }
}

export default Tip_History
