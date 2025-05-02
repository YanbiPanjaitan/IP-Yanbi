const request = require('supertest');
const app = require('../app');
const { hashPassword, comparePassword } = require('../helpers/bcrypt');
const { generateToken, verifyToken } = require('../helpers/jwt');

// Mock data for testing
const mockUser = {
  id: 1,
  username: 'testuser',
  password: 'password123',
};

// Tests for server routes
describe('Server Tests', () => {
  it('should respond with 302 on the root route', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(302);
  });

  it('should redirect to the expected location on the root route', async () => {
    const response = await request(app).get('/');
    expect(response.headers.location).toBe('/expected-location'); // Replace '/expected-location' with the actual redirect location
  });

  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.statusCode).toBe(404);
  });
});

// Tests for bcrypt helper
describe('Bcrypt Helper Tests', () => {
  it('should hash and compare passwords correctly', () => {
    const hashedPassword = hashPassword(mockUser.password);
    const isMatch = comparePassword(mockUser.password, hashedPassword);
    expect(isMatch).toBe(true);
  });
});

// Tests for JWT helper
describe('JWT Helper Tests', () => {
  it('should generate and verify tokens correctly', () => {
    const token = generateToken({ id: mockUser.id, username: mockUser.username });
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(mockUser.id);
    expect(decoded.username).toBe(mockUser.username);
  });
});