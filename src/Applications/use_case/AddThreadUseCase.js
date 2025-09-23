const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute({ title, body, ownerId }) {
    const addThreadChecked = new AddThread({ title, body, ownerId });
    return this._threadRepository.addThread({ 
      title: addThreadChecked.title, 
      body: addThreadChecked.body, 
      ownerId: addThreadChecked.ownerId, 
    });
  }
}

module.exports = AddThreadUseCase;
