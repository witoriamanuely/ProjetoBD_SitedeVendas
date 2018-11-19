
import moment from 'moment';
import uuidv4 from 'uuid/v4';
const user = {
  async create(req, res) {
    const text = `INSERT INTO
      user(ID, name, password, email, street, number, zip_code, neighborhood)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      returning *`;
    const values = [
      req.body.firstname +req.body.lastname,
      req.body.password,
      req.body.email,
      req.body.street,
      req.body.number,
      req.body.zip_code,
      req.body.neighborhood
    ];
  },
  async getAll(req, res) {
    const findAllQuery = 'SELECT * FROM user';
  },

  async getOne(req, res) {
    const text = 'SELECT * FROM user WHERE ID = $1';
  },
  
  async update(req, res) {
    const findOneQuery = 'SELECT * FROM user WHERE ID=$1';
    const updateOneQuery =`UPDATE user
      SET ID=$1, name=$2,password=$3,email=$4, street=$5, number=$6, zip_code=$7, neighborhood=$8
      WHERE ID=$1 returning *`;

  },
  
  async delete(req, res) {
    const deleteQuery = 'DELETE FROM reflections WHERE id=$1 returning *';
    
  }
  
}

export default user;