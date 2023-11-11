const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const RegisteredThread = require('../../Domains/threads/entities/RegisteredThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(registerThread) {
    const { title, body, owner } = registerThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, owner, date],
    };

    const result = await this._pool.query(query);

    return new RegisteredThread({ ...result.rows[0] });
  }

  async verifyAvailableThread(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('thread tidak tersedia');
    }
  }

  async getThreadById(id) {
    const query = {
      text: `
        SELECT threads.id, threads.title, threads.body, threads.date, users.username 
        FROM threads
        LEFT JOIN users ON users.id = threads.owner
        WHERE threads.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new InvariantError('Gagal mendapatkan thread');
    }
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
