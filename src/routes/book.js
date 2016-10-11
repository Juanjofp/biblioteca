import express from 'express';
import config from '../config';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export default function(bookCollection) {

    var router = express.Router();

    router.get('/', function getBooks(req, res) {
        bookCollection.find({owner: req.user.username})
        .toArray()
        .then(
            (books) => {
                res.status(200).json(books);
            }
        );
    });

    router.post('/', function createBook(req, res) {
        //console.log('Req Create Book', req.body);
        let book = {
            owner: req.user.username,
            title: req.body.title,
            author: req.body.author,
            resume: req.body.resume,
            published: req.body.published,
            isbn: req.body.isbn,
            cover: req.body.cover
        };
        bookCollection.insertOne(book)
        .then(
            (data) => {
                console.log('Inserted', data.ops[0]);
                res.status(200).json(data.ops[0]);
            }
        )
        .catch(
            (err) => {
                res.status(500).json({
                    code: 500,
                    message: err.message
                });
            }
        );
    });

    router.get('/:username', function getBook(req, res) {
        res.status(200).json({
            currentUser: req.user,
            username: req.params.username
        });
    });

    router.put('/:bookid', function updateBook(req, res) {
        res.status(200).json({
            currentUser: req.user,
            username: req.params.username
        });
    });

    router.delete('/:bookid', function deleteBook(req, res) {
        console.log('Deleting', req.params.bookid);
        bookCollection.deleteOne({
            _id: ObjectId(req.params.bookid)
        })
        .then(
            (data) => {
                console.log('Book deleted', data.result);
                res.status(200).json({
                    _id: req.params.bookid,
                    removed: !!data.result.n
                });
            }
        )
        .catch(
            (err) => {
                res.status(500).json({
                    code: 500,
                    message: err.message
                });
            }
        );
    });

    return router;
}
