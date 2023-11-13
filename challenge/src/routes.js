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
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks/importCsvFile'),
        handler: async (req, res) => { 

            const filePath = "C:\\Users\\Hugo\\Development\\Projects\\Desafio-01-Node\\csvFile.csv"
            
            const tasks = [];
            
            const contentType = req.headers['content-type']
            
            if(contentType === 'text/csv'){
                fs.createReadStream(filePath, { encoding: 'utf-8' })
                .pipe(csv({
                    separator: ','
                }))
                .on('data', (row) => {
                    tasks.push(row)
                })
                .on('end', () => {
                    const databasePath = new URL('csvFile.json', import.meta.url)

                    database.insert('csvFile', tasks, databasePath)
                })
                .on('error', (error) => {
                    return res.writeHead.end(JSON.stringify({ error: 'Erro ao ler o arquivo CSV', error}));
                })

                return res.writeHead(204).end()
            } else {
                return res.writeHead(400).end('Arquivo CSV inválido!')
            }
        }
    },
    {
        method: 'GET',
        path: buildRoutePath('/tasks/getCsvFile'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('csvFile', search ? {
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