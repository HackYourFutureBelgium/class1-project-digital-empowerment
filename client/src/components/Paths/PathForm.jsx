import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Dialog, FormGroup, InputGroup
} from '@blueprintjs/core';
import APIComponent from '../APIComponent';
import ModulePicker from './ModulePicker';
import { IS_LOADING, INACTIVE } from '../../constants';

class PathForm extends APIComponent {
  constructor(props) {
    super(props);
    this.state = {
      title: props.path ? props.path.title : '',
      allPaths: [],
      requestStates: {
        getPaths: INACTIVE
      }
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isShown === false && this.props.isShown && this.props.withModulePicker) {
      this.fetchPathAndModuleNames();
    }
  }

  fetchPathAndModuleNames = () => {
    this.setRequestState({ getPaths: IS_LOADING });
    this.api.paths.getWithModules(['title'])
      .then((allPaths) => {
        this.setState({ allPaths });
        this.setRequestState({ getPaths: INACTIVE });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  setTitle = (e) => {
    this.setState({ title: e.currentTarget.value });
  }

  onSubmit = (e) => {
    e.preventDefault();

    const { title } = this.state;
    const { submit, path } = this.props;

    if (this.modulePicker && this.modulePicker.selectedModules.length !== 0) {
      return submit({ title, modules: this.modulePicker.selectedModules });
    }
    return path ? submit(path._id, { title }) : submit({ title });
  }

  render() {
    const {
      isShown, onClose, path, requestStatus, withModulePicker
    } = this.props;
    const { title, allPaths, requestStates } = this.state;

    const pathsLoading = requestStates.getPaths === IS_LOADING;

    return (
      <Dialog
        isOpen={isShown}
        onClose={onClose}
        className="dialog"
        title="New path name"
      >
        <div className="bp3-dialog-body path-form">
          <form onSubmit={this.onSubmit}>
            <FormGroup label="Title" labelFor="path-title" labelInfo="(required)">
              <InputGroup id="path-title" value={title} onChange={this.setTitle} />
            </FormGroup>
            { withModulePicker && (
              <ModulePicker
                ref={(c) => { this.modulePicker = c; }}
                allPaths={allPaths}
                pathsLoading={pathsLoading}
              />
            )}
            <div className="path-form__actions">
              <Button type="submit" intent="primary" loading={requestStatus === IS_LOADING}>
                {path ? 'update path' : 'create path'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    );
  }
}

PathForm.defaultProps = {
  path: null,
  withModulePicker: false
};

PathForm.propTypes = {
  isShown: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  path: PropTypes.shape({
    title: PropTypes.string
  }),
  requestStatus: PropTypes.number.isRequired,
  withModulePicker: PropTypes.bool
};

export default PathForm;
