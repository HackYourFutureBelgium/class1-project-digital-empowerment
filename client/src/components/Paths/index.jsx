import React from 'react';
import PropTypes from 'prop-types';
import {
  NonIdealState, InputGroup, Button, Tag
} from '@blueprintjs/core';
import { withRouter } from 'react-router-dom';
import NProgress from 'nprogress';
import APIComponent from '../APIComponent';
import Header from '../Header';
import Path from './Path';
import PathForm from './PathForm';
import { IS_LOADING, INACTIVE, HAS_ERRORED } from '../../constants';

import '../../assets/css/paths.css';

class Paths extends APIComponent {
  state = {
    paths: [],
    searchQuery: '',
    creatingPath: false,
    requestStates: {
      fetchPaths: IS_LOADING,
      createPath: INACTIVE
    }
  };

  constructor(props) {
    super(props);
    document.title = 'Learning paths | Digital Empowerment';
    NProgress.start();
  }

  componentDidMount() {
    this.api.paths.get()
      .then(async (paths) => {
        await this.setState({ paths: paths || [] });
        await this.setRequestState({ fetchPaths: INACTIVE });
      })
      .catch(() => this.setRequestState({ fetchPaths: HAS_ERRORED }))
      .finally(() => NProgress.done());
  }

  choosePath = (path) => {
    this.props.history.push(`/paths/${path._id}`);
  }

  search = (e) => {
    this.setState({ searchQuery: e.target.value });
  }

  clearSearch = () => {
    if (this.searchInput) this.searchInput.value = '';
    this.setState({ searchQuery: '' });
  }

  createPath = async (path) => {
    await this.setRequestState({ createPath: IS_LOADING });
    return this.api.paths.create(path).then((newPath) => {
      this.setState(previousState => ({
        paths: [...previousState.paths, newPath],
        creatingPath: false
      }));
    }).catch(() => {
      this.setRequestState({ createPath: HAS_ERRORED });
    });
  }

  updatePath = updatedPath => (
    this.setState((previousState) => {
      const paths = [...previousState.paths];
      const index = paths.findIndex(p => p._id === updatedPath._id);
      paths[index] = updatedPath;
      return { paths };
    })
  );

  deletePath = pathId => (
    this.setState((previousState) => {
      const paths = [...previousState.paths].filter(p => p._id !== pathId);
      return { paths };
    })
  );

  duplicatePath = (path) => {
    const { title, modules } = path;
    return this.createPath({ title, modules });
  }

  startPathCreation = () => {
    this.setState({ creatingPath: true });
  }

  cancelPathCreation = () => {
    this.setState({ creatingPath: false });
  }

  renderPath = path => (
    <Path
      key={path._id}
      path={path}
      choose={this.choosePath}
      update={this.updatePath}
      delete={this.deletePath}
      duplicate={this.duplicatePath}
      user={this.props.user}
    />
  );

  renderEmptyState = () => (
    <NonIdealState
      title="No paths yet"
      description={(
        <p>
          No learning paths have been added yet.<br />
          { this.props.user
            ? 'As soon as you create one, it will displayed here.'
            : 'As soon as one is created, it will be displayed here.'
          }
        </p>
      )}
      action={this.props.user ? <Button type="button" intent="primary" onClick={this.startPathCreation}>create one now</Button> : undefined}
    />
  )

  renderEmptySearchState = () => (
    <NonIdealState
      title="No results"
      icon="search"
      description={(<p>There are no paths that match your search.</p>)}
      action={<Button type="button" intent="primary" onClick={this.clearSearch}>clear search</Button>}
    />
  )

  renderErrorState = () => (
    <NonIdealState
      title="Something went wrong"
      icon="error"
      description={(
        <p>
          A problem occurred while fetching learning paths. This is
          likely due to a problem with your internet connection.<br />
        </p>
      )}
    />
  )

  render() {
    const {
      paths, searchQuery, creatingPath, requestStates
    } = this.state;
    const { user } = this.props;

    if (requestStates.fetchPaths === IS_LOADING) return <p />;

    const filteredPaths = paths.filter(path => (
      path.title.toLowerCase().includes(searchQuery.toLowerCase())
    ));

    let $nonIdealState;
    if (paths.length === 0) $nonIdealState = this.renderEmptyState();
    else if (filteredPaths.length === 0) $nonIdealState = this.renderEmptySearchState();
    else if (requestStates.fetchPaths === HAS_ERRORED) $nonIdealState = this.renderErrorState();

    const $paths = filteredPaths.map(this.renderPath);

    return (
      <main className="container path-container">
        <Header user={user} />
        <header className="path-container__header">
          <h2>Learning paths</h2>
          <div className="path-container__header__actions">
            { user && (
              <Button type="button" icon="plus" intent="primary" onClick={this.startPathCreation}>new path</Button>
            )}
            <InputGroup
              rightElement={(<Tag minimal round>{filteredPaths.length}</Tag>)}
              type="search"
              leftIcon="search"
              onChange={this.search}
              inputRef={(c) => { this.searchInput = c; }}
            />
          </div>
        </header>
        <PathForm
          requestStatus={requestStates.createPath}
          isShown={creatingPath}
          onClose={this.cancelPathCreation}
          submit={this.createPath}
          withModulePicker
        />
        { $nonIdealState }
        <div className="paths">
          {$paths}
        </div>
      </main>
    );
  }
}

Paths.defaultProps = {
  user: null
};

Paths.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
  user: PropTypes.shape({})
};

export default withRouter(Paths);
