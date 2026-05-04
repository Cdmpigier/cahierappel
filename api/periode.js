const express = require('express');
const router = express.Router();
const Periode = require('../model/periode');

router.get('/', async (req, res) => {
    const periodes = await Periode.find();
    res.json(periodes);
});
router.post('/', async (req, res) => {
    const periode = new Periode(req.body);
    await periode.save();
    res.json(periode);
});
router.delete('/:id', async (req, res) => {
    await Periode.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});
module.exports = router;