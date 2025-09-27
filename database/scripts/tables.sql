CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL
);

CREATE TABLE websites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  url VARCHAR(1024) NOT NULL,
  status VARCHAR(50) NOT NULL,
  crawlDepth INT NOT NULL DEFAULT 1,
  pagesIndexed INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE website_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  websiteId INT NOT NULL,
  content TEXT NOT NULL,
  title VARCHAR(255),
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (websiteId) REFERENCES websites(id)
);

CREATE TABLE templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  variables JSON,
  enableAI BOOLEAN DEFAULT FALSE,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  messagesSent INT NOT NULL DEFAULT 0,
  responsesReceived INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  phoneNumbers JSON,
  scheduledFor DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  campaignId INT,
  phoneNumber VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  lastMessageAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  customerName VARCHAR(255),
  aiEnabled BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id)
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  sender VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'sent',
  createdAt DATETIME NOT NULL,
  messageType VARCHAR(50) NOT NULL DEFAULT 'text',
  whatsappMessageId VARCHAR(255),
  FOREIGN KEY (conversationId) REFERENCES conversations(id)
);

INSERT INTO users (id, username, password, email, name, createdAt)
VALUES (1, 'demo', 'demo123', 'demo@example.com', 'Demo User', NOW());