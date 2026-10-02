const mongoose = require('mongoose');

async function check() {
    await mongoose.connect('mongodb://127.0.0.1:27017/instaatrim');
    const Category = require('./backend/models/Category');
    const Salon = require('./backend/models/Salon');

    const cats = await Category.find({});
    console.log('Categories:', cats.map(c => ({ id: c._id.toString(), name: c.name, slug: c.slug })));

    const salons = await Salon.find({});
    console.log('Salons:', salons.map(s => ({ id: s._id.toString(), name: s.name, category: s.category })));

    process.exit(0);
}

check();
