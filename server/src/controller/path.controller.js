const mongoose = require('mongoose');
const Path = require('../model/path.model');
const Module = require('../model/module.model');

exports.findAll = (req, res) => {
  Path.find()
    .then((modules) => { res.send(modules); })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.findOne = (req, res) => {
  Path.findById(req.params.pathId)
    .populate('modules')
    .then((path) => { res.send(path); })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.create = async (req, res) => {
  const newPath = new Path(req.body);
  if (newPath.modules.length > 0) {
    newPath.modules = await Promise.all(newPath.modules.map(async (moduleId) => {
      const mod = await Module.findById(moduleId);
      if (!mod) return null;
      mod._id = mongoose.Types.ObjectId();
      mod.isNew = true;
      const newMod = new Module(mod);
      await newMod.save();
      return newMod._id;
    }));
  }

  newPath
    .save()
    .then((data) => { res.send(data); })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.index = async (req, res) => {
  const moduleFields = req.query.fields ? req.query.fields.split(',') : [];
  const paths = await Path.find().populate('modules', `_id ${moduleFields.join(' ')}`);
  res.send(paths);
};

exports.update = (req, res) => {
  const { pathId } = req.params;
  const action = Path.findOneAndUpdate({ _id: pathId }, req.body, { new: true });
  if (req.body.modules && typeof req.body.modules[0] !== 'string') action.populate('modules');
  action
    .then(path => res.send(path))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.delete = (req, res) => {
  const { pathId } = req.params;
  Path.findOneAndDelete({ _id: pathId })
    .then(() => res.status(204).send({ message: 'Path deleted successfully!' }))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.addModuleToPath = async (pathId, moduleId) => {
  const path = await Path.findById(pathId);
  path.modules.push(moduleId);
  await path.save();
  Path.findOneAndUpdate({ _id: pathId }, path, { new: true });
};
