// Part 1: Define Sequelize Models and Implement Requirements
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:'); // Example database connection

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    validate: {
      len: {
        args: [3],
        msg: 'Name must be at least 3 characters long.',
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Email must be valid.',
      },
    },
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  hooks: {
    beforeCreate: (user) => {
      if (user.name.length <= 2) {
        throw new Error('Name must be greater than 2 characters.');
      }
    },
  },
});

// Post Model
const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  paranoid: true, // Enable soft delete
});

// Comment Model
const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: DataTypes.TEXT,
  postId: {
    type: DataTypes.INTEGER,
    references: {
      model: Post,
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
});

// Custom validation for password length
User.prototype.checkPasswordLength = function (password) {
  if (password.length <= 6) {
    throw new Error('Password length must be greater than 6 characters.');
  }
};

(async () => {
  try {
    await sequelize.sync({ force: true }); // Sync database
    console.log('Database synced!');

    // Add sample usage or test cases if needed

  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();

// Part 2: APIs (Basic folder structure and functionality)
const express = require('express');
const app = express();
app.use(express.json());

// User APIs
app.post('/users/signup', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).send('Email already exists.');
    }

    const user = User.build({ name, email, role });
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).send('User not found.');
    }

    await user.update({ name, email, role }, { validate: false });
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// More API implementations can follow similar patterns for posts and comments

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
