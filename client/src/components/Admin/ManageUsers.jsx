import React from 'react';
import PropTypes from 'prop-types';
import {
  NonIdealState, InputGroup, Button, Tag
} from '@blueprintjs/core';
import NProgress from 'nprogress';
import APIComponent from '../APIComponent';
import Header from '../Header';
import UserRow from './UserRow';
import UserForm from './UserForm';
import { IS_LOADING, INACTIVE, HAS_ERRORED } from '../../constants';
import User from '../../models/User';

import '../../assets/css/users.css';

class ManageUsers extends APIComponent {
  state = {
    users: [],
    searchQuery: '',
    creatingUser: false,
    requestStates: {
      fetchUsers: IS_LOADING,
      createUser: INACTIVE
    }
  };

  constructor(props) {
    super(props);
    document.title = 'Manage users | Digital Empowerment';
    NProgress.start();
  }

  componentDidMount() {
    this.api.users.get()
      .then(async (users) => {
        await this.setState({ users: users.map(u => new User(u)) || [] });
        this.setRequestState({ fetchUsers: INACTIVE });
      })
      .catch(() => this.setRequestState({ fetchUsers: HAS_ERRORED }))
      .finally(() => NProgress.done());
  }

  createUser = async (user) => {
    await this.setRequestState({ createUser: IS_LOADING });
    return this.api.users.create(user).then(async (newUser) => {
      await this.setState(previousState => ({
        users: [...previousState.users, new User(newUser)],
        creatingUser: false
      }));
      this.setRequestState({ createUser: INACTIVE });
    }).catch(() => {
      this.setRequestState({ createUser: HAS_ERRORED });
    });
  }

  updateUser = updatedUser => (
    this.setState((previousState) => {
      const users = [...previousState.users];
      const index = users.findIndex(u => u._id === updatedUser._id);
      users[index] = updatedUser;
      return { users };
    })
  );

  deleteUser = userId => (
    this.setState((previousState) => {
      const users = [...previousState.users].filter(u => u._id !== userId);
      return { users };
    })
  );

  search = (e) => {
    this.setState({ searchQuery: e.target.value });
  }

  clearSearch = () => {
    if (this.searchInput) this.searchInput.value = '';
    this.setState({ searchQuery: '' });
  }

  startUserCreation = () => {
    this.setState({ creatingUser: true });
  }

  cancelUserCreation = () => {
    this.setState({ creatingUser: false });
  }

  renderEmptyState = () => (
    <NonIdealState
      title="No users yet"
      description={(<p>You are the only user so far.</p>)}
      action={<Button type="button" intent="primary" onClick={this.startUserCreation}>create another one</Button>}
    />
  )

  renderEmptySearchState = () => (
    <NonIdealState
      title="No results"
      icon="search"
      description={(<p>There are no emails or user roles that match your search.</p>)}
      action={<Button type="button" intent="primary" onClick={this.clearSearch}>clear search</Button>}
    />
  )

  renderErrorState = () => (
    <NonIdealState
      title="Something went wrong"
      icon="error"
      description={(
        <p>
          A problem occurred while fetching users. This is
          likely due to a problem with your internet connection.<br />
        </p>
      )}
    />
  )

  renderUser = user => (
    <UserRow
      key={user.id}
      user={user}
      updateUser={this.updateUser}
      deleteUser={this.deleteUser}
    />
  );

  render() {
    const {
      users, creatingUser, searchQuery, requestStates
    } = this.state;
    const { user: currentUser } = this.props;

    if (requestStates.fetchUsers === IS_LOADING) return <p />;

    const filteredUsers = users.filter((user) => {
      const { email, role } = user;
      return (email.toLowerCase().includes(searchQuery.toLowerCase())
        || role.toLowerCase().includes(searchQuery.toLowerCase()))
        && user.email !== currentUser.email;
    });

    let $nonIdealState;
    if (users.length <= 1) $nonIdealState = this.renderEmptyState();
    else if (filteredUsers.length === 0) $nonIdealState = this.renderEmptySearchState();
    else if (requestStates.fetchUsers === HAS_ERRORED) $nonIdealState = this.renderErrorState();

    const $users = filteredUsers.map(this.renderUser);

    return (
      <div className="container user-container">
        <Header user={currentUser} />
        <UserForm
          requestStatus={requestStates.createUser}
          isShown={creatingUser}
          onClose={this.cancelUserCreation}
          submit={this.createUser}
        />
        <header className="user-container__header">
          <h2>Active users</h2>
          <div className="user-container__header__actions">
            <Button type="button" icon="plus" intent="primary" onClick={this.startUserCreation}>invite user</Button>
            <InputGroup
              rightElement={(<Tag minimal round>{filteredUsers.length}</Tag>)}
              type="search"
              leftIcon="search"
              onChange={this.search}
              inputRef={(c) => { this.searchInput = c; }}
            />
          </div>
        </header>
        {$nonIdealState}
        {!$nonIdealState && (
          <table className="bp3-interactive bp3-html-table-striped bp3-html-table users">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {$users}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

ManageUsers.propTypes = {
  user: PropTypes.instanceOf(User).isRequired
};

export default ManageUsers;
