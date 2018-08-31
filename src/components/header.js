import React, { Component } from 'react'

class HTML extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <header
        className="masthead"
        style={{ backgroundPosition: 'bottom', position: 'relative' }}
      >
        <div className="container" style={{ zIndex: 100 }}>
          <div className="intro-text">
            <div className="intro-lead-in">ALIS HackerToken</div>
            <div className="intro-heading text-uppercase mb-3">
              法定通貨に依存しない完全独自経済圏
            </div>
            <div className="m-4">
              <b>
                学習と創造活動によって価値を生みだし、好きな事を追求するだけで生きていける世界を創造
              </b>
            </div>
            <a
              className="btn btn-primary btn-xl text-uppercase js-scroll-trigger"
              href="#vision"
              style={{ color: 'steelblue' }}
            >
              経済圏は共同幻想が創る
            </a>
          </div>
        </div>
      </header>
    )
  }
}

export default HTML
