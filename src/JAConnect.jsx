import React from 'react'

class JAObject {
    constructor(id, attributes, relationships){
        this.id = id // todo: check if the object with this id already exists in the redux store or the backend API
        this._attributes = attributes // this contains both attributes and relationships

        // TODO: add to redux store and save to jsonapi-backend

        for(let attr_name of Object.keys(attributes || {})){
            Object.defineProperty(this, attr_name, {
                get: function() { 
                    return this._attributes[attr_name]
                },
                set: function(value) { 
                    this._attributes[attr_name] = value
                    console.log('todo: sync jsonapi') // TODO: sync to jsonapi
                }
            })
        }

        for(let rel_name of Object.keys(relationships || {})){

            let relationship = relationships[rel_name]
            if (! relationship.data ){
                continue
            }

            this._attributes[rel_name] = relationship.data

            if(Array.isArray(relationship.data)){
                // TOMANY relationship
                Object.defineProperty(this, rel_name, {
                    get: function() { 
                        return this._attributes[rel_name] // this should return a list of objects
                    }
                })

                // add all the items to the relationship list
                this._attributes[rel_name] = relationship.data.map((data) => this.relationshipItem(data))
            }
            else { // null or {} => TOONE relationship
                Object.defineProperty(this, rel_name, {
                    get: function() {
                        return this._attributes[rel_name]
                    },
                    set: function() { 
                        return this._attributes[rel_name]
                    }
                })
                if(relationship.data) { 
                    this._attributes[rel_name] = this.relationshipItem(relationship.data)
                }
            }
        }
    }

    relationshipItem(data){
        /*
            Create instances of the related objects
            data : { id : xx, type: Xxx }
        */
        let ja_connect = JAConnect.session
        let type = data.type
        let id = data.id
        if( id && type){
            const rel_model = ja_connect.getModel(type)
            if(rel_model){
                let rel_object = new rel_model(id)
                console.log('Created related object ', rel_object)
                return rel_object
            }
            else {
                console.log('error')
            }
        }
        else {
            console.log('error: invalid id or type for', data)
        }
    }

    test(){
        return ' test ! ' + this.id
    }
}




class JAConnect {

    constructor(){
        this.models = {}
        JAConnect.session = this // todo: remove this!!
    }

    createModel(type){

        let _ja_connect = this
        class result_model extends JAObject {

            constructor(...args){
                super(...args)
                this.type = type
                
            }
        }

        Object.defineProperty(this, type, {
            get: function() {
                const _constructor = (...args) => new this.models[type](...args)
                return _constructor
            }
        })
        this.models[type] = result_model

        return result_model
    }

    getModel(type){

        if(this.models[type]){
            return this.models[type]
        }
        const model = this.createModel(type)
        return model
    }
}


function test(){

    //

    let ja_connect_session = new JAConnect()
    ja_connect_session.createModel('Books')
    ja_connect_session.createModel('Users')
    /*
    RESULT Models: 
    class User extends JAObject {
        constructor(...args){
            super(...args)
            this.type = 'Users' // This is the Json:Api type
        }
    }

    class Book extends JAObject {
        constructor(...args){
            super(...args)
            this.type = 'Books'
        }
    }
    */


    let book = ja_connect_session.Books( 'uuid-xxx-yyy' , { name: 'book_name' , user_id : null }, { })
    
    let book_relationships = { "user": {
                                  "data": {
                                    "id": "bdac8875-af1b-420a-a7fa-ff7f24326c7f", 
                                    "type": "Users"
                                  }, 
                                  "links": {
                                    "self": "/Books/16b84e86-1e51-42f1-90c7-31c6c33f2012/user"
                                  }, 
                                  "meta": {
                                    "direction": "MANYTOONE"
                                  }
                                }
                            }

    
    let book2 = ja_connect_session.Books( "16b84e86-1e51-42f1-90c7-31c6c33f2012", // id 
                          { name: 'book_name' , user_id : null }, // attributes
                          book_relationships ) 

    console.log(book2.user)

    let user_relationships = {
        "books": {
          "data": [
            {
              "id": "16b84e86-1e51-42f1-90c7-31c6c33f2012",
              "type": "Books"
            },
            {
              "id": "117354f6-e796-4a90-a6ae-d2385b530840",
              "type": "Books"
            }
          ],
          "links": {
            "self": "/Users/bdac8875-af1b-420a-a7fa-ff7f24326c7f/books"
          },
          "meta": {
            "count": 2,
            "direction": "ONETOMANY",
            "limit": "10"
          }
        }
    }

    let test_user = ja_connect_session.Users("bdac8875-af1b-420a-a7fa-ff7f24326c7f", {name : 'demo_user'}, user_relationships)
    console.log(ja_connect_session.Books)
    console.log(test_user.books[0].test())
    return test_user
}


test()


/*
// Ideally, we should be able to use our library like this:

import JAConnect from ‘ja-connect’

let session = JAConnect.Session() // => bootstrap connection: connect to jsonapi backend and create the models (User, Book etc)

const Users = session.Users
const my_user = Users.get(id) // check if the user is in the store first, in the backend second => our store is a cache for our backend. The backend is the truth

console.log(my_user.name)  // 
console.log(my_user.books) // => [ Object, Object ]
console.log(my_user.books[0].id) // => book_id

let my_book_id = my_user.books[0].id

const Books = session.Books
const my_book = Books.get(my_book_id)

console.log(my_book.user)
console.log(my_book.user.id)
console.log(my_book.user.name)
my_book.user.books[0] === my_book_id // => true

my_book.delete() // => delete book from redux store and jsonapi-backend
my_user.name = ‘test’ // => change name in store and on backend


*/

export {test as Ptest, JAConnect}
