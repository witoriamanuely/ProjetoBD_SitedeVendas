const selectUser = "SELECT * FROM projetobd.user WHERE email=$1";
const selectUserById = "SELECT * FROM projetobd.user WHERE id=$1";

function postgresLocal(pool) {
    let self = this;
    self.pool = pool;
    this.localStrategy =
        function (username, password, cb) {
            self.pool.connect((err, client, release) => {
                if (err) {
                    console.log('Error acquiring client', err.stack);
                    return cb(err);
                }
                client.query(selectUser, [username], (err, result) => {
                    if (err) {
                        console.log('Error when selecting user on login', err);
                        return cb(err);
                    }

                    if (result.rows.length > 0) {
                        const first = result.rows[0];
                        if (password === first.password) {
                            cb(null, {
                                id: first.id,
                                username: first.username
                            });
                        } else {
                            cb(null, false);
                        }
                    } else {
                        cb(null, false);
                    }
                });
            });
        }

    this.serializeUser = function (user, done) {
        done(null, user.id);
    }

    this.deserializeUser = function (id, cb) {
        self.pool.connect((err, client, release) => {
            if (err) {
                console.log('Error acquiring client', err.stack);
                return cb(err);
            }
            client.query(selectUserById, [parseInt(id, 10)], (err, results) => {
                client.release();
                if (err) {
                    console.log('Error when selecting user on session deserialize', err);
                    return cb(err);
                }

                cb(null, results.rows[0]);
            })
        });
    }

    return this;
}

module.exports = postgresLocal;