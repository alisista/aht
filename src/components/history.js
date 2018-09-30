import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

class History extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    if ((this.props.history || []).length == 0) {
      return null
    } else {
      let history_html = []
      this.props.history.forEach(v => {
        if (
          this.props.filter == undefined ||
          this.props.filter.includes(v.type)
        ) {
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
              <td>{reason}</td>
            </tr>
          )
        }
      })
      return (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <span className={`stamp stamp-sm bg-primary mr-3`}>
                <i className="fas fa-hand-holding-heart" />
              </span>
              トークン獲得履歴
            </h4>
          </div>
          <div className="table-responsive">
            <table className="table card-table table-striped table-vcenter">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>獲得日</th>
                  <th style={{ whiteSpace: 'nowrap' }}>トークン額</th>
                  <th style={{ whiteSpace: 'nowrap' }}>獲得事由</th>
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

export default History
