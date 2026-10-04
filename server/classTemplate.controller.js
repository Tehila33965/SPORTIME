import { ClassTemplate } from '../models/classTemplate.model.js';

export const getAllClassTemplates = async (req, res, next) => {
    try {
        const templates = await ClassTemplate.find();
        res.json(templates);
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const getClassTemplate = async (req, res, next) => {
    try {
        const template = await ClassTemplate.findById(req.params.id);

        if (!template) {
            return next({ status: 404, error: new Error('Class template not found'), type: 'resource not found error' });
        }

        res.json(template);
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const addClassTemplate = async (req, res, next) => {
    try {
        const newTemplate = new ClassTemplate(req.body);
        await newTemplate.save();

        res.status(201).json(newTemplate);
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const updateClassTemplate = async (req, res, next) => {
    try {
        const template = await ClassTemplate.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );

        if (!template) {
            return next({ status: 404, error: new Error('Class template not found'), type: 'resource not found error' });
        }

        res.json(template);
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const deleteClassTemplate = async (req, res, next) => {
    try {
        const template = await ClassTemplate.findByIdAndDelete(req.params.id);

        if (!template) {
            return next({ status: 404, error: new Error('Class template not found'), type: 'resource not found error' });
        }

        res.status(204).send();
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};