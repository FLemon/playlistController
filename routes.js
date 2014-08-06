// load the todo model
var Todo = require('./server/models/todos');
var Twit = require('./server/models/twits');

module.exports = function(app) {
  // API routes ===============

  app.get('/api/twits', function(req, res) {
    new Twit().get(req, res);  
  });

  app.get('/api/todos', function(req, res) {
    Todo.find(function(err, todos) {
      if (err) 
        res.send(err)
      res.json(todos);
    });
  });

  app.post('/api/todos', function(req, res) {
    Todo.create({
      text: req.body.text,
      done: false
    }, function(err, todo) {
      if (err)
        res.send(err);

      Todo.find(function(err, todos) {
        if (err) 
          res.send(err)
        res.json(todos);
      });
    });
  });

  app.delete('/api/todos/:todo_id', function(req, res) {
    Todo.remove({
      _id : req.params.todo_id 
    }, function(err, todo) {
      if (err) 
        res.send(err);

      Todo.find(function(err, todos) {
        if (err)
          res.send(err)
        res.json(todos);
      });
    });
  });

  //App route
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });
};
