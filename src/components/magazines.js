import React, { Component } from 'react'
import url from 'url'
import _ from 'underscore'

import moment from 'moment-timezone'
import 'moment/locale/ja'

import Issue_Magazine from '../components/issue_magazine'

moment.locale('ja')

class Articles extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tab: 'reward',
    }
  }
  render() {
    let magazines = _(this.props.userMagazines || []).sortBy(v => {
      return (v.created_at || 0) * -1
    })
    magazines = _(magazines).filter(v => {
      return v.deleted == undefined
    })
    console.log(magazines)

    let magazines_html = []
    for (let v of magazines) {
      magazines_html.push(
        <tr
          style={{ cursor: 'pointer' }}
          onClick={() => {
            window.location.href = `/magazines/?id=${v.file_id}`
          }}
        >
          <td>
            <div>
              <b>{v.title}</b>
            </div>
            <div className="small text-muted">
              {moment(v.created_at).format('MM/DD 発刊')}
            </div>
          </td>
          <td>
            <div className="small">{v.description || ''}</div>
          </td>
        </tr>
      )
    }
    return (
      <div>
        <Issue_Magazine
          user={this.props.user}
          userInfo={this.props.userInfo}
          showModal={this.props.showModal}
          userMagazines={this.props.userMagazines}
          auth={this.props.auth}
        />
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover table-outline table-vcenter card-table">
              <thead>
                <th style={{ width: '40%' }}>マガジン名</th>
                <th>概要</th>
              </thead>
              <tbody>{magazines_html}</tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

export default Articles
