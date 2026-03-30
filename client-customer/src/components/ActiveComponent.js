import axios from "axios";
import React, { Component } from "react";
import { notifyError, notifySuccess, notifyWarning } from "../utils/notify";

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: "",
      txtToken: "",
    };
  }

  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">ACTIVE ACCOUNT</h2>

        <form>
          <table className="align-center">
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtID}
                    onChange={(e) => {
                      this.setState({ txtID: e.target.value });
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td>Token</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtToken}
                    onChange={(e) => {
                      this.setState({ txtToken: e.target.value });
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input
                    type="submit"
                    value="ACTIVE"
                    onClick={(e) => this.btnActiveClick(e)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  btnActiveClick(e) {
    e.preventDefault();

    const id = this.state.txtID;
    const token = this.state.txtToken;

    if (id && token) {
      this.apiActive(id, token);
    } else {
      notifyWarning("Vui lòng nhập ID và token.");
    }
  }

  apiActive(id, token) {
    const body = { id: id, token: token };

    axios.post("/api/customer/active", body).then((res) => {
      const result = res.data;

      if (result) {
        notifySuccess("Kích hoạt tài khoản thành công.");
      } else {
        notifyError("Kích hoạt thất bại. Kiểm tra lại ID và token.");
      }
    });
  }
}

export default Active;
