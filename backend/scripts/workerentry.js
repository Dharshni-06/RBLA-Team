// Architect: SP
const mongoose = require('mongoose');
const Worker = require('../models/Worker');
require('dotenv').config();

const workers = [
    // Varnam Store Workers
    {
        name: "Rajesh Kumar",
        age: 28,
        phoneNo: "9876543210",
        address: "123, Anna Nagar, Chennai",
        role: "Sales Associate",
        store: "Varnam",
        aadharNo: "1234 5678 9012"
    },
    {
        name: "Priya Sharma",
        age: 25,
        phoneNo: "9876543211",
        address: "45, Gandhi Street, Chennai",
        role: "Cashier",
        store: "Varnam",
        aadharNo: "2345 6789 0123"
    },
    {
        name: "Anand Raj",
        age: 32,
        phoneNo: "9876543212",
        address: "78, West Mambalam, Chennai",
        role: "Store Manager",
        store: "Varnam",
        aadharNo: "3456 7890 1234"
    },
    {
        name: "Lakshmi Devi",
        age: 27,
        phoneNo: "9876543213",
        address: "90, T Nagar, Chennai",
        role: "Sales Associate",
        store: "Varnam",
        aadharNo: "4567 8901 2345"
    },
    {
        name: "Karthik Rajan",
        age: 30,
        phoneNo: "9876543214",
        address: "34, KK Nagar, Chennai",
        role: "Inventory Manager",
        store: "Varnam",
        aadharNo: "5678 9012 3456"
    },
    {
        name: "Meena Kumari",
        age: 26,
        phoneNo: "9876543215",
        address: "56, Ashok Nagar, Chennai",
        role: "Sales Associate",
        store: "Varnam",
        aadharNo: "6789 0123 4567"
    },
    {
        name: "Suresh Kumar",
        age: 29,
        phoneNo: "9876543216",
        address: "89, Vadapalani, Chennai",
        role: "Cashier",
        store: "Varnam",
        aadharNo: "7890 1234 5678"
    },
    {
        name: "Divya Prakash",
        age: 24,
        phoneNo: "9876543217",
        address: "12, Kodambakkam, Chennai",
        role: "Sales Associate",
        store: "Varnam",
        aadharNo: "8901 2345 6789"
    },
    {
        name: "Ramesh Babu",
        age: 35,
        phoneNo: "9876543218",
        address: "67, Saidapet, Chennai",
        role: "Security",
        store: "Varnam",
        aadharNo: "9012 3456 7890"
    },
    {
        name: "Shalini Raja",
        age: 28,
        phoneNo: "9876543219",
        address: "23, Guindy, Chennai",
        role: "Sales Associate",
        store: "Varnam",
        aadharNo: "0123 4567 8901"
    },

    // Sirugugal Store Workers
    {
        name: "Manoj Kumar",
        age: 31,
        phoneNo: "9876543220",
        address: "45, Main Road, Sirugugal",
        role: "Store Manager",
        store: "Sirugugal",
        aadharNo: "1111 2222 3333"
    },
    {
        name: "Sangeetha Ravi",
        age: 27,
        phoneNo: "9876543221",
        address: "78, Temple Street, Sirugugal",
        role: "Cashier",
        store: "Sirugugal",
        aadharNo: "2222 3333 4444"
    },
    {
        name: "Vijay Kumar",
        age: 29,
        phoneNo: "9876543222",
        address: "90, Market Road, Sirugugal",
        role: "Sales Associate",
        store: "Sirugugal",
        aadharNo: "3333 4444 5555"
    },
    {
        name: "Kavitha Mohan",
        age: 26,
        phoneNo: "9876543223",
        address: "12, School Street, Sirugugal",
        role: "Sales Associate",
        store: "Sirugugal",
        aadharNo: "4444 5555 6666"
    },
    {
        name: "Senthil Kumar",
        age: 33,
        phoneNo: "9876543224",
        address: "34, College Road, Sirugugal",
        role: "Inventory Manager",
        store: "Sirugugal",
        aadharNo: "5555 6666 7777"
    },
    {
        name: "Revathi Suresh",
        age: 25,
        phoneNo: "9876543225",
        address: "56, Railway Road, Sirugugal",
        role: "Sales Associate",
        store: "Sirugugal",
        aadharNo: "6666 7777 8888"
    },
    {
        name: "Prakash Raja",
        age: 30,
        phoneNo: "9876543226",
        address: "89, Bus Stand Road, Sirugugal",
        role: "Security",
        store: "Sirugugal",
        aadharNo: "7777 8888 9999"
    },
    {
        name: "Geetha Krishnan",
        age: 28,
        phoneNo: "9876543227",
        address: "23, Park Road, Sirugugal",
        role: "Sales Associate",
        store: "Sirugugal",
        aadharNo: "8888 9999 0000"
    },
    {
        name: "Murugan Vel",
        age: 34,
        phoneNo: "9876543228",
        address: "67, Hospital Road, Sirugugal",
        role: "Sales Associate",
        store: "Sirugugal",
        aadharNo: "9999 0000 1111"
    },
    {
        name: "Saranya Rajan",
        age: 27,
        phoneNo: "9876543229",
        address: "45, Church Street, Sirugugal",
        role: "Cashier",
        store: "Sirugugal",
        aadharNo: "0000 1111 2222"
    },

    // Vaagai Store Workers
    {
        name: "Arun Kumar",
        age: 32,
        phoneNo: "9876543230",
        address: "78, Main Street, Vaagai",
        role: "Store Manager",
        store: "Vaagai",
        aadharNo: "2468 1357 9024"
    },
    {
        name: "Deepa Shankar",
        age: 26,
        phoneNo: "9876543231",
        address: "90, Temple Road, Vaagai",
        role: "Sales Associate",
        store: "Vaagai",
        aadharNo: "1357 9024 6802"
    },
    {
        name: "Bala Murugan",
        age: 29,
        phoneNo: "9876543232",
        address: "12, Market Street, Vaagai",
        role: "Inventory Manager",
        store: "Vaagai",
        aadharNo: "9024 6802 1357"
    },
    {
        name: "Uma Maheshwari",
        age: 27,
        phoneNo: "9876543233",
        address: "34, School Road, Vaagai",
        role: "Cashier",
        store: "Vaagai",
        aadharNo: "6802 1357 9024"
    },
    {
        name: "Gopal Krishnan",
        age: 31,
        phoneNo: "9876543234",
        address: "56, College Street, Vaagai",
        role: "Sales Associate",
        store: "Vaagai",
        aadharNo: "8024 1357 6902"
    },
    {
        name: "Radha Lakshmi",
        age: 25,
        phoneNo: "9876543235",
        address: "89, Railway Street, Vaagai",
        role: "Sales Associate",
        store: "Vaagai",
        aadharNo: "7024 1358 6902"
    },
    {
        name: "Siva Kumar",
        age: 33,
        phoneNo: "9876543236",
        address: "23, Bus Stand Street, Vaagai",
        role: "Security",
        store: "Vaagai",
        aadharNo: "5024 1357 8902"
    },
    {
        name: "Mala Ravi",
        age: 28,
        phoneNo: "9876543237",
        address: "67, Park Street, Vaagai",
        role: "Sales Associate",
        store: "Vaagai",
        aadharNo: "4024 1357 9802"
    },
    {
        name: "Kumar Swamy",
        age: 30,
        phoneNo: "9876543238",
        address: "45, Hospital Street, Vaagai",
        role: "Sales Associate",
        store: "Vaagai",
        aadharNo: "3024 1357 9602"
    },
    {
        name: "Vani Priya",
        age: 26,
        phoneNo: "9876543239",
        address: "78, Church Road, Vaagai",
        role: "Cashier",
        store: "Vaagai",
        aadharNo: "2024 1357 9402"
    }
];

const insertWorkers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Delete existing workers
        await Worker.deleteMany({});
        console.log('Existing workers cleared');

        // Insert new workers
        const result = await Worker.insertMany(workers);
        console.log(`Successfully inserted ${result.length} workers`);

        console.log('\nWorkers by store:');
        const stores = ['Varnam', 'Sirugugal', 'Vaagai'];
        for (const store of stores) {
            const count = await Worker.countDocuments({ store });
            console.log(`${store}: ${count} workers`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

insertWorkers();
