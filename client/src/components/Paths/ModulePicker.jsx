import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, FormGroup } from '@blueprintjs/core';
import { MultiSelect } from '@blueprintjs/select';

class ModulePicker extends Component {
  state = {
    selectedPath: 'default',
    selectedModules: []
  };

  get selectedModules() {
    return this.state.selectedModules.map(m => m._id);
  }

  setSelectedPath = (e) => {
    this.setState({ selectedPath: this.props.allPaths.find(p => p._id === e.currentTarget.value) });
  };

  isModuleSelected = m => this.state.selectedModules.find(mod => m._id === mod._id);

  selectModule = (module) => {
    this.setState(prevState => ({
      selectedModules: [...prevState.selectedModules, module]
    }));
  }

  deselectModule = (module) => {
    this.setState(prevState => ({
      selectedModules: prevState.selectedModules.filter(m => m._id !== module._id)
    }));
  }

  handleModuleSelect = (mod) => {
    const module = (mod._id) ? mod : { _id: mod.props.id, title: mod.props.children };
    if (!this.isModuleSelected(module)) return this.selectModule(module);
    return this.deselectModule(module);
  };

  renderModuleItem = (module, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) return null;
    return (
      <MenuItem
        active={modifiers.active}
        icon={this.isModuleSelected(module) ? 'tick' : null}
        key={module._id}
        onClick={handleClick}
        text={module.title}
        shouldDismissPopover={false}
      />
    );
  }

  renderModuleTag = module => <span id={module._id}>{module.title}</span>;

  render() {
    const { allPaths, pathsLoading } = this.props;
    const { selectedPath, selectedModules } = this.state;

    if (pathsLoading) return <p />;

    const $pathOptions = allPaths
      .sort((p1, p2) => p1.title.localeCompare(p2.title))
      .map(p => <option key={p._id} value={p._id}>{p.title}</option>);

    const allModules = selectedPath.modules || [];
    const modules = allModules
      .filter(module => !selectedModules.find(m => m._id === module._id))
      .sort((m1, m2) => m1.title.localeCompare(m2.title));

    return (
      <>
        <FormGroup label="Copy modules from learning path:" labelFor="path-list">
          <select
            id="path-list"
            value={selectedPath._id || 'default'}
            onChange={this.setSelectedPath}
            name="selectedPath"
            className="bp3-select bp3-fill"
          >
            <option value="default">-- no path selected --</option>
            { $pathOptions }
          </select>
        </FormGroup>
        { selectedPath !== 'default' && (
          <FormGroup label="Choose modules to copy to the new path" labelFor="module-list">
            <MultiSelect
              id="module-list"
              noResults={<MenuItem disabled text="No modules to show." />}
              items={modules}
              onItemSelect={this.handleModuleSelect}
              itemRenderer={this.renderModuleItem}
              tagRenderer={this.renderModuleTag}
              tagInputProps={{ onRemove: this.handleModuleSelect }}
              name="selectedModules"
              selectedItems={selectedModules}
            />
          </FormGroup>
        )}
      </>
    );
  }
}

ModulePicker.defaultProps = {
  allPaths: []
};

ModulePicker.propTypes = {
  allPaths: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    modules: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      _id: PropTypes.string.isRequired
    }))
  })),
  pathsLoading: PropTypes.bool.isRequired
};

export default ModulePicker;
