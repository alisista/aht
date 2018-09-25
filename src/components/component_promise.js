import React, { Component } from 'react'
import url from 'url'
class ComponentP extends Component {
  constructor(props) {
    super(props)
    this.params = {}
    if (props.location.href != undefined) {
      this.params = (
        url.parse(props.location.href, true) || { query: {} }
      ).query
    }
  }
  async set(state) {
    return await new Promise(res => {
      this.setState(state, res)
    })
  }
  async getJSOND(file_id, file_name) {
    return new Promise(res => {
      window.$.getJSON(
        `https://dl.dropboxusercontent.com/s/${file_id}/${file_name}.json`,
        json => {
          res(json)
        }
      )
    })
  }
}

export default ComponentP
