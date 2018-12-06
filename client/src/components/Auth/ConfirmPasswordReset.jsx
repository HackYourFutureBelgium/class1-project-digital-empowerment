import React from 'react';
import {
  FormGroup, InputGroup, Button, Card, Icon
} from '@blueprintjs/core';
import NProgress from 'nprogress';
import APIComponent from '../APIComponent';
import { IS_LOADING, INACTIVE, HAS_ERRORED } from '../../constants';
import Header from '../Header';
import * as api from '../../api/users';

import '../../assets/css/password-reset.css';

class ConfirmPasswordReset extends APIComponent {
  state = {
    password: '',
    confirmationPassword: '',
    passwordHasBeenReset: false,
    error: null,
    requestStates: {
      confirmPasswordReset: INACTIVE
    }
  };

  constructor(props) {
    super(props);
    NProgress.start();
  }

  componentDidMount() {
    NProgress.done();
  }

  setField = (e) => {
    this.setState({ [e.currentTarget.name]: e.currentTarget.value });
  }

  confirmPasswordReset = (e) => {
    e.preventDefault();
    const { password, confirmationPassword } = this.state;
    if (password !== confirmationPassword) return this.setState({ error: 'Your passwords don\'t match' });

    this.setState({ error: null });
    this.setRequestState({ confirmPasswordReset: IS_LOADING });

    const { token } = this.props.match.params;
    return api.confirmPasswordReset(token, password)
      .then(() => {
        this.setState({ passwordHasBeenReset: true });
        this.setRequestState({ confirmPasswordReset: INACTIVE });
      })
      .catch(() => this.setRequestState({ confirmPasswordReset: HAS_ERRORED }));
  }

  render() {
    const {
      requestStates, password, confirmationPassword, error, passwordHasBeenReset
    } = this.state;

    const resetLoading = requestStates.confirmPasswordReset === IS_LOADING;

    return (
      <Card elevation={2} className="password-reset">
        <Header />
        <form onSubmit={this.confirmPasswordReset}>
          <h4 className="password-reset__title">Reset your password</h4>
          <FormGroup label="New password" labelFor="password">
            <InputGroup type="password" id="password" name="password" value={password} onChange={this.setField} required />
          </FormGroup>
          <FormGroup label="Confirm new password" labelFor="confirm-password">
            <InputGroup type="password" id="confirm-password" name="confirmationPassword" value={confirmationPassword} onChange={this.setField} required />
          </FormGroup>
          { error && <p className="danger">{error}</p>}
          {passwordHasBeenReset
            ? <p className="success"><Icon icon="tick-circle" />Your password was reset and you can now use it to login.</p>
            : <Button type="submit" intent="primary" loading={resetLoading}>update password</Button>
          }
        </form>
      </Card>
    );
  }
}

export default ConfirmPasswordReset;