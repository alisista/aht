import React, { Component } from 'react'

class Loading extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let message = (
      <p className="h4 text-muted font-weight-normal mb-6">
        {this.props.message ||
          `法定通貨に依存しない完全独自経済圏で好きなことを追求して生きていこう！`}
      </p>
    )
    if (this.props.no_message) {
      message = null
    }
    return (
      <div className="page" style={{ width: '100%' }}>
        <div className="page-content">
          <div className="container text-center">
            <div
              className="display-1 text-muted mb-5"
              style={{ fontSize: '40px' }}
            >
              <i className="si si-exclamation" />{' '}
              {this.props.title || `データ取得中`}
            </div>

            <h1 className="h2 mb-4">
              {this.props.subtitle || `少々お待ち下さい...`}
            </h1>
            {message}
            <a className="btn btn-primary" href={this.props.btn_link || `/`}>
              <i className="fe fe-arrow-left mr-2" />
              {this.props.btn_text || `トップページへ戻る`}
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default Loading
