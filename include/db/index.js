var DB = function() {
    this.data = {
        query: null,
        param: Array(),
        exe_array: []
    };
    this.connection = null;
    this.openConnection = function() {}
    this.closeConnection = function() {}
    this.runQuery = function(callback) {
        var mysql = require('../../node_modules/mysql');
        var connection = mysql.createConnection({
            user: _DB['user'],
            database: _DB['database'],
            host: _DB['host'],
            password: _DB['password'],
            charset: 'UTF8MB4_GENERAL_CI',
            multipleStatements: true
        });
        var json = '';
        connection.query(this.data.query, this.data.param, function(err, res) {
            if (err) {
                console.log(err);
                connection.end(function() {
                    throw err;
                });
                return;
            }
            connection.end();
            callback(res);
        });
    };
    this.getInsertID = function(res) {
        return res.insertId;
    }
    this.transacQuery = function(retrieveQ, retrieveP, callback) {
        var mysql = require(_CONFIG['modules_path'] + '/mysql');
        var connection = mysql.createConnection({
            user: _DB['user'],
            database: _DB['database'],
            host: _DB['host'],
            password: _DB['password'],
            charset: 'UTF8MB4_GENERAL_CI'
        });
        var sql_query = this.data.query;
        var query_param = this.data.param;
        var retrieveRows = {};
        //nwLogging('info', {'data':{'sql':this.data.query,'sql_param':this.data.param}},_sql_logger);
        connection.beginTransaction(function(err) {
            if (retrieveQ != '' && retrieveP != '') {
                connection.query(retrieveQ, retrieveP, function(q_err, rows) {
                    if (q_err) {
                        throw q_err;
                    }
                    retrieveRows = rows;
                });
            }
            connection.query(sql_query, query_param, function(q_err, rows) {
                if (q_err) {
                    connection.rollback(function() {
                        throw err;
                    });
                }
                connection.commit(function(c_err) {
                    if (c_err) {
                        connection.rollback(function() {
                            throw c_err;
                        });
                    }
                    connection.end();
                    if (retrieveRows.length > 0) callback(retrieveRows);
                    else callback(rows);
                });
            });
        });
    }
};
module.exports = function() {
    var instance = new DB();
    return instance;
};