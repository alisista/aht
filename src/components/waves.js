import React, { Component } from 'react'
import url from 'url'
import _ from 'underscore'

import moment from 'moment-timezone'
import 'moment/locale/ja'

import waves_icon from '../assets/images/waves.png'

moment.locale('ja')

class Waves extends Component {
  constructor(props) {
    super(props)
  }
  confirmRemoval(k) {
    this.props.auth.removeWavesAddress(k)
  }
  addWaves() {
    this.props.auth.genRandomValue(random_value => {
      let waves_network = 'client'
      if (process.env.WAVES_NETWORK === 'TESTNET') {
        waves_network = 'testnet'
      }
      let waves_url = `https://${waves_network}.wavesplatform.com#gateway/auth?r=https://${
        process.env.WAVES_REDIRECT
      }/&n=ALIS HackerToken&i=/img/alis_hackers.png&s=//oauth&d=${random_value}_${
        this.props.user.uid
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
            this.props.auth.validateWavesAddress(popup_url)
          }
        }, 1000)
      }
    })
  }
  render() {
    let waves_html
    let userInfo = this.props.userInfo
    let waves_addresses = (userInfo || {}).waves_addresses || {}
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
                this.props.auth.setAsReceiver(v.address)
              }}
            />
          )
        }
        let testnet = ''
        if (process.env.WAVES_NETWORK === 'TESTNET') {
          testnet = 'testnet.'
        }
        addresses_html.push(
          <tr>
            <td>{receiver}</td>
            <td style={{ wordBreak: 'break-all' }}>
              <b>
                <a
                  href={`https://${testnet}wavesexplorer.com/address/${
                    v.address
                  }`}
                  target="_blank"
                >
                  {v.address}
                </a>
              </b>
            </td>
            <td style={{ fontSize: '12px' }}>
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
                  this.props.showModal({
                    title: (
                      <div>
                        <i className="fas fa-exclamation-triangle text-warning" />{' '}
                        Wavesアドレス削除確認
                      </div>
                    ),
                    body: (
                      <div>
                        本当に <b>{v.address}</b> を削除してよろしいですか？
                      </div>
                    ),
                    exec: () => {
                      this.confirmRemoval(v.address)
                    },
                  })
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
              <th style={{ whiteSpace: 'nowrap' }}>受取</th>
              <th>Wavesアドレス</th>
              <th style={{ whiteSpace: 'nowrap' }}>追加日</th>
              <th style={{ whiteSpace: 'nowrap' }}>削除</th>
            </tr>
          </thead>
          <tbody>{addresses_html}</tbody>
        </table>
      )
    }
    return (
      <div className="row">
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
        </div>
      </div>
    )
  }
}

export default Waves
