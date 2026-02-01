const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');
const File = require('../models/File');
const multer = require('multer');
const path = require('path');
const summaryController = require('../controllers/summary.controller');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        // Reject hidden files and system files
        if (file.originalname.startsWith('.') || 
            file.originalname === '.gitignore' ||
            file.originalname === '.env' ||
            file.originalname.includes('node_modules')) {
            return cb(new Error('Invalid file type'), false);
        }
        cb(null, true);
    }
});

// Middleware to protect routes
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        if (!user) throw new Error();
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Health Check Route
router.get('/', (req, res) => {
    res.send({ 
        message: 'Virtual Study Group API is running',
        timestamp: new Date().toISOString(),
        routes: [
            'POST /api/signup',
            'POST /api/login', 
            'POST /api/forgot-password',
            'GET /api/groups',
            'POST /api/groups',
            'POST /api/summarize'
        ]
    });
});

// Auth Routes
router.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
        res.status(201).send({ user, token });
    } catch (e) {
        console.error('Signup Error:', e);
        if (e.code === 11000 && e.keyPattern?.email) {
            res.status(400).send({ error: 'Email already exists' });
        } else {
            res.status(400).send({ error: e.message || 'Signup failed' });
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !(await user.comparePassword(req.body.password))) {
            return res.status(400).send({ error: 'Invalid login credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
        res.send({ user, token });
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        const token = Math.random().toString(36).slice(-8); // Simplified token
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In a real app, send an email. For now, return it in the response for demo.
        res.send({ message: 'Reset token generated', token });
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).send({ error: 'Password reset token is invalid or has expired' });
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.send({ message: 'Password has been reset' });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Group Routes
router.post('/groups', auth, async (req, res) => {
    try {
        const group = new Group({ ...req.body, createdBy: req.user._id, members: [req.user._id] });
        await group.save();
        res.status(201).send(group);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/groups', auth, async (req, res) => {
    try {
        const groups = await Group.find({}).populate('createdBy', 'name');
        res.send(groups);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/groups/:id/join', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group.members.includes(req.user._id)) {
            group.members.push(req.user._id);
            await group.save();
        }
        res.send(group);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Chat & Files
router.get('/groups/:id/messages', auth, async (req, res) => {
    try {
        const messages = await Message.find({ group: req.params.id }).populate('sender', 'name');
        res.send(messages);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/groups/:id/messages', auth, async (req, res) => {
    try {
        const message = new Message({ ...req.body, group: req.params.id, sender: req.user._id });
        await message.save();
        res.status(201).send(message);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/groups/:id/upload', auth, upload.single('file'), async (req, res) => {
    try {
        const file = new File({
            group: req.params.id,
            uploadedBy: req.user._id,
            fileName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            fileSize: req.file.size,
            fileType: req.file.mimetype
        });
        await file.save();
        res.status(201).send(file);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/groups/:id/files', auth, async (req, res) => {
    try {
        const files = await File.find({ group: req.params.id }).populate('uploadedBy', 'name');
        res.send(files);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Summary Route
router.post('/summarize', auth, summaryController.summarize);

module.exports = router;
