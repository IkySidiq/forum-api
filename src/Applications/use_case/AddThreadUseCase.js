const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute({ title, body, ownerId }) {
    const addThread = new AddThread({ title, body, ownerId });
    return this._threadRepository.addThread({ title: addThread.title, body: addThread.body, ownerId: addThread.ownerId });
  }
}

module.exports = AddThreadUseCase;
