import React, { Component } from 'react'
import auth from '../lib/auth'

class Nav extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
    }
  }
  componentDidMount() {
    this.auth = new auth(this)
    let $ = window.$
    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(function() {
      $('.navbar-collapse').collapse('hide')
    })

    // Activate scrollspy to add active class to navbar items on scroll
    $('body').scrollspy({
      target: '#mainNav',
      offset: 56,
    })

    // Collapse Navbar
    var navbarCollapse = function() {
      if ($('#mainNav').offset().top > 100) {
        $('#mainNav').addClass('navbar-shrink')
      } else {
        $('#mainNav').removeClass('navbar-shrink')
      }
    }
    // Collapse now if page is not at top
    navbarCollapse()
    // Collapse the navbar when page is scrolled
    $(window).scroll(navbarCollapse)
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
      if (
        window.location.pathname.replace(/^\//, '') ==
          this.pathname.replace(/^\//, '') &&
        window.location.hostname == this.hostname
      ) {
        var target = $(this.hash)
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']')
        if (target.length) {
          $('html, body').animate(
            {
              scrollTop: target.offset().top - 54,
            },
            1000,
            'easeInOutExpo'
          )
          return false
        }
      }
    })
  }
  login() {
    this.auth.login()
  }
  render() {
    let nav_items = []
    for (let v of this.props.items) {
      nav_items.push(
        <li className="nav-item">
          <a className="nav-link js-scroll-trigger" href={`#${v.id}`}>
            {v.name}
          </a>
        </li>
      )
    }
    let login_btn
    if (this.state.user === null) {
      login_btn = (
        <li className="nav-item">
          <a
            className="nav-link"
            onClick={() => {
              this.login()
            }}
          >
            ログイン
          </a>
        </li>
      )
    } else {
      login_btn = (
        <li className="nav-item" style={{ whiteSpace: 'nowrap' }}>
          <a href="/home/">
            <img
              title={this.state.user.displayName}
              src={this.state.user.photoURL}
              className="nav-user d-inline-block"
            />
          </a>
        </li>
      )
    }
    let site_title = `ALIS Hacker' Club`
    if (process.env.WAVES_NETWORK === 'TESTNET') {
      site_title = 'AHT TESTNET'
    }
    return (
      <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        id="mainNav"
      >
        <div className="container">
          <a className="navbar-brand js-scroll-trigger" href="#page-top">
            {site_title}
          </a>
          <button
            className="navbar-toggler navbar-toggler-right"
            type="button"
            data-toggle="collapse"
            data-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            メニュー
            <i className="fa fa-bars ml-2" />
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav text-uppercase ml-auto">
              {nav_items}
              <li className="nav-item">
                <a
                  className="nav-link js-scroll-trigger"
                  href="/rankings/alis/"
                >
                  ランキング
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link js-scroll-trigger" href="/magazines/">
                  共同マガジン
                </a>
              </li>
              {login_btn}
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}

export default Nav
