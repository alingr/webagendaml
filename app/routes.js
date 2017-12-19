var Todo = require('./models/todo');
var nodemailer = require('nodemailer');

var mailService = process.env.MAILSERVICE || "gmail";
var mailUser = process.env.MAILUSER || "webagendaml@gmail.com";
var mailPassword = process.env.MAILPASSWORD || "Lexware1";
var mailFrom = process.env.MAILFROM || "webagendaml@gmail.com";
var mailTo = process.env.MAILTO || "mada81lina@yahoo.com, mada81lina@gmail.com";

function getTodos(res) {
    Todo.find(function (err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }

        res.json(todos); // return all todos in JSON format
    });
};

function sendMail(subject, content, res) {
    var transporter = nodemailer.createTransport({
        service: mailService,
        auth: {
            user: mailUser,
            pass: mailPassword
        }
    });

    var mailOptions = {
        from: mailFrom,
        to: mailTo,
        subject: subject,
        html: content
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.render('sendMailStatus', { status: error });
        } else {
            console.log('Email sent: ' + info.response);
            res.send('The email has been sent successfully!');
        }
    });
}

module.exports = function (app) {

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function (req, res) {
        // use mongoose to get all todos in the database
        getTodos(res);
    });

    // send mail get all todos
    app.post('/api/sendmail', function (req, res) {
        var mailSubject = "Web agenda ML - Backup data";
        var mailContent = "<b>";

        Todo.find(function (err, todos) {
                    if (err) {
                        res.send(err);
                    }
                    console.log("todos: "+ todos);
                    mailContent = mailContent + todos; // return all todos in JSON format
                    mailContent = mailContent.replace(/},{/g, "},<br/><br/>{")
                    console.log("mailContent: "+ mailContent);
                    sendMail(mailSubject, mailContent, res);
                });

    });

    // create todo and send back all todos after creation
    app.post('/api/todos', function (req, res) {

        // create a todo, information comes from AJAX request from Angular
        Todo.create({
            text: req.body.text,
            dueDate: req.body.dueDate,
            priority: req.body.priority,
            done: false
        }, function (err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            getTodos(res);
        });

    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function (req, res) {
        Todo.remove({
            _id: req.params.todo_id
        }, function (err, todo) {
            if (err)
                res.send(err);

            getTodos(res);
        });
    });

    // update a todo
    app.put('/api/todos/:todo_id/:isDone', function (req, res) {
        Todo.findByIdAndUpdate(req.params.todo_id, {
            $set: { isDone: req.params.isDone }
        }, { upsert: true }, function (err, todo) {
            if (err)
                res.send(err);

            getTodos(res);
        });
    });


    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
