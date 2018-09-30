import React, { Component } from 'react'

class Modal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modal: {},
    }
  }
  render() {
    let modal = this.props.modal
    let btn_exec
    if (this.props.modal.exec != undefined) {
      btn_exec = (
        <button
          id="modal_exec_btn"
          type="button"
          className={`btn btn-${this.props.modal.exec_color || 'danger'}`}
          onClick={() => {
            if (!window.$('#modal_exec_btn').hasClass('btn-gray') === true) {
              window.$('#pageModal').modal('hide')

              this.props.modal.exec()
            }
          }}
        >
          {this.props.modal.exec_text || '実行'}
        </button>
      )
    }
    return (
      <div
        className="modal fade"
        id="pageModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                {modal.title}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body" style={{ wordBreak: 'break-all' }}>
              {modal.body}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                {modal.cancel_text || '取り消し'}
              </button>
              {btn_exec}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
