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
        history_html.push(
          <tr>
            <td>{moment(v.date).format('M月D日')}</td>
            <td>
              <b className="text-primary">{v.amount}</b> AHT
            </td>
            <td>ALISハッカー部に入部</td>
          </tr>
        )
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
                  <th>獲得日</th>
                  <th>トークン額</th>
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
