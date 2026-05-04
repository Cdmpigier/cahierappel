const express = require('express');
const router = express.Router();
const Message = require('../model/message');

router.get('/', async (req, res) => {
    const messages = await Message.find().populate('destinataireId');
    res.json(messages);
});
router.post('/', async (req, res) => {
    const msg = new Message(req.body);
    await msg.save();
    res.json(msg);
});
router.put('/:id', async (req, res) => {
    const msg = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(msg);
});
router.delete('/:id', async (req, res) => {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});
module.exports = router;