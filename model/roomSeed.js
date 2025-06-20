const mongoose = require('mongoose');
const Kaksh = require('./roomSchema'); // Importing the schema
const roomData = require('./dummydata'); // Importing pre-defined room data

mongoose.connect('mongodb://127.0.0.1:27017/kaksh', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ Connection error:"));
db.once("open", () => {
    console.log("✅ Connected to MongoDB");
});

// Function to add a random image for each room
const addImages = data => {
    return data.map(room => ({
        ...room,
        author:'680dc0e5566bce56bf92e770',
        images:[{
            url:'https://res.cloudinary.com/dwhqwk94a/image/upload/v1748264401/kaksh-uploads/jdhyjwisgwjpa8agnxky.jpg',
         filename: 'kaksh-uploads/jdhyjwisgwjpa8agnxky',}]
    }));
};

// Seed function
const seedDB = async () => {
    try {
        await Kaksh.deleteMany({});
        console.log("🗑 Old room data cleared!");

        const roomsWithImages = addImages(roomData);

        await Kaksh.insertMany(roomsWithImages);
        console.log("✅ Room data inserted successfully!");

        mongoose.connection.close();
        console.log("🔌 Database connection closed.");
    } catch (err) {
        console.error("❌ Error seeding database:", err);
    }
};

// Run the seeding function
seedDB();
