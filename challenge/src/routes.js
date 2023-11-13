import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';
import csv from 'csv-parser';
import fs from 'fs'

const database = new Database

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search,
                completed_at: search,
                created_at: search,
                updated_at: search,
            } : null)

            return res
            .setHeader('Content-type', 'application/json')
            .end(JSON.stringify(tasks));
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const created_at = new Date();
            const  { title, description } = req.body
            const completed_at = null, updated_at = null;

            console.log(verifyTitleAndDescription({title, description}))
            if(verifyTitleAndDescription({title, description}) === 'valid') {

                const task = {
                    id: randomUUID(),
                    title,
                    description,
                    completed_at,
                    created_at,
                    updated_at,
                }

                database.insert('tasks', task)
        
                return res.writeHead(201).end();
            }
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body
            const selectededValues = database.select('tasks', {id});
            const completed_at = selectededValues[0].completed_at, created_at = selectededValues[0].created_at, updated_at = new Date();
            const tasks = database.select('tasks', {id});
            
            if(verifyExistingID(tasks)) {
                if(verifyTitleAndDescription({title, description}) === 'valid') {

                    database.update('tasks', id, {
                        title,
                        description,
                        completed_at,
                        created_at,
                        updated_at,
                    })
    
                    return res.writeHead(204).end()
                } else {
                    return res.writeHead(404).end(verifyTitleAndDescription({title, description}))
                }
            } else {
                return res.writeHead(404).end('ID inexistente!')
            }
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks/invite'),
        handler: async (req, res) => { 
            const filePath = 'C:\\Users\\Hugo\\Downloads\\Pasta1.csv'

            const tasks = []

            fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                console.log(row)

                tasks.push({
                    id: row.id,
                    title: row.title,
                    description: row.description,
                })
            })
            .on('end', () => {
                console.log('tasks:', tasks)
                
            })
            .on('error', (error) => {
                console.error('Erro ao ler o arquivo CSV', error.message);
            })


            return res.writeHead(204).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params
            updated_at = new Date();
            const tasks = database.select('tasks', {id});
            
            if(verifyExistingID(tasks)) {
                database.update('tasks', id, {
                    updated_at,
                })
                
                return res.writeHead(204).end()
            } else {
                
                return res.writeHead(404).end('ID inexistente!')
            }
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const tasks = database.select('tasks', {id});
            
            if(verifyExistingID(tasks)) {
                database.delete('tasks', id)

                return res.writeHead(204).end()
            } else {
                
                return res.writeHead(404).end('ID inexistente!')
            }
        }
    }
]

const verifyExistingID = (data) => {
    for(var prop in data){
        if(data.hasOwnProperty(prop)) return 'existID'
    }
}

const verifyTitleAndDescription = (data) => {
    const { title, description } = data
    let result = 'valid'

    if(title === null || title === undefined || title === "") 
        result = 'invalid title'
    if(description === null || description === undefined || description === "")
        result === 'invalid title' ? result += ' and invalid description' : result = 'invalid description'
    
    return result
}