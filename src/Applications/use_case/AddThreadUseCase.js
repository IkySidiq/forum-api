const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute({ title, body, ownerId }) {
    new AddThread({ title, body, ownerId });
    return this._threadRepository.addThread({ title, body, ownerId });
  }
}

module.exports = AddThreadUseCase;
