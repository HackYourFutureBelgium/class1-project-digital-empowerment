import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faClone } from '@fortawesome/free-solid-svg-icons';
import * as api from '../../api/paths';

import '../../assets/css/paths.css';

class Paths extends Component {
  state = {
    paths: [],
    searchQuery: ''
  };

  async componentDidMount() {
    const paths = await api.getPaths().catch(err => console.error(err));
    this.setState({ paths });
  }

  choosePath = (path) => {
    this.props.history.push(`/paths/${path._id}`);
  }

  search = (e) => {
    this.setState({ searchQuery: e.currentTarget.value });
  }

  createPath = () => {

  }

  updatePath = () => {

  }

  deletePath = (path) => {

  }

  duplicatePath = (path) => {

  }

  showPathForm = () => {

  }

  renderPath = (path) => {
    return (
      <article className="paths paths__path-wrapper" key={path._id}>
        <button type="button" onClick={() => this.choosePath(path)} className="path button--seamless">
          {path.title}
          <div className="paths__actions">
            <i><FontAwesomeIcon icon={faClone} onClick={this.duplicatePath} /></i>
            <i><FontAwesomeIcon icon={faEdit} onClick={this.showPathForm} /></i>
            <i><FontAwesomeIcon icon={faTrash} onClick={this.promptConfirmDeletion} /></i>
          </div>
        </button>
      </article>
    );
  }

  render() {
    const { paths, searchQuery } = this.state;

    const $paths = paths
      .filter(path => path.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(this.renderPath);

    return (
      <main className="container path-container">
        <header className="path-container__header">
          <h2>Using a web browser</h2>
          <div className="path-container__header__actions">
            <button type="button" className="button" onClick={this.createPath}>Add path</button>
            <input type="search" className="input" onChange={this.search} value={searchQuery} placeholder="search for paths" />
          </div>
        </header>
        <div className="paths">
          {$paths}
        </div>
      </main>
    );
  }
}

Paths.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired
};

export default withRouter(Paths);
