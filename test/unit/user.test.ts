import dotenv from 'dotenv';
import * as uuid from 'uuid';

dotenv.config();

import User from '../../src/models/User';
import MySQLDatabaseAccess from '../../src/database/MySQLDatabaseAccess';
import * as utils from '../utils';

jest.mock('../../src/database/MySQLDatabaseAccess.ts'); // comment this line to use the real database

describe('User model', () => {
  const mySQLDatabaseAccess = MySQLDatabaseAccess.getInstance();

  let testUser: utils.UserInfo;
  let createdUserId: number;

  beforeEach(async () => {
    testUser = await utils.createTestUser();
  });

  afterEach(async () => {
    await mySQLDatabaseAccess.deleteUser(testUser.id);
  });

  it('should create a new user', async () => {
    const userConfig = {
      userName: uuid.v4(),
      password: uuid.v4(),
      firstName: uuid.v4(),
      lastName: uuid.v4(),
      email: uuid.v4(),
    };

    const user = await User.create(userConfig);
    createdUserId = user.getId();

    const userRow = await mySQLDatabaseAccess.getUserById(createdUserId);
    expect(userRow).toMatchObject({
      id: expect.any(Number),
      userName: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
      passwordHash: expect.any(Buffer),
      passwordSalt: expect.any(Buffer),
    });
  });

  it('should get an existing user by id', async () => {
    const user = await User.findById(testUser.id);
    expect(user).toBeInstanceOf(User);
    expect(user).toMatchObject({
      id: testUser.id,
      userName: testUser.userName,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      email: testUser.email,
      passwordHash: expect.any(String),
      passwordSalt: expect.any(String),
      conversations: null,
    });
  });

  it('should get an existing user by userName', async () => {
    const user = await User.findByUserName(testUser.userName);
    expect(user).toBeInstanceOf(User);
    expect(user).toMatchObject({
      id: testUser.id,
      userName: testUser.userName,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      email: testUser.email,
      passwordHash: expect.any(String),
      passwordSalt: expect.any(String),
      conversations: null,
    });
  });

  it('should return null when searching for a nonexistent userId', async () => {
    const user = await User.findById(0);
    expect(user).toBeNull();
  });

  it('should return null when searching for a nonexistent userName', async () => {
    const user = await User.findByUserName(uuid.v4());
    expect(user).toBeNull();
  });

  it('should update an existing user', async () => {
    const user = await User.findById(testUser.id);
    const fieldsToUpdate = { firstName: uuid.v4() };
    await user?.update(fieldsToUpdate);
    expect(user?.getFirstName()).toEqual(fieldsToUpdate.firstName);
  });

  it('should throw an error when attempting to update a deleted user', async () => {
    const user = await User.findById(testUser.id);
    await user?.delete();

    try {
      const fieldsToUpdate = { firstName: uuid.v4() };
      await user?.update(fieldsToUpdate);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should delete an existing user', async () => {
    const user = await User.findById(testUser.id);
    await user?.delete();
    const userRow = await mySQLDatabaseAccess.getUserById(testUser.id);
    expect(userRow).toBeUndefined();
  });

  it('should throw an error when attempting to delete an already deleted user', async () => {
    const user = await User.findById(testUser.id);
    await user?.delete();

    const userRow = await mySQLDatabaseAccess.getUserById(testUser.id);
    expect(userRow).toBeUndefined();

    try {
      await user?.delete();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
