import React, { Component } from 'react'
import url from 'url'
import _ from 'underscore'

import moment from 'moment-timezone'
import 'moment/locale/ja'

import waves_icon from '../assets/images/waves.png'
import alis_hackers from '../assets/images/alis_hackers.png'
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
          {this.renderTokens()}
        </div>
      </div>
    )
  }
  round(num) {
    const divider = 10000000000
    return Math.round(num * divider) / divider
  }
  renderTokens() {
    let tokens_html = []
    let amounts = {}
    if (this.props.serverInfo != undefined) {
      amounts = this.props.serverInfo.amount || {}
    }
    console.log(amounts)
    let tokens = []
    for (let k in amounts) {
      tokens.push({ assetId: k, amount: amounts[k] })
    }
    tokens = _(tokens).sortBy(v => {
      if (v.assetId === 'aht') {
        return 0
      } else if (v.assetId === 'WAVES') {
        return 1
      } else {
        return 2
      }
    })
    console.log(tokens)
    for (let v of tokens) {
      let hold = 0
      let amount = v.amount
      let k = v.assetId
      let aht = amount.earned
      const AHT = amount
      const divider = 10000000000
      let earned = AHT.earned + (AHT.tipped || 0)
      let paid = AHT.paid + (AHT.tip || 0)
      hold = Math.round((earned - paid) * divider) / divider
      hold = Math.round(hold * divider) / divider
      aht = Math.round(aht * divider) / divider
      let icon = 'fa fa-sign-out-alt fa-rotate-180 text-primary'
      let token_logo
      if (amount.paid < 0) {
        icon = 'fa fa-sign-in-alt text-success'
      }

      let token_href = 'https://wavesplatform.com/'
      let testnet = ''
      if (process.env.WAVES_NETWORK === 'TESTNET') {
        testnet = 'testnet.'
      }
      if (v.assetId === 'WAVES') {
        amount.name = 'WAVES'
      }
      if (amount.name != undefined) {
        if (amount.name != 'WAVES') {
          token_href = `https://${testnet}wavesexplorer.com/tx/${k}`
        } else {
          token_logo = (
            <img
              src={waves_icon}
              className="mr-2 mb-1"
              style={{ width: '20px' }}
            />
          )
        }
      } else {
        if (k === 'aht') {
          token_logo = (
            <img
              src={alis_hackers}
              className="mr-2"
              style={{ height: '20px', marginBottom: '2px' }}
            />
          )
          token_href = `https://${testnet}wavesexplorer.com/tx/${
            process.env.ASSET_ID
          }`
        }
      }
      let name = amount.name || 'ALIS HackerToken'
      tokens_html.push(
        <tr>
          <td style={{ verticalAlign: 'middle' }}>
            <div>
              {token_logo}
              <a href={token_href} target="_blank">
                <b>{name}</b>
              </a>
            </div>
          </td>
          <td>
            <div>{this.round(amount.earned)}</div>
          </td>
          <td>
            <div>
              <i className={`${icon} mr-2`} />
              {this.round(Math.abs(amount.paid))}
            </div>
          </td>
          <td>
            <div>{this.round(amount.tip)}</div>
          </td>
          <td>
            <div>{this.round(amount.tipped)}</div>
          </td>
          <td>
            <div>
              <b className="text-primary">{hold}</b>
            </div>
          </td>
        </tr>
      )
    }
    return (
      <div className="card">
        <div className="table-responsible">
          <table className="table table-hover table-outline table-vcenter text-nowrap card-table">
            <thead>
              <tr>
                <th>トークン名</th>
                <th>獲得額</th>
                <th>出入金額</th>
                <th>投げ銭額</th>
                <th>投げ銭受け取り額</th>
                <th>現在保有量</th>
              </tr>
            </thead>
            <tbody>{tokens_html}</tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Waves
