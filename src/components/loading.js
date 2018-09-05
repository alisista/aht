import React, { Component } from 'react'

class Loading extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="page" style={{ width: '100%' }}>
        <div className="page-content">
          <div className="container text-center">
            <div className="display-1 text-muted mb-5">
              <i className="si si-exclamation" /> データ取得中
            </div>

            <h1 className="h2 mb-3">少々お待ち下さい...</h1>
            <p className="h4 text-muted font-weight-normal mb-7">
              法定通貨に依存しない完全独自経済圏で好きなことを追求して生きていこう！
            </p>

            <a className="btn btn-primary" href="/">
              <i className="fe fe-arrow-left mr-2" />
              トップページへ戻る
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default Loading
