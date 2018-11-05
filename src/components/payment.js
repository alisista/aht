import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment-timezone'
import 'moment/locale/ja'

class Payment extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    let waves_network = ''
    if (process.env.WAVES_NETWORK === 'TESTNET') {
      waves_network = 'testnet.'
    }
    if ((this.props.payment || []).length == 0) {
      return null
    } else {
      let payment_html = []

      this.props.payment.forEach(v => {
        let sent,
          confirmation,
          payment_style = {}
        if (v.status === 'canceled') {
          payment_style = { textDecoration: 'line-through', color: 'tomato' }
          sent = <span>取り消し</span>
          if (v.cancel == 1) {
            confirmation = <span>理由: 残高不足</span>
          } else {
            confirmation = <span>理由: 不明</span>
          }
        } else if (v.sent_at != undefined) {
          sent = (
            <a
              href={`https://${waves_network}wavesexplorer.com/tx/${v.tx}`}
              target="_blank"
            >
              {moment(v.sent_at).format('M/D HH:mm')}
            </a>
          )
        }
        if (v.status == 'confirmed') {
          confirmation = (
            <a
              href={`https://${waves_network}wavesexplorer.com/blocks/${
                v.block
              }`}
              target="_blank"
            >
              <i className="fa fa-check text-success" /> {v.block}
            </a>
          )
        } else if (v.status === 'sent') {
          confirmation = (
            <span>
              <i className="text-orange fa fa-spin fa-cog" /> 確認中...
            </span>
          )
        }
        payment_html.push(
          <tr style={payment_style}>
            <td>{moment(v.date).format('M/D HH:mm')}</td>
            <td>
              <b className="text-primary">{v.amount}</b>{' '}
              <span className="text-muted" style={{ fontSize: '12px' }}>
                AHT
              </span>
            </td>
            <td>{sent}</td>
            <td>{confirmation}</td>
          </tr>
        )
      })
      return (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <span className={`stamp stamp-sm bg-orange mr-3`}>
                <i className="fas fa-paper-plane" />
              </span>
              トークン支払い履歴
            </h4>
          </div>
          <div className="table-responsive">
            <table className="table card-table table-striped table-vcenter">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>申請日</th>
                  <th>トークン額</th>
                  <th style={{ whiteSpace: 'nowrap' }}>送信日（取引詳細）</th>
                  <th style={{ whiteSpace: 'nowrap' }}>完了確認</th>
                </tr>
              </thead>
              <tbody>{payment_html}</tbody>
            </table>
          </div>
        </div>
      )
    }
  }
}

export default Payment
